/* -------------------------------------
    In questo modulo si possono testare 
    le funzionalità singolarmente
    -----------------------------------*/

const axios = require('axios');
const TextHelper = require('./src/text/textHelper.js')
const ImageProcessor = require('./src/img/processor.js')
const Swapi = require('./src/api/swgohApi.js')
const swapi = new Swapi();
const fetch = require('node-fetch');

/**
 * param {Array<string>} members - Array dei codici alleato dei membri della Gilda.
 */
function guildTeamImage(teamList, members) {
  const textHelper = new TextHelper();
  const processor = new ImageProcessor();
  const promises = [];
  
  promises.push(textHelper.findAbbreviated(teamList));
  promises.push(swapi.playersInfo(members));
    
  return Promise.all(promises)
  .then(promiseResults => {
    var selectedCharacters = [];
      for (var baseId of promiseResults[0]) {
          for (var unit of promiseResults[1].units) {
              if (unit.data.base_id === baseId) {
                  selectedCharacters.push(unit);
              }
          }
      }
      selectedCharacters.filter(c => {
          return c.base_id;
      });
      
      console.log(promiseResult[1][0]);
  });
}

cl("cerco i membri della gilda")
swapi.guildMembers('914315138')
.then(members => {
  cl("Ricevuto l'elenco dei membri");
  var players = members.map(m => m.allyCode);
  var teamList = ['CLS','HAN','CIUBE','C3PO','3POCIUBE'];
  cl("chiamo guildTeamImage");
  guildTeamImage(teamList, players);
});

function cl(msg)
{
  console.log(msg);
}

// roster('914315138').then(r => {
//   console.log(r[0].roster);
//   /**
//    * base_id = defId,
//    * relic.currentTier - 2;
//    * rarity
//    * level
//    * gear
//    * skills.filter(skill => skill.isZeta == true && skill.tiers == skill.tier);
//    */
   
//   r[0].roster.forEach(e => {
//     var zetas = e.skills.filter(skill => skill.isZeta == true && skill.tiers == skill.tier);
//     console.log('defId: ', e.defId, 'zeta: ', zetas.length);
//   });
// });