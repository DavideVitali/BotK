const BotK = require('./src/botk.js')
var parsedArgs = new Object();
var args = process.argv.slice(2);

var validEntry = true;
parsedArgs.command = args[0];

if (parsedArgs.length == 1) {
    args = parsedArgs;
} else {
    args = parsedArgs.slice(1);
}

for (var entry of args)  {
    if (entry.substring(0, 1) !== '-') {
        console.log(String(entry) + " non è un'opzione valida.");
        validEntry = false;
    } else {
        var option = entry.substring(1).split(':');
        if (!option[1]) {
            parsedArgs[option[0]] = '';
        } else {
            parsedArgs[option[0]] = option[1];
        }
    }
    if (validEntry == false) { break; }
}

if (validEntry == true) {
    const bot = new BotK(parsedArgs);
    bot.Exec()
    .then(result => console.log(result))
    .catch(error => console.log(error));
}
