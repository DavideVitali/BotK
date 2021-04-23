import fs from 'fs';

class TextHelper {
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
                        if (character.abbr.includes(teamElement)) {
                            found = true;
                            idTeamList.push(character);
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
