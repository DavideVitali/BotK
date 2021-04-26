/*
        questo modulo è di test quando non si vuole mandare roba al bot vero e proprio (index.js)
*/

import { Swapi } from './_apiModules/swgohApi.mjs';
import { TextHelper } from './_textModules/textHelper.mjs';
import mongolib from 'mongodb';
const { MongoClient } = mongolib;

const uri = "mongodb+srv://botk:<password>@botkcluster.qsfgz.mongodb.net/db?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("db").collection("playerRoster");
        console.log(collection);
  client.close();
});


//connessione alle api e ai moduli ausiliari
let swapi = new Swapi();
let textHelper = new TextHelper();

/*
        per trovare le info di un player e e sul suo roster generico:
*/
//var pInfo = swapi.playerInfo(914315138).then(r => console.log(r)).catch(e => console.log(e));

/*
        per trovare il personaggio abbreviato
*/
var c = textHelper.findAbbreviated(["AA"]);
c.then(r => console.log(r)).catch(e => console.log(e));
        