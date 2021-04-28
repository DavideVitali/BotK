/*
        questo modulo è di test quando non si vuole mandare roba al bot vero e proprio (index.js)
*/

import { Swapi } from './_apiModules/swgohApi.mjs';
import { TextHelper } from './_textModules/textHelper.mjs';
import mongolib from 'mongodb';
const { MongoClient } = mongolib;

// connessione ai moduli ausiliari
let textHelper = new TextHelper();

// connessione alle api di swgoh
let swapi = new Swapi();

// connessione al db
const dbSecrets = textHelper.getSecrets().mongodb; 
const dbDomain = dbSecrets.domain;
const dbNamespace = dbSecrets.namespace;
const dbUser = dbSecrets.user;
const dbPass = dbSecrets.pass;
const uri = "mongodb+srv://"+dbUser+":"+dbPass+"@"+dbDomain+"/"+dbNamespace+"?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("db").collection("playerRoster");
  client.close();
});

var args = process.argv.slice(2);

/*
        <summary>Restituisce le info e il roster di un player in formato JSON</summary>
        <param "allyCode">Codice Alleato del player</param>
        <param "mock">**NON USARE IN PRODUZIONE!!!!* Se true, il roster viene estratto da ./_apiModules/mockPlayerInfo.json, per bypassare eventuali restrizioni imposte dal proxy</param>
        <remarks>restituisce una promise</remarks>
        var playerInfo = swapi.playerInfo(allyCode: <int>, mock: <bool>)
*/
//var playerInfo = swapi.playerInfo(914315138, true).then(r => console.log(r)).catch(e => console.log(e))

/*
        <summary>Restituisce l'array degli BASE_ID dei personaggi immessi dall'utente sotto forma di abbreviazione o nickname</summary>
        <param "teamList">Array dei personaggi immessi dal giocatore</param>
        <remarks>restituisce una promise</remarks>
        var idArray = textHelper.findAbbreviater(teamList: [<string>])
*/
if (args[0] == '-team')
{
    var teamList = args[1].replace(' ','').split(',');

    var result = textHelper.findAbbreviated(teamList)
        .then(baseIdResult => {
            var selectedCharacters = [];
            var result = '';
            swapi.playerInfo(914315138)
            .then(pInfo => {
                for (var baseId of baseIdResult) {
                    for (var unit of pInfo.units) {
                        if (unit.data.base_id === baseId) {
                            selectedCharacters.push(unit);
                        }
                    }
                }
                selectedCharacters.map(c => {
                    var gear;
                    if (Number(c.data.gear_level) >= 13) {
                        gear = "R" + String(Number(c.data.relic_tier) - 2);
                    } else {
                        gear = "G" + String(Number(c.data.gear_level));
                    }
                    result = result + c.data.name + ": " + c.data.rarity + '* | ' + gear + ' | ' + String(c.data.zeta_abilities.length) + 'z | v. ' + c.data.stats['5'] + '\n';
                })
                console.log(result);
            });
        })
        .catch(e => console.log(e));
}
