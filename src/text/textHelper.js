const fs = require('fs');

class TextHelper {
    getSecrets(fromReplit) {
        if (fromReplit == true) {
          secrets = new Object();
          secrets.discord = new Object();
          secrets.discord.token = "$discordToken";
          secrets.discord.applicationId = "$discordApplicationId";
          secrets.discord.myId = "$discordMyId";
          secrets.mongodb = new Object();
          secrets.mongodb.domain = "$dbDomain";
          secrets.mongodb.namespace = "$dbNamespace";
          secrets.mongodb.user = "$dbUser";
          secrets.mongodb.pass = "$dbPass";
          return secrets;
        } else {
          return JSON.parse(fs.readFileSync('secrets/tokens.json', 'utf8'));
        }
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