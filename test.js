const ArgParser = require('./src/text/argParser.js');
const Bot = require('./src/botk.js');

let testLine = 'bk t=padme,anakin,ahsoka,gk,c3po g=0 f=inline'
const argParser = new ArgParser(testLine.split(' '), 'index');

if (argParser.isValid == true) {
    try {
        const bot = new Bot(argParser.commandResult, argParser.recipients, process.env.myId);
        bot.Exec()
        .then(result => {
          console.log(result);
          Promise.resolve(result.body)
          .then(bodyMessage => {
            console.log(bodyMessage);
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