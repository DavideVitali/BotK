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
const statCalculator = require('swgoh-stat-calc');

/**
 * param {Array<string>} members - Array dei codici alleato dei membri della Gilda.
 */
function guildTeamStats(teamList, members, orderBy) {
  let gameData = await (await ).json();
  statCalculator.setGameData( gameData );
  console.log('calculator set');

  const promises = [];

  promises.push(fetch('https://swgoh-stat-calc.glitch.me/gameData.json').json());
  promises.push(textHelper.findAbbreviated(teamList));
  promises.push(swapi.playersInfo(members));
    
  return Promise.all(promises)
  .then(promiseResults => {
    let gameData = promiseResults[0];
    let ids = promiseResults[1];
    let members = promiseResults[2];

    statCalculator.setGameData( gameData );
    
    var result = [];
    members.forEach(member => {
      var orderedRoster = new Array(5);
      var trimmedRoster = [];
      var totalGp = 0;

      var filteredRoster = member.roster.filter(unit => ids.includes(unit.defId)).map(e => {        
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
        "units": trimmedRoster,
        "totalGp": totalGp
      });
    });

    if (orderBy == "p") {
      return result.sort((f, s) => s.totalGp - f.totalGp);
    } else {
      return result.sort((f, s) => f.name.toUpperCase() - s.name.toUpperCase() ? -1 : 1);
    }
  })
  .catch(err => { throw err; });
}

function guildTeamImage(paths) {
  // scalato dello 0.75
  const HEIGHT = paths.length * 124;
  const WIDTH = 480;

  return new Promise(async (resolve, reject) => {
    var background = await Jimp.read(WIDTH, HEIGHT, 0x00ffffff);
    for (let i = 0; i < paths.length; i++) {
        background.blit((await Jimp.read(paths[i])), 0, i * 124);
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

console.log('Inizio delle operazioni.');
swapi.guildMembers('914315138')
.then(members => {
  // console.log('Fin qui impiegati ' + String((new Date()).getTime() - startTime) + 'ms. Inizio a prendere le stat dei personaggi per ogni membro della gilda');
  var players = members.map(m => m.allyCode);
  var teamList = ['GBA','SUNFAC','SOLDATOGEO','POGGLE','SPIA'];
  //var teamList = ['JML','SLKR','REY','SEE'];
  //var teamList = ['DR','BSF','HK','PREDATORE','MALAK'];
  return guildTeamStats(teamList, players, 'p');
})
.then(guildMembers => {
  membersWithPortraits = [];
  // console.log('Fin qui impiegati ' + String((new Date()).getTime() - startTime) + 'ms. Inizio a preparare le promise dei ritratti di team per ciascun membro della gilda');
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
  // console.log('Fin qui impiegati ' + String((new Date()).getTime() - startTime) + 'ms. Aggrego le promise dei ritratti di team per ciascun membro della gilda');
  promises = [];
  guildMember.forEach(m => {
    promises.push(m.portrait);
  });

  return promises;
})
.then(promises => {
  // console.log('Fin qui impiegati ' + String((new Date()).getTime() - startTime) + 'ms. Inizio a risolvere le promise');
  return Promise.all(promises)
})
.then(paths => {
  return guildTeamImage(paths);
})
.then(finalPath => {
  console.log(finalPath);
  console.log('Operazioni concluse in ' + String((new Date()).getTime() - startTime) + ' ms.');
})
.catch(e => console.log(e));
