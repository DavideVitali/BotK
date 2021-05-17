/*
        questo modulo è di test quando non si vuole mandare roba al bot vero e proprio (index.js)
*/
const Swapi = require('./api/swgohApi.js');
const TextHelper = require('./text/textHelper.js');
const DbOperations = require('./data/dbOperations.js');
const ImageProcessor = require ('./img/processor.js');
const { default: axios } = require('axios');
const fs = require('fs');

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
    constructor(args, recipients, userDiscordId) {
        this.args = args;
        this.recipients = recipients;
        this.discordId = userDiscordId;
    }
    
    Exec() {
        // connessione ai moduli ausiliari
        let textHelper = new TextHelper();
        let dbOperations = new DbOperations();

        // connessione alle api di swgoh
        let swapi = new Swapi();
        let processor = new ImageProcessor();
        
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
            /* --------------------------------------
                    REGISTRAZIONE AL BOT
               ----------------------------------- */
            if (this.args.register || this.args.r)
            {
                var allyCode = this.args.register || this.args.r;

                return dbOperations.addUser(this.discordId, allyCode)
                .then((result) => {
                  return { "body": 'Operazione Completata' }
                })
                .catch(e => { throw e; });
            }

            /* --------------------------------
                    COMPONENTI DELLA GILDA
               -------------------------------- */
            if (this.args.guildmembers || this.args.gm) {
              
              var optionValue = this.args.guildmembers || this.args.gm;

              if (optionValue.toUpperCase() == "L") {
                return dbOperations.searchUser(this.discordId)
                  .then(dbUser =>  {
                    return swapi.guildMembers(dbUser.allyCode);
                  })
                  .then(members => {
                      var result = '';
                      members.forEach(m => {
                        result = result + "**" + m.name + "**: " + m.allyCode + "\n";
                      });
                      return { 
                        "type": "text",
                        "body": result
                      }
                    })
                  .catch(e => { throw e; });
              }
            }

            /* ----------------------------------
                    VALUTAZIONE DI UN TEAM 
               ---------------------------------- */
            if (this.args.team || this.args.t) {
                var teamValue = this.args.team || this.args.t;

                var user = this.discordId;
                if (this.recipients.length == 1) {
                  user = this.recipients[0]
                } 

                return dbOperations.searchUser(user)
                .then(dbUser =>  {

                  // Se viene fornito l'allyCode
                    var allyCode = this.args.ally || this.args.a;
                    if (!allyCode) {
                        if (dbUser == null) {
                            throw 'Utente non registrato.';
                        } else {
                            allyCode = dbUser.allyCode;
                        }
                    }
                    var teamList = teamValue.split(',');

                    var format = (this.args.format || this.args.f);
                    var isGuildRequest = this.args.g == 1 ? true : false;

                    if (format && format != 'ARENA' && format != 'TEXT') {
                      throw ('Hai richiesto un formato non riconosciuto. Le opzioni valide sono: "single", "arena" e "inline".');
                    }

                    if ( !format ) {
                        try {
                          var body = processor.buildTeamImage(teamList, allyCode, format, isGuildRequest);
                        }
                        catch (e) {
                          console.log('botk:142'); throw e;
                        }
                        return {
                          "type": "attachment",
                          "body": body
                        }
                    } else if (format.toUpperCase() == 'ARENA') {
                        return {
                            "type": "attachment",
                            "body": processor.buildTeamImage(teamList, allyCode, format, false)
                        }
                    } else if (format.toUpperCase() == 'TEXT') {
                      return {
                        "type": "text",
                        "body": swapi.teamTextualData(teamList, allyCode)
                      }
                    }
                })
                .catch(e => {
                  console.log('botk:161'); throw e;
                });
            }
            throw "Opzione non riconosciuta";
        }
    }
}

module.exports = BotK;