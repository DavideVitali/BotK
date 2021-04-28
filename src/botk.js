/*
        questo modulo è di test quando non si vuole mandare roba al bot vero e proprio (index.js)
*/
const Swapi = require('./_apiModules/swgohApi.js');
const TextHelper = require('./_textModules/textHelper.js');
const MongoClient = require('mongodb').MongoClient;

class BotK {
    constructor(args) {
        this.args = args;
    }
    
    Exec() {
        // connessione ai moduli ausiliari
        let textHelper = new TextHelper();

        // connessione alle api di swgoh
        let swapi = new Swapi();

        // connessione al db
        const dbSecrets = textHelper.getSecrets().mongodb; 
        const dbDomain = dbSecrets.domain;
        const dbNamespace = dbSecrets.namespace;
        const dbUser = dbSecrets.user;
        const dbPass = dbSecrets.pass;
        const uri = "mongodb+srv://"+dbUser+":"+dbPass+"@"+dbDomain+"/"+dbNamespace+"?retryWrites=true&w=majority";
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        client.connect(err => {
        const collection = client.db("db").collection("playerRoster");
        client.close();
        });
        
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
            if (this.args.team || this.args.t)
            {
                var allyCode;
                if (this.args.ally) {
                    allyCode = this.args.ally;
                } else {
                    allyCode = '914315138';
                }
                var teamList = this.args.team.split(',');
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
                    .catch(err => err);
            } else if (this.args.defense || this.args.d ) { 
                return new Promise((resolve, reject) => reject("Opzione difesa non ancora implementata."));
            } else {
                return new Promise((resolve, reject) => reject("Opzione non riconosciuta. Digita 'bk --h' per ottenere l'aiuto in linea"));
            }
        }
    }
}

module.exports = BotK;