const ArgParser = require('./src/text/argParser.js');
const Bot = require('./src/botk.js');
const Swapi = require('./src/api/swgohApi.js');
const fetch = require('node-fetch');
const TextHelper = require('./src/text/textHelper.js')
let textHelper = new TextHelper();
let swapi = new Swapi();
let statCalculator = require('swgoh-stat-calc');


let testLine = 'bk t=SEE,palpa,vader,malak,drevan s=1'
const argParser = new ArgParser(testLine.split(' '), 'index');

if (argParser.isValid == true) {
    const bot = new Bot(argParser.commandResult, argParser.recipients, process.env.myId);
    bot.Exec()
    .then(result => result.body)
    .then(message => message)
    .then(path => console.log(path))
    .catch (e => {
      console.log(e);
    });
}
else {
  console.log('argomenti non validi');
}


// function getFullStats (allyCode, defId) {
//   return Promise.all([
//     swapi.playersInfo('914315138'),
//     fetch('https://swgoh-stat-calc.glitch.me/gameData.json').then(r => r.json())
//   ])
//   .then(result => {
//     let playerStats = result[0];
//     let gameData = result[1];

//     unit = playerStats[0].roster.find(entities => entities.defId == defId);
//     statCalculator.setGameData( gameData );
//     console.log(statCalculator.calcCharStats( unit, { 
//       gameStyle: true,
//       language: textHelper.StatsTable
//     }));
//   });
// }

// getFullStats('914315138', 'SITHPALPATINE');
