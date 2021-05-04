/* -------------------------------------
    In questo modulo si possono testare 
    le funzionalità singolarmente
    -----------------------------------*/

    // salvare l'immagine dal sito
const jimp = require('jimp');
const TextHelper = require('./src/text/textHelper.js');
const textHelper = new TextHelper();

/**
 * 
 * @param {Number} level 
 * @param {Number} rarity 
 * @param {Number} gLevel 
 * @param {Number} relic 
 * @param {Number} nZeta 
 * @param {String} alignment : 'dark side' oppure 'light side'
 */
async function makePortrait(base_id, level, rarity, gLevel, rLevel, nZeta) {
    const font = await jimp.loadFont(jimp.FONT_SANS_16_WHITE);
    var startTime = new Date();
    var gStartPoint = 0;
    var rStartPoint = 0;
    var path = './src/img/portrait/';
    var name = base_id + '.png';
    var maskPath = './src/img/equipment/mask.png';

    var alignment = await textHelper.findAlignment(base_id);

    if (alignment == 'DARKSIDE') {
        gStartPoint = 112;
        rStartPoint = 40;
    }
    const startPortrait = (await jimp.read(path + name)).resize(100,100);
    const resizedPortrait = (await jimp.read('./src/img/equipment/background.png')).blit(startPortrait, 14,14);
    const mask = await jimp.read(maskPath);
    const starActivePath = './src/img/equipment/star_active.png';
    const starInactivePath = './src/img/equipment/star_inactive.png'; 

    var gearLevel;
    if (gLevel >= 13) {
        const gearRelicLevel = await jimp.read('./src/img/equipment/g13.png');
        resizedPortrait.blit(gearRelicLevel, 4, 8, 0, gStartPoint, 120, 112).mask(mask);
        if (rLevel > 0) {
            const relic = await jimp.read('./src/img/equipment/relic.png');
            resizedPortrait
            .blit(relic, 80, 78, 0, rStartPoint, 40, 40)
            .print(font, 95, 89, String(rLevel));
        }
    } else {
        const gearNoRelicLevel = await jimp.read('./src/img/equipment/g' + String(gLevel) + '.png');
        gearLevel = gearNoRelicLevel.resize(100,100).blit(gearLevel, 14, 14).mask(mask);
    }

    if (nZeta > 0)
    {
        const zeta = await jimp.read('./src/img/equipment/zeta.png');
        resizedPortrait.blit(zeta, 5, 78).print(font, 20, 89, String(nZeta));
    }

    for (let i = -3; i < 4; i++) {
        var star;
        if ((i + 3) < rarity) {
            star = await jimp.read(starActivePath);
        } else {
            star = await jimp.read(starInactivePath);
        }

        var degrees = i * -12; // la documentazione dice che il giro è orario, ma è sbagliata: la rotazione avviene in senso antiorario
        var yCoord = Math.pow(Math.abs(i*1.05), 2.15);
        resizedPortrait.blit(star.rotate(degrees, false),
                10 + (12 * (i + 4)), 2 + yCoord);
    }

    resizedPortrait.write(path + '_' + name);
    console.log((new Date()) - startTime);
}

makePortrait('ANAKINKNIGHT', 85, 7, 13, 7, 1);
makePortrait('SITHPALPATINE', 85, 7, 13, 7, 6);

//const th = new TextHelper();
//th.findAlignment('ANAKINKNIGHT').then(r => console.log(r)).catch(e => console.log(e));


