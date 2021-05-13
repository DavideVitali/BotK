/* -------------------------------------
    In questo modulo si possono testare 
    le funzionalità singolarmente
    -----------------------------------*/

const axios = require('axios');
const TextHelper = require('./src/text/textHelper.js')
const ImageProcessor = require('./src/img/processor.js')
const Swapi = require('./src/api/swgohApi.js')
const Jimp = require('jimp');
const swapi = new Swapi();
const fetch = require('node-fetch');

/**
 * param {Array<string>} members - Array dei codici alleato dei membri della Gilda.
 */
function guildTeamStats(teamList, members) {

  const promises = [];
  var result = [];
  promises.push(textHelper.findAbbreviated(teamList));
  promises.push(swapi.playersInfo(members));
    
  return Promise.all(promises)
  .then(promiseResults => {
    promiseResults[1].forEach(member => {
      var orderedRoster = new Array(5);
      var trimmedRoster = [];

      var filteredRoster = member.roster.filter(unit => promiseResults[0].includes(unit.defId)).map(e => {        
        var i = promiseResults[0].indexOf(e.defId);
        orderedRoster[i] = e;
      });
      
      orderedRoster.map(o => {
        if (o) {
          trimmedRoster.push(o);
        }
      });

      result.push({
        "allyCode": member.allyCode,
        "name": member.name,
        "units": trimmedRoster
      });

    });
    return result;
  })
  .catch(err => { throw err; });
}

function guildTeamImage(paths) {
  const HEIGHT = paths.length * 155;
  const WIDTH = 640;

  return new Promise(async (resolve, reject) => {
    var background = await Jimp.read(WIDTH, HEIGHT, 0x00ffffff);
    for (let i = 0; i < paths.length; i++) {
        background.blit((await Jimp.read(paths[i])), 0, i * 155);
    };

    var timestamp = new Date().getTime();
    path = './src/img/processresult/_' + String(timestamp) + '.png'
    background.write(path);
    resolve(path);
  });
}

const textHelper = new TextHelper();
const processor = new ImageProcessor();
var startTime = (new Date()).getTime();

console.log('Inizio operazioni: richiamo i membri della gilda');
swapi.guildMembers('914315138')
.then(members => {
  console.log('Fin qui impiegati ' + String((new Date()).getTime() - startTime) + 'ms. Inizio a prendere le stat dei personaggi per ogni membro della gilda');
  var players = members.map(m => m.allyCode);
  var teamList = ['DR','BSF','HK','PREDATORE','MALAK'];
  //var teamList = ['CLS','HAN','CIUBE','C3PO','3POCIUBE'];
  return guildTeamStats(teamList, players);
})
.then(guildMembers => {
  membersWithPortraits = [];
  console.log('Fin qui impiegati ' + String((new Date()).getTime() - startTime) + 'ms. Inizio a preparare le promise dei ritratti di team per ciascun membro della gilda');
  guildMembers.forEach(member => {
    membersWithPortraits.push({
      "allyCode": member.allyCode,
      "name": member.name,
      "units": member.units,
      "portrait": processor.getImage(member.units, 'inline', member.name, member.allyCode)
    });
  });
  return membersWithPortraits;
})
.then(guildMember => {
  console.log('Fin qui impiegati ' + String((new Date()).getTime() - startTime) + 'ms. Aggrego le promise dei ritratti di team per ciascun membro della gilda');
  promises = [];
  guildMember.forEach(m => {
    promises.push(m.portrait);
  });

  return promises;
})
.then(promises => {
  console.log('Fin qui impiegati ' + String((new Date()).getTime() - startTime) + 'ms. Inizio a risolvere le promise');
  return Promise.all(promises)
})
.then(paths => {
  console.log(paths);
  return guildTeamImage(paths);
})
.then(finalPath => console.log(finalPath))
.catch(e => console.log(e));
