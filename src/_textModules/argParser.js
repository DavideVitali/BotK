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
        this.isValid = true;

        // oggetto che memorizza il comando e le opzioni coi loro valori
        this.commandResult.command = inputArgs[0];
        
        if (this.commandResult.command && this.commandResult.command.toUpperCase() == 'BK')
        {
            var optionArgs = [];
        
            // array che esamina solo le opzioni
            if (inputArgs.length > 0) {
                optionArgs = inputArgs.slice(1);
            } else {
                optionArgs = inputArgs;
            }

            var currentOptionValid = true;
            for (let i = 0; i < optionArgs.length; i++)  {
                if (optionArgs[i].includes('=')) {
                    var option = optionArgs[i].split('=');
    
                    if (!option[1]) {
                        this.commandResult[option[0]] = '';
                    } else {
                        this.commandResult[option[0]] = option[1];
                    }

                    if (!option[0] || !option[1]) {
                        currentOptionValid = false;
                    }
                } 
                
                if (currentOptionValid == false) { 
                    this.isValid = false;
                    break;
                }
            }
        }
    }
}

module.exports = ArgParser;