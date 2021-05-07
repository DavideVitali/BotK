/* -------------------------------------
    In questo modulo si possono testare 
    le funzionalità singolarmente
    -----------------------------------*/

    // salvare l'immagine dal sito
const { DataResolver } = require('discord.js');
const Jimp = require('jimp');
const ImageProcessor = require('./src/img/processor.js');
const processor = new ImageProcessor();

var localTest = new Promise((resolve, reject) => {

    const pA = ['SITHPALPATINE','VADER','DARTHMALAK','DARTHREVAN','BASTILASHANDARK'];
    try {       
        processor.createArena(pA)
        .then(r => resolve(r));
    } catch (e) {
        throw e;
    }
})
.then(result => console.log(result))
.catch(error => console.log(error));

