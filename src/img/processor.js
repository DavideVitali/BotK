const Jimp = require('jimp');
const Swapi = require('../api/swgohApi.js');

class ImageProcessor {
    downloadPortraits() {
        var swapi = new Swapi();
        swapi.characterList().then(async (cList) => {
            cList.map(character => {
                const id = character.base_id;
                const url = 'http://swgoh.gg' + character.image;
                const img = Jimp.read(url)
                .then(jimpPortrait => {
                    jimpPortrait.write('./src/img/portrait/' + id + '.png');
                    });
            })
        })
    }

    makePortrait(base_id, level, rarity, gLevel, relic, nZeta, alignment) {
        // copiare dal modulo test.js
    }
}

module.exports = ImageProcessor;