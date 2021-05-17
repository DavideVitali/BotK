const ArgParser = require('./src/text/argParser.js');
const Bot = require('./src/botk.js');
const fs = require('fs');

let testLine = 'bk t=dr,malak g=1 a=899715175'
const argParser = new ArgParser(testLine.split(' '), 'index');

if (argParser.isValid == true) {
    const bot = new Bot(argParser.commandResult, argParser.recipients, process.env.myId);
    bot.Exec()
    .then(result => result.body)
    .then(message => message)
    .then(path => console.log(path))
    .catch (e => {
      console.log('test:34 ', e);
    });
}
else {
  console.log('argomenti non validi');
}