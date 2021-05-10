/* -------------------------------
    DA LOCAL
    ----------------------------*/

class ArgParser {
    // inputArgs è un array e corrisponde a process.argv nel caso di chiamata da console, oppure da message.content.split(' ') nel caso di chiamata da discord
    /**
     * 
     * @param {Array<String>} inputArgs - l'array di comando e opzioni digitati dall'utente 
     * @param {['local', 'index']} src - la sorgente del comando: 'local' per le chiamate da console, 'index' per le chiamate tramite discord.
     */
    constructor(inputArgs, src){
        this.commandResult = new Object();
        this.recipients = [];
        this.isValid = true;
        this.isCommand = false;

        // oggetto che memorizza il comando e le opzioni coi loro valori
        this.commandResult.command = inputArgs[0];
        
        if (this.commandResult.command && this.commandResult.command.toUpperCase() == 'BK')
        {
            this.isCommand = true;
            var optionArgs = [];
        
            // array che esamina solo le opzioni
            if (inputArgs.length > 0) {
                optionArgs = inputArgs.slice(1);
            } else {
                optionArgs = inputArgs;
            }

            var currentOptionValid = true;
            const mentionRegex = /^([<][@])([0-9]){18}[>]$/g;
            for (let i = 0; i < optionArgs.length; i++)  {
                if (optionArgs[i].includes('=')) {
                    var option = optionArgs[i].split('=');
    
                    if (!option[1]) {
                        this.commandResult[option[0]] = '';
                    } else {
                        this.commandResult[option[0]] = option[1].toUpperCase();
                    }

                    if (!option[0] || !option[1]) {
                        currentOptionValid = false;
                    } else {
                      option[0] = option[0].toUpperCase();
                    }
                } else if (optionArgs[i].match(mentionRegex)) {
                  this.recipients.push(optionArgs[i].replace(/([<@>])/g, ''));
                }
                
                if (currentOptionValid == false) { 
                    this.isValid = false;
                    break;
                }
            }

            // andrebbero controllate le opzioni, che siano tra quelle valide
        } else {
            this.isValid = false;
        }
    }
}

module.exports = ArgParser;