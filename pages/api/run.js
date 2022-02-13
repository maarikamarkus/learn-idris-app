
// TODO: test if that works
const fs = require('fs');
const { exec } = require('child_process');

export default function handler(req, res) {
  //console.log(req.body);
  
  // sisendist kood
  const userCode = req.body.code;
  const lessonId = req.body.lessonId;
  
  // juurde panna test case'id koos main funktsiooniga
  // kuidas tean, millisest test failist test case'id võtta? 
  // annan lessoni nime kaasa? ja loodan, et on sama nimega .yml _tests kaustas?
  
  const testCases = getTestCases(lessonId);
  
  
  // tekitada .idr fail --> tglt koosta sõne muutujasse
  // TODO: kuidas js-iga faili kirjutada?
  const testCode = userCode;
  
  // jooksutada dockerit koos eelnevalt loodud .idr failiga
  // TODO: uuri dockerode vms, mis dockeriga suhelda aitab
  const docker = exec('docker run -i idris', (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);

    res.status(200).send("hästi:)");
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

// TODO: test that fs works
function getTestCases(lessonId) {
  fs.readFile("_tests/" + lessonId + ".yml", "utf-8", (err, data) => {
    if (err) {
      // TODO: find a better way
      console.error(err);
      return;
    }

    return parseTestCases(data);
  });
}

function parseTestCases(data) {
  // TODO: otsi mõni teek, millega yml parsida
  return data;
}