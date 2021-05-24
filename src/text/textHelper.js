class TextHelper {
  constructor() {

    /**
     * 37 e 38 entrambi precisione (quale fisico / speciale?)
     * 
     */
    this.StatsTable = {
        "1": "Salute",
        "5": "Velocita",
        "6": "Danni fisici",
        "7": "Danni speciali",
        "8": "Corazza",
        "9": "Resistenza",
        "10": "Penetrazione corazza",
        "11": "Penetrazione resistenza",
        "12": "Prob. schivata / deviazione",
        "13": "Prob. schivata / deviazione",
        "14": "Prob. critico fisico",
        "15": "Prob. critico speciale",
        "16": "Danni critici",
        "17": "Efficacia",
        "18": "Tenacia",
        "27": "Furto vitale",
        "28": "Protezione",
        "37": "Precisione",
        "38": "Precisione",
        "39": "Schivata colpi critici fisici / speciali",
        "40": "Schivata colpi critici fisici / speciali"
      }
    }

    getSecrets() {
        if ( process.env.token ) {
            return {
                "discord": {
                    "token": process.env.token,
                    "applicationId": process.env.applicationId,
                    "myId": process.env.myId
                },
                "mongodb": {
                    "domain": process.env.domain,
                    "namespace": process.env.namespace,
                    "user": process.env.user,
                    "pass": process.env.pass
                },
                "helpapi": {
                    "swgohHelpUsername": process.env.swgohHelpUsername,
                    "swgohHelpPassword": process.env.swgohHelpPassword
                }
            }
        } else {
            const secrets = require('../../secrets/tokens.json');
            return secrets;
        }
    }

    getAbbreviationsList() {
      return new Promise( (resolve, reject) => {
        const abl = require('./characterAbbreviationList.json');
        var result = '';

        abl.forEach( e => {
          result += e.abbr.length > 0 ? 
            String(e.name + ': ' + e.abbr.join(', ') + '\n\r' ) : 
            String(e.name + ': ' + e.base_id + '\n\r' )
        });
        
        resolve(result);
      });
    }

    /**
     * param {Array} characterList - Array di personaggi da cui estrarre le stat principali:
     */
    getCharactersMainStats(characterList) {
        var result = [];
        var th = new TextHelper();

        characterList.forEach(c => {
            result.push({
                "base_id": c.data.base_id,
                "level": c.data.level,
                "rarity": c.data.rarity,
                "gLevel": c.data.gear_level,
                "rLevel": Number(c.data.relic_tier) - 2,
                "zeta": c.data.zeta_abilities.length,
                "alignment": th.findAlignment(c.data.base_id)
            });
        });

        return result;
    }

    findAlignment(id) {
        const characterList = require('./characterList.json');

        var found = characterList.find(c => c.base_id == id);

        if (!found) {
            throw new Error('Nessun personaggio trovato con id ' + id);
        }

        return found.alignment.replace(' ','').toUpperCase();
    }

    /**
     * 
     * @param {Array<String>} team - Deve essere un array contenente i base_id del team 
     * @returns 
     */
    hasGalacticLegend(team) {
        const characterList = require('./characterList.json');

        var result = false;
        var found = characterList.filter(c => {
            if (team.indexOf(c.base_id) > -1 && c.categories.includes('Galactic Legend')) {
                result = true;
            }
        });

        return result;
    }

    isGalacticLegend(base_id) {
        const characterList = require('./characterList.json');

        var result = false;
        characterList.filter(c => {
            if (c.base_id == base_id && c.categories.includes('Galactic Legend')) {
                result = true;
            }
        });

        return result;
    }

    getAbbreviations() {
      const abl = require('./characterAbbreviationList.json');

      var result;
      abl.forEach(e => {
        result = result + '**'+e.name+'**: '+e.abbr.join(',')+'\n';
      });
      return result
    }

    findAbbreviated(teamList) {
      const characterList = require('./characterAbbreviationList.json');
      var idTeamList = [];
      for (var teamElement of teamList) {
        var found = false;
        for (var character of characterList) {
            if (character.abbr.includes(teamElement.toUpperCase()) || character.name.replace(' ', '').toUpperCase() == teamElement.replace(' ', '').toUpperCase() || character.base_id == teamElement.replace(' ', '').toUpperCase()) {
              found = true;
              idTeamList.push(character.base_id);
              break;
            };
        };
        if (found == false) {
          throw new Error("Non ho trovato nessun personaggio corrisponde all'abbreviazione '" + teamElement + "'");
        }
      };
      return idTeamList;
    }
}

module.exports = TextHelper;