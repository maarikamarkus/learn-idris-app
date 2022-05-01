import { formatTerminalOutput } from '../../lib/format-terminal';

const fs = require('fs/promises');
const { exec } = require('child_process');
const yaml = require('js-yaml');
const pool = require('generic-pool');

const checkCompilePassText = "Learn Idris App test result:";
const myPool = createContainerPool();

export default async function handler(req, res) {
  const startTimeMs = Date.now();
  const userCode = req.body.code;
  const lessonId = req.body.lessonId;

  const testCases = await getTestCases(lessonId);
  const testResults = [];

  const containerName = await myPool.acquire();
  console.log('Container name: ', containerName);
  for (const group of testCases.groups) {
    const funName = group.function;
    const funType = group.type ?? 'pure';
    
    for (const testCase of group.test) {
      const input = testCase.parameters;
      const testCode = getTestCode(userCode, funType, funName, input);
      
      let result;
      try {
        result = await runTestWithDocker(testCode, containerName);
      } catch (e) {
        testResults.push({
          funName,
          passed: false,
          content: formatTerminalOutput(e)
        });
        continue;
      } 
      
      const match = result.match(new RegExp(`${checkCompilePassText}\n(.*)`, 's'));
      
      if (match === null) {
        testResults.push({
          funName,
          passed: false,
          content: formatTerminalOutput(result)
        });
        continue;
      }
      const actual = match[1].trim();
      const expected = testCase.output.toString().replaceAll('\\n', '\n');
      
      if (actual === expected.toString()) {
        testResults.push({
          funName,
          passed: true
        });
      } else {
        const feedback = `Sisend: ${input}<br>Oodatud: ${expected}<br>Tegelik: ${actual}`

        testResults.push({
          funName,
          passed: false,
          content: feedback,
        });
      }
    }
  }
  await myPool.destroy(containerName);

  const lessonPassed = testResults.every(({ passed }) => passed);
  const execDuration = Date.now() - startTimeMs;
  console.log(`Tests running time: ${execDuration} ms`);
  res.status(200).send({testResults, lessonPassed});
}

function createContainerPool() {
  const factory = {
    create: function() {
      return createContainer();
    },
    destroy: function(containerName) {
      destroyContainer(containerName);
    }
  };

  const opts = {
    max: 5,
    min: 1,
  };

  return pool.createPool(factory, opts);
}

function createContainer() {
  return new Promise((resolve, reject) => {
    exec('docker run -d -it idris sh', (err, stdout, stderr) => {
      const output = `${stdout}`;

      if (err) {
        reject(output);
        return;
      }
      
      resolve(output);
    });
  });
}

function destroyContainer(containerName) {
  new Promise((resolve, reject) => {
    exec(`docker rm -f ${containerName}`, (err, stdout, stderr) => {
      const output = `Destroying...\n${stdout}\n${stderr}`;
      console.log(output);
      if (err) {
        reject(output);
        return;
      }
      
      resolve(output);
    });
  });
}

async function runTestWithDocker(test, containerName) {
  return new Promise(async (resolve, reject) => {
    const docker = exec(`docker exec -i ${containerName.trim()} sh evaluate.sh`, (err, stdout, stderr) => {
      const output = `${stdout}\n${stderr}`;

      if (err) {
        reject(output);
        return;
      }
      
      resolve(output);
    });
    docker.stdin.write(test, () => {
      docker.stdin.end();
    });
  });
}

async function getTestCases(lessonId) {
  return yaml.load(await fs.readFile("_tests/" + lessonId + ".yml", "utf-8"));
}