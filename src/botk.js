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
        
        if (this.args.command.toUpperCase() === 'BK')
        {
            /* --------------------------------------
                    LISTA DELLE ABBREVIAZIONI
               ----------------------------------- */
            if (this.args.abbr)
            {
              return textHelper.getAbbreviationsList().then(result => {
                //if ( result.length > 2000 ) {
                  // var abbrs = result.split(';');
                  // var results = [];
                  // for (let i = 0; i < abbrs.length; i += 40) {
                  //   var messageChunk = abbrs.slice(i, i + 40).join(';\n');
                  //   results.push(messageChunk);
                  // }

                //   return { 
                //     "type": "longtext",
                //     "body": result
                //   }
                // } else {
                  return { 
                    "type": "longtext",
                    "body": result
                  }
                // }
              });              
            }

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
            if ( this.args.gm ) {
              
              var orderBy;
              if ( !this.args.gm ) {
                orderBy = 'N';
              } else {
                orderBy = this.args.gm.toUpperCase();
              }

              return dbOperations.searchUser(this.discordId)
              .then(dbUser =>  {
                return swapi.guildMembers(dbUser.allyCode);
              })
              .then(members => {
                  var result = '';
                  
                  members
                  .sort(( f, s ) => f.name.toUpperCase() < s.name.toUpperCase() ? -1 : 1)
                  .forEach(m => {
                    result = result + "**" + m.name + "**: " + m.allyCode + "\n";
                  });

                  return { 
                    "type": "text",
                    "body": result
                  }
                })
              .catch(e => { throw e; });
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

                    var format;
                    if ( !this.args.f ) {
                      format = 'INLINE';
                    } else {
                      format = this.args.f.toUpperCase();
                    }

                    var orderBy;
                    if ( !this.args.o ) {
                      orderBy = 'P';
                    } else {
                      orderBy = this.args.o.toUpperCase();
                    }

                    var isGuildRequest = this.args.g == 1 ? true : false;
                    var withStats = this.args.s == 1 ? true : false;

                    if (format && format != 'INLINE' && format != 'ARENA' && format != 'TEXT') {
                      throw ('Hai richiesto un formato non riconosciuto. Le opzioni valide sono: "single", "arena" e "inline".');
                    }

                    if ( format == 'INLINE' ) {
                        try {
                          var body = processor.buildTeamImage(teamList, allyCode, format, orderBy, isGuildRequest, withStats);
                        }
                        catch (e) {
                          throw e;
                        }
                        return {
                          "type": "attachment",
                          "body": body
                        }
                    } else if (format == 'ARENA') {
                        return {
                            "type": "attachment",
                            "body": processor.buildTeamImage(teamList, allyCode, format, orderBy, false)
                        }
                    } else if (format == 'TEXT') {
                      return {
                        "type": "text",
                        "body": swapi.teamTextualData(teamList, allyCode)
                      }
                    }
                })
                .catch(e => {
                  throw e;
                });
            }
            throw "Opzione non riconosciuta";
        }
    }
}

module.exports = BotK;