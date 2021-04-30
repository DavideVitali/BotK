const BotK = require('./src/botk.js')

// bool finale che decide se il comando digitato è valido
var validEntry = true;

// elimina node.exe e il nome del file
var inputArgs = process.argv.slice(2);

// oggetto che memorizza il comando e le opzioni coi loro valori
var botCommandLine = new Object();
botCommandLine.command = inputArgs[0];

var optionArgs = [];

// array che esamina solo le opzioni
if (inputArgs.length > 0) {
    optionArgs = inputArgs.slice(1);
} else {
    optionArgs = inputArgs;
}

if (botCommandLine.command && botCommandLine.command.toUpperCase() == 'BK')
{
    console.log('optionArgs:', optionArgs);
    for (let i = 0; i < optionArgs.length; i++)  {
        if (optionArgs[i].substring(0, 1) !== '-') {
            botCommandLine.error = (String(optionArgs[i]) + " non è un'opzione valida.");
            validEntry = false;
        } else {
            var option = optionArgs[i].substring(1).split(':');
            if (!option[1]) {
                botCommandLine[option[0]] = '';
            } else {
                botCommandLine[option[0]] = option[1];
            }
        }
        if (validEntry == false) { break; }
    }
    
    if (validEntry == true) {
        console.log('botCommandLine:', botCommandLine);
        const bot = new BotK(botCommandLine);
        bot.Exec()
        .then(result => console.log(result))
        .catch(error => console.log(error));
    }
}