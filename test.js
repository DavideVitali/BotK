const ArgParser = require('./src/text/argParser.js');
const Bot = require('./src/botk.js');
const fs = require('fs');

let testLine = 'bk t=DR,malak,bsf,predatore,hk47 g=1'
const argParser = new ArgParser(testLine.split(' '), 'index');

if (argParser.isValid == true) {
    try {
        const bot = new Bot(argParser.commandResult, argParser.recipients, process.env.myId);
        bot.Exec()
        .then(result => {
          console.log(result);
          Promise.resolve(result.body)
          .then(bodyMessage => {
            Promise.resolve(bodyMessage)
            .then(r => {
              // fs.unlink(bodyMessage, (err) => {
              //   if (err) { throw err; }
              // });
            });
          })
          .catch(e => {
            throw e;
          });    
        })
        .catch(e => {
          throw e;
        });
    } catch (e) {
      console.log(e.message);
    }
}
else {
  console.log('argomenti non validi');
}