// TODO: test if that works
const fs = require('fs');

export default function handler(req, res) {
  // sisendist kood
  const userCode = req.body.code;
  const lesson = req.body.lesson;

  // juurde panna test case'id koos main funktsiooniga
  // kuidas tean, millisest test failist test case'id võtta? 
  // annan lessoni nime kaasa? ja loodan, et on sama nimega .yml _tests kaustas?

  const testCases = getTestCases(lesson);


  // tekitada .idr fail
  // TODO: kuidas js-iga faili kirjutada?

  // jooksutada dockerit koos eelnevalt loodud .idr failiga
  // TODO: uuri dockerode vms, mis dockeriga suhelda aitab

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
function getTestCases(lesson) {
  fs.readFile("../../_tests/" + lesson + ".yml", "utf-8", (err, data) => {
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

}