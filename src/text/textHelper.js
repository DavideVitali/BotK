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
        return new Promise((resolve, reject) => {
            fs.readFile('./src/text/characterList.json', 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }
                var result;
                var found = JSON.parse(data).filter((parsed) => { 
                    if (parsed.base_id == base_id) {
                        result = parsed.categories.includes('Galactic Legend');
                        return parsed;
                    }
                });
    
                if (found.length == 0) {
                    reject('Non ho trovato nessun personaggio con id '+base_id);
                };
    
                if (found.length > 1) {
                    reject('Attenzione, ci sono più personaggi con lo stesso id '+base_id);
                }

                resolve(result);
            });
        })
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
                        reject("Non ho trovato nessun personaggio corrisponde all'abbreviazione '" + teamElement);
                        return;
                    }
                };
                resolve(idTeamList);
            });
        });
    }
}

module.exports = TextHelper;