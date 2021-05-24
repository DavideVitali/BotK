const ArgParser = require('./src/text/argParser.js');
const Bot = require('./src/botk.js');
const Swapi = require('./src/api/swgohApi.js');
const fetch = require('node-fetch');
const TextHelper = require('./src/text/textHelper.js')
let textHelper = new TextHelper();
let swapi = new Swapi();
let statCalculator = require('swgoh-stat-calc');

var testLine = 'bk abbr=?';
const argParser = new ArgParser(testLine.split(' '), 'index');

if (argParser.isValid == true) {
    const bot = new Bot(argParser.commandResult, argParser.recipients, process.env.myId);
    bot.Exec()
    .then(result => result.body)
    .then(message => message)
      // console.log(message.length);
      //   message.forEach(m => {
      //     console.log('*********PARTE DI MESSAGGIO*****************', m);
      //     //var msgBody = '<@' + message.author.id + '>\n' + m;
      //     //message.channel.send(embeddedMessage(colorContext.success, '', msgBody));
      //     //message.react('✅');                  
      //   });
      // })
    //.then(path => console.log(path))
    .catch (e => {
      console.log(e);
    });
}
else {
  console.log('argomenti non validi');
}