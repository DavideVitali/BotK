import fs from 'fs';

class TextHelper {
    getSecrets() {
        return JSON.parse(fs.readFileSync('./secrets/tokens.json', 'utf8'));
    }

    findAbbreviated(teamList) {
        return new Promise(function(resolve, reject) {
            fs.readFile('./_textModules/characterAbbreviationList.json', 'utf8', (err, data) => {
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

export { TextHelper };