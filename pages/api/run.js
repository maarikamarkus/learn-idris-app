import { formatTerminalOutput } from '../../lib/format-terminal';

const fs = require('fs/promises');
const { exec } = require('child_process');
const yaml = require('js-yaml');

export default async function handler(req, res) {
  const userCode = req.body.code;
  const lessonId = req.body.lessonId;
  
  
  //const testCases = getTestCases(lessonId);
  const testCode = await generateTestCode(userCode, lessonId);
  
  // jooksutada dockerit koos eelnevalt loodud testkoodiga
  // TODO: uuri dockerode vms, mis dockeriga suhelda aitab
  const docker = exec('docker run -i idris', (err, stdout, stderr) => {
    const output = formatTerminalOutput(`${stdout}\n${stderr}`);
    res.status(200).send(output);
  });
  docker.stdin.write(testCode, () => {
    docker.stdin.end();
  });
  
  // lugeda dockeri väljund
  // TODO: dockerode aitab?

  // kontrollida tulemusi
  // TODO: tekitada äkki mingi testimis util, et pärast oleks hea välja lugeda,
  // mis õnnestusid ja kui ei õnnestunud, siis mis oli konkreetsete sisenditega
  // tulemus vs oodatud tulemus

  // iga funktsiooni kohta [kõik hästi, osad hästi, kõik halvasti]

  // kasutajale tagasiside, mis läks halvasti

  // kui kõik hästi, siis ei pea eriti midagi tegema
}

async function getTestCases(lessonId) {
  return fs.readFile("_tests/" + lessonId + ".yml", "utf-8");
}

function parseTestCases(data) {
  const testCases = [];

  try {
    const doc = yaml.load(data);

    for (const group of doc.groups) {
      const funName = group.function;

      for (const testCase of group.test) {
        const input = testCase.parameters;
        const output = testCase.output;

        testCases.push({funName, input, output});
      }
    }

  } catch (e) {
    console.log(e);
  }

  return testCases;
}

async function generateTestCode(userCode, lessonId) {
  const data = await getTestCases(lessonId);

  let testCode = `${userCode}\n\nmain : IO ()\nmain = do\n`;

  try {
    const doc = yaml.load(data);

    for (const group of doc.groups) {
      const funName = group.function;

      for (const testCase of group.test) {
        const input = testCase.parameters;

        testCode += `\tputStrLn (\"${funName} \" ++ show (${funName} ${input}))\n`;
      }
    }

  } catch (e) {
    console.log(e);
  }

  return testCode;
}