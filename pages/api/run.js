import { test } from 'gray-matter';
import { formatTerminalOutput } from '../../lib/format-terminal';

const fs = require('fs/promises');
const { exec } = require('child_process');
const yaml = require('js-yaml');

const checkCompilePassText = "Learn Idris App test result:";

export default async function handler(req, res) {
  const userCode = req.body.code;
  const lessonId = req.body.lessonId;
  
  const testCases = await getTestCases(lessonId);
  const testResults = [];

  for (const group of testCases.groups) {
    const funName = group.function;
    
    for (const testCase of group.test) {
      const input = testCase.parameters;
      const testCode = `${userCode}\n\nmain : IO ()\nmain = do\n\tputStrLn ("${checkCompilePassText}")\n\tputStrLn (show (${funName} ${input}))\n`;

      const result = await runTestWithDocker(testCode);
      const match = result.match(new RegExp(`^${checkCompilePassText}\n(.*)`, 's'));
      console.log(match);
      
      if (match === null) {
        testResults.push({
          funName,
          passed: false,
          content: formatTerminalOutput(result)
        });
        continue;
      }
      const actual = match[1].trim();
      const expected = testCase.output;
      
      if (actual === expected.toString()) {
        testResults.push({
          funName,
          passed: true
        });
      } else {
        const feedback = `Input: ${input}<br>Expected: ${expected}<br>Actual: ${actual}`

        testResults.push({
          funName,
          passed: false,
          content: feedback,
        });
      }
    }
  }

  res.status(200).send(testResults);
}

async function runTestWithDocker(test) {
  return new Promise((resolve, reject) => {
    const docker = exec('docker run -i idris', (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }

      const output = `${stdout}\n${stderr}`;
      
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