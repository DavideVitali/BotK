/*
        questo modulo è di test quando non si vuole mandare roba al bot vero e proprio (index.js)
*/
const Swapi = require('./api/swgohApi.js');
const TextHelper = require('./text/textHelper.js');
const DbOperations = require('./data/dbOperations.js');
const ImageProcessor = require ('./img/processor.js');
const { default: axios } = require('axios');

class BotK {
    /*
    Gli argomenti passati alla classe come costruttore sono un json di questa forma
    {
        command: 'bk',
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
        var idArray = textHelper.findAbbreviated(teamList: [<string>])
        */
        
        if (this.args.command.toUpperCase() === 'BK')
        {
            if (this.args.d || this.args.defense) {
                throw 'opzione difesa non implementata';
            }

            /* --------------------------------------
                    GESTIONE DELLE IMMAGINI
               ----------------------------------- */
            if (this.args.image || this.args.img)
            {
                
            }


            /* --------------------------------------
                    REGISTRAZIONE AL BOT
               ----------------------------------- */
            if (this.args.register || this.args.r)
            {
                var allyCode = this.args.register || this.args.r;
                return dbOperations.addUser(this.discordId, allyCode)
                .then((result) => {
                    return {
                      "type": 'text',
                      "body": 'Operazione completata.'
                    }
                })
                .catch(e => { throw e; });
            }

            /* --------------------------------------
                    VALUTAZIONE DI UN TEAM
               ----------------------------------- */
            if (this.args.team || this.args.t) {
                var teamValue = this.args.team || this.args.t;
                return dbOperations.searchUser(this.discordId)
                .then(dbUser =>  {
                    var allyCode = this.args.ally || this.args.a;
                    if (!allyCode) {
                        if (dbUser == null) {
                            throw 'Utente non registrato.';
                        } else {
                            allyCode = dbUser.allyCode;
                        }
                    }
                    var teamList = teamValue.split(',');

                    // Si prepara prendendo i dati dei personaggi
                    var promiseArray;

                    var format = (this.args.format || this.args.f);

                    if (format && format != 'SINGLE' && format != 'ARENA' && format != 'INLINE') {
                      throw ('Hai richiesto un formato non riconosciuto. Le opzioni valide sono: "single", "arena" e "inline".');
                    }

                    if (!format) {
                      return {
                        "type": "text",
                        "body": swapi.teamTextualData(teamList, allyCode)
                      }
                    } else if (format.toUpperCase() == "ARENA") {
                        return {
                            "type": "attachment",
                            "body": swapi.teamImage(teamList, allyCode)
                        }
                    } else if (format.toUpperCase() == 'INLINE') {
                      const processor = new ImageProcessor();
                      promiseArray = Promise.all([
                        textHelper.findAbbreviated(teamList),
                        swapi.playerInfo(allyCode)]);
                        return {
                            "type": "attachment",
                            "body": promiseArray
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
                              selectedCharacters.filter(c => {
                                  return c.base_id;
                              });
                              var ca = processor.createCharacterArray(selectedCharacters);

                              var a = processor.getImage(ca, 'inline');
                              console.log('a: ',a);
                              return a;
                              } 
                            )}
                    }
                })
                .catch(e => {
                    throw e;
                });
            }
            throw "Opzione non riconosciuta. Digita bk -h per ottenere l'aiuto in linea";
            //return new Promise((resolve, reject) => reject("Opzione non riconosciuta. Digita 'bk --h' per ottenere l'aiuto in linea"));
        }
    }
}

module.exports = BotK;