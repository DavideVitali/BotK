const MongoClient = require('mongodb').MongoClient;
const TextHelper = require('../_textModules/textHelper.js');

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
                }

                var query = { discordId: discordId };
                client.db('db').collection('users').findOne(query)
                .then(result => {
                    resolve(result);
                })
                .catch(err => { throw err; });
            });
            client.close();
        });
    }

    addUser(discordId, allyCode) {
        return new Promise((resolve, reject) => {
            const client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });

            client.connect((err, client) => {
                if (err) { reject(err); }

                const user = { 'discordId': discordId, 'allyCode': allyCode };

                var cursor = client.db('db').collection('users').find({
                    $or: [{'discordId': discordId, 'allyCode': allyCode }]
                });
                
                console.log(cursor.length);

                // .then(result => {
                //     if (result == null) {
                //         client.db('db').collection('users').insertOne(user)
                //         .then(result => {
                //             resolve(result);
                //         })
                //         .catch(err => reject(err));
                //     }
                //     else reject('Utente discord o codice alleato già registrato.');
                // })
            });
        })
    }
}

module.exports = DbOperations;
