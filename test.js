const ArgParser = require('./src/text/argParser.js');
const Bot = require('./src/botk.js');
const fs = require('fs');

let testLine = 'bk t=rex,echo,5,arc,asd'
const argParser = new ArgParser(testLine.split(' '), 'index');

if (argParser.isValid == true) {
    const bot = new Bot(argParser.commandResult, argParser.recipients, process.env.myId);
    bot.Exec()
    .then(result => result.body)
    .then(message => message)
    .then(path => {
      // fs.unlink(path, (err) => {
      //   if (err) { throw err; }
      // });
    })
    .catch (e => {
      console.log('test:34 ', e.message);
    });
}
else {
  console.log('argomenti non validi');
}