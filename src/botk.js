/*
        questo modulo è di test quando non si vuole mandare roba al bot vero e proprio (index.js)
*/
const Swapi = require('./_apiModules/swgohApi.js');
const TextHelper = require('./_textModules/textHelper.js');
const DbOperations = require('./_dataModules/dbOperations.js');

class BotK {
    /*
    Gli argomenti passati alla classe come costruttore sono un json di questa forma
    {
        command: 'bk' 
        'opzione1': 'valore',
        'opzione2': 'valore'
        .
        .
        'opzioneN': 'valore'
    }
    dove command è il comando riconosciuto per avviare l'interazione con il bot
    mentre le opzioni sono le varie flag mandate al bot tramite --opzione.

    Quindi, ad esempio il comando 'bk --a:123456789 --team:slkr,kru,hux' genererà questo json
    {
        'command': 'bk',
        'a': '123456789',
        'team': 'slkr,kru,hux'
    }
    */
    constructor(args, userDiscordId) {
        this.args = args;
        this.discordId = userDiscordId
    }
    
    Exec() {
        // connessione ai moduli ausiliari
        let textHelper = new TextHelper();
        let dbOperations = new DbOperations();

        // connessione alle api di swgoh
        let swapi = new Swapi();
        
        /*
        <summary>Restituisce le info e il roster di un player in formato JSON</summary>
        <param "allyCode">Codice Alleato del player</param>
        <param "mock">**NON USARE IN PRODUZIONE!!!!* Se true, il roster viene estratto da ./_apiModules/mockPlayerInfo.json, per bypassare eventuali restrizioni imposte dal proxy</param>
        <remarks>restituisce una promise</remarks>
        var playerInfo = swapi.playerInfo(allyCode: <int>, mock: <bool>)
        */
        //var playerInfo = swapi.playerInfo(914315138, true).then(r => console.log(r)).catch(e => console.log(e))
       
        /*
        <summary>Restituisce l'array degli BASE_ID dei personaggi immessi dall'utente sotto forma di abbreviazione o nickname</summary>
        <param "teamList">Array dei personaggi immessi dal giocatore</param>
        <remarks>restituisce una promise</remarks>
        var idArray = textHelper.findAbbreviater(teamList: [<string>])
        */
        
        if (this.args.command === 'bk')
        {
            return dbOperations.searchUser(this.discordId)
            .then(dbUser =>  {
                console.log('il codice alleato corrispondente è: ', dbUser.allyCode);
                if (this.args.team || this.args.t)
                {
                    var teamValue = this.args.team || this.args.t;
    
                    var allyCode = this.args.ally || this.args.a;
                    if (!allyCode) {
                        allyCode = dbUser.allyCode;
                    }
    
                    var teamList = teamValue.split(',');
                    return Promise.all([
                        textHelper.findAbbreviated(teamList), 
                        swapi.playerInfo(allyCode)])
                        .then(promiseResults => {
                            var selectedCharacters = [];
                            var result = '';
                            for (var baseId of promiseResults[0]) {
                                for (var unit of promiseResults[1].units) {
                                    if (unit.data.base_id === baseId) {
                                        selectedCharacters.push(unit);
                                    }
                                }
                            }
    
                            selectedCharacters.map(c => {
                                var gear;
                                if (Number(c.data.gear_level) >= 13) {
                                    gear = "R" + String(Number(c.data.relic_tier) - 2);
                                } else {
                                    gear = "G" + c.data.gear_level;
                                }
                                result = result + c.data.name + ": " + c.data.rarity + '* | ' + gear + ' | ' + String(c.data.zeta_abilities.length) + 'z | v. ' + c.data.stats['5'] + '\n';
                            });
    
                            return result;
                        })
                        .catch(err => {
                            if (err.response && err.response.status == '404' && err.response.config.url.includes('swgoh.gg/api/player/')) {
                                return ('Il codice alleato richiesto è inesistente.');
                            }
                            return err;
                        });
                } else if (this.args.defense || this.args.d ) { 
                    return new Promise((resolve, reject) => reject("Opzione difesa non ancora implementata."));
                } else {
                    return new Promise((resolve, reject) => reject("Opzione non riconosciuta. Digita 'bk --h' per ottenere l'aiuto in linea"));
                }
            })
            .catch(err => err);
        }
    }
}

module.exports = BotK;