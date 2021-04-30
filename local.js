const BotK = require('./src/botk.js');
const ArgParser = require('./src/_textModules/argParser.js');

// bool finale che decide se il comando digitato è valido
var validEntry = true;

var argParser = new ArgParser(process.argv.slice(2), 'local');

if (argParser.isValid == true) {
    console.log('da local.js: ', argParser.commandResult);
    const bot = new BotK(botCommandLine);
    bot.Exec()
    .then(result => console.log(result))
    .catch(error => console.log(error));
}