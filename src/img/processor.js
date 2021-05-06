const Jimp = require('jimp');
const Swapi = require('../api/swgohApi.js');

class ImageProcessor {
    downloadPortraits() {
        try {
            var swapi = new Swapi();
            swapi.characterList().then(async (cList) => {
                console.log('processor:8', cList)
                cList.map(character => {
                    const id = character.base_id;
                    const url = 'http://swgoh.gg' + character.image;
                    const img = Jimp.read(url)
                    .then(jimpPortrait => {
                        jimpPortrait.write('./src/img/portrait/' + id + '.png');
                    })
                })
            }).catch(e => {
                console.log('internal catch: ', e.message);
                throw e;
            });
        }
        catch (e) {
            console.log('external catch: ', e);
        }
    }

    makePortrait(base_id, level, rarity, gLevel, relic, nZeta, alignment) {
        // copiare dal modulo test.js
    }
}

module.exports = ImageProcessor;