const MongoClient = require('mongodb').MongoClient;
const TextHelper = require('../_textModules/textHelper.js');

class DbOperations {
    searchUser(discordId) {
        let textHelper = new TextHelper();

        // connessione al db
        const dbSecrets = textHelper.getSecrets().mongodb; 
        const dbDomain = dbSecrets.domain;
        const dbNamespace = dbSecrets.namespace;
        const dbUser = dbSecrets.user;
        const dbPass = dbSecrets.pass;
        const uri = "mongodb+srv://"+dbUser+":"+dbPass+"@"+dbDomain+"/"+dbNamespace+"?retryWrites=true&w=majority";
        
        return new Promise((resolve, reject) => {
            const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect((err, client) => {
                if (err) {
                    reject(err);
                }

                var query = { discordId: discordId };
                var result = client.db('db').collection('users').findOne(query);
                
                if (result == null) {
                    reject('Non sei registrato.');
                }
                
                resolve(result);
            });
            client.close();
        });
    }
}

module.exports = DbOperations;
