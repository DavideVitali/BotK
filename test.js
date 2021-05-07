/* -------------------------------------
    In questo modulo si possono testare 
    le funzionalità singolarmente
    -----------------------------------*/

    // salvare l'immagine dal sito
const { DataResolver } = require('discord.js');
const charList = require('./src/text/characterList.json');
const myRoster = require('./src/api/mockPlayerInfo.json');
const Jimp = require('jimp');
const ImageProcessor = require('./src/img/processor.js');
const processor = new ImageProcessor();

var localTest = new Promise((resolve, reject) => {
    const chars = myRoster.units.filter(e => {
        if (e.data.base_id == 'SUPREMELEADERKYLOREN' || e.data.base_id == 'DARTHREVAN' || e.data.base_id == 'DARTHMALAK' || e.data.base_id == 'VADER' || e.data.base_id == 'BASTILASHANDARK') {
            return e.data;
        }
    });
    
    var ca = processor.createCharacterArray(chars);
    console.log(ca);
});

