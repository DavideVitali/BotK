const MongoClient = require('mongodb').MongoClient;
const TextHelper = require('../text/textHelper.js');

class DbOperations {
    constructor() {
        let textHelper = new TextHelper();

        // connessione al db
        const dbSecrets = textHelper.getSecrets().mongodb; 
        const dbDomain = dbSecrets.domain;
        const dbNamespace = dbSecrets.namespace;
        const dbUser = dbSecrets.user;
        const dbPass = dbSecrets.pass;
        this.uri = "mongodb+srv://"+dbUser+":"+dbPass+"@"+dbDomain+"/"+dbNamespace+"?retryWrites=true&w=majority";
    }
    
    searchUser(discordId) {
        return new Promise((resolve, reject) => {
            const client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect((err, client) => {
                if (err) {
                    reject(err);
                } else {
                    var query = { discordId: discordId };
                    client.db('db').collection('users').findOne(query)
                    .then(result => {
                        resolve(result);
                    })
                    .catch(err => { throw err; });
                }
            });
            client.close();
        });
    }

    addUser(discordId, allyCode) {
        return new Promise((resolve, reject) => {
            var normalizedAllyCode = allyCode.replace(/-/g, '');
            if (normalizedAllyCode.length != 9 || isNaN(normalizedAllyCode)) {
                reject('Il codice alleato non è valido.');
            }
            const client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });

            client.connect((err, client) => {
                if (err) {
                    reject(err); 
                } else {
                    const user = { 'discordId': discordId, 'allyCode': normalizedAllyCode };
    
                    var cursor = client.db('db').collection('users').find({
                        $or: [{'discordId': discordId }, {'allyCode': normalizedAllyCode }]
                    });
                    
                    cursor.count()
                    .then(result => {
                        if (result == 0) {
                            resolve(client.db('db').collection('users').insertOne(user));
                        } else {
                            reject('Utente o Codice Alleato già registrati.');
                        }
                    });
                }
            });
        })
    }
}

module.exports = DbOperations;
