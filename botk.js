import { Swapi } from './_apiModules/swgohApi.mjs';
import { TextHelper } from './_textModules/textHelper.mjs';

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
var c = textHelper.findAbbreviated(["AA","GK"]);
c.then(r => console.log(r)).catch(e => console.log(e));
        