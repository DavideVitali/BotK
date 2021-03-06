const fs = require('fs');
const { parse } = require('path');

class TextHelper {
    getSecrets() {
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
            }
        }
        //return JSON.parse(fs.readFileSync('secrets/tokens.json', 'utf8'));
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
        return new Promise(function(resolve, reject) {
            fs.readFile('./src/text/characterAbbreviationList.json', 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                var cList = JSON.parse(data);
                var idTeamList = []
                for (var teamElement of teamList) {
                    var found = false;
                    for (var character of cList) {
                        if (character.abbr.includes(teamElement.toUpperCase()) || character.name.replace(' ', '').toUpperCase() == teamElement.replace(' ', '').toUpperCase() || character.base_id == teamElement.replace(' ', '').toUpperCase()) {
                            found = true;
                            idTeamList.push(character.base_id);
                            break;
                        };
                    };
                    if (found == false) {
                        reject("Non ho trovato nessun personaggio corrisponde all'abbreviazione '" + teamElement + "'");
                    }
                };
                resolve(idTeamList);
            });
        });
    }
}

module.exports = TextHelper;