const fs = require('fs');
const { parse } = require('path');

class TextHelper {
    getSecrets() {
        return JSON.parse(fs.readFileSync('secrets/tokens.json', 'utf8'));
    }

    findAlignment(base_id) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/text/characterList.json', 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                var found = JSON.parse(data).filter((parsed) => { 
                    if (parsed.base_id == base_id) {
                        return parsed.alignment;
                    }
                });

                if (found.length == 0) {
                    reject('Non ho trovato nessun personaggio con id '+base_id);
                    return;
                };

                if (found.length > 1) {
                    reject('Attenzione, ci sono più personaggi con lo stesso id '+base_id);
                    return
                }

                resolve(found[0].alignment.replace(' ','').toUpperCase());
            });
        });
    }

    /**
     * 
     * @param {Array<String>} team - Deve essere un array contenente i base_id del team 
     * @returns 
     */
    hasGalacticLegend(team) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/text/characterList.json', 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }
                var result = false;

                var found = JSON.parse(data).filter((parsed) => { 
                    if (team.includes(parsed.base_id)) {
                        if (parsed.categories.includes('Galactic Legend')) {
                            result = true;
                        }
                        return parsed;
                    }
                });
    
                if (found.length == 0) {
                    reject('Non ho trovato nessun personaggio con id '+base_id);
                };
    
                if (found.length != team.length) {
                    reject('Attenzione, alcuni personaggi nel team hanno base_id errato');
                }

                resolve(result);
            });
        })    
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
                        reject("Non ho trovato nessun personaggio corrisponde all'abbreviazione '" +teamElement + "'. Digita 'bk -abl' per ottenere la lista delle abbreviazioni riconosciute, che riceverai con un messaggio privato.");
                        return;
                    }
                };
                resolve(idTeamList);
            });
        });
    }
}

module.exports = TextHelper;