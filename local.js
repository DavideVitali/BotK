const TextHelper = require('./src/_textModules/textHelper.js');
const BotK = require('./src/botk.js');
const ArgParser = require('./src/_textModules/argParser.js');

var argParser = new ArgParser(process.argv.slice(2), 'local');
var textHelper = new TextHelper();

if (argParser.isValid == true) {
    const bot = new BotK(argParser.commandResult, textHelper.getSecrets().discord.myId);
    bot.Exec()
    .then(result => console.log(result))
    .catch(error => console.log(error));
}