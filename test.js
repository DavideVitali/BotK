/* -------------------------------------
    In questo modulo si possono testare 
    le funzionalità singolarmente
    -----------------------------------*/

    // salvare l'immagine dal sito
const Jimp = require('jimp');
const ImageProcessor = require('./src/img/processor.js');
const TextHelper = require('./src/text/textHelper.js');
const textHelper = new TextHelper();
const SaveTemplate = {
    SINGLE: "single",
    ARENA: "arena",
    INLINE: "inline"
}

/**
 * 
 * @param {Number} level 
 * @param {Number} rarity 
 * @param {Number} gLevel 
 * @param {Number} relic 
 * @param {Number} nZeta 
 * @param {String} alignment : 'DARKSIDE' oppure 'LIGHTSIDE'gimp
 */
async function makePortrait(base_id, level, rarity, gLevel, rLevel, nZeta) {
    const font = await jimp.loadFont(jimp.FONT_SANS_16_WHITE);
    var gStartPoint = 0;
    var rStartPoint = 0;
    var path = './src/img/portrait/';
    var name = base_id + '.png';
    var maskPath = './src/img/template/mask.png';

    var alignment = await textHelper.findAlignment(base_id);

    if (alignment == 'DARKSIDE') {
        gStartPoint = 112;
        rStartPoint = 40;
    }
    const startPortrait = (await jimp.read(path + name)).resize(100,100);
    const resizedPortrait = (await jimp.read('./src/img/template/background.png')).blit(startPortrait, 14,14);
    const mask = await jimp.read(maskPath);
    const starActivePath = './src/img/template/star_active.png';
    const starInactivePath = './src/img/template/star_inactive.png'; 

    var gearLevel;
    if (gLevel >= 13) {
        const gearRelicLevel = await jimp.read('./src/img/template/g13.png');
        resizedPortrait.blit(gearRelicLevel, 4, 8, 0, gStartPoint, 120, 112).mask(mask);
        if (rLevel > 0) {
            const relic = await jimp.read('./src/img/template/relic.png');
            resizedPortrait
            .blit(relic, 80, 78, 0, rStartPoint, 40, 40)
            .print(font, 95, 89, String(rLevel));
        }
    } else {
        const gearNoRelicLevel = await jimp.read('./src/img/template/g' + String(gLevel) + '.png');
        gearLevel = gearNoRelicLevel.resize(100,100).blit(gearLevel, 14, 14).mask(mask);
    }

    if (nZeta > 0)
    {
        const zeta = await jimp.read('./src/img/template/zeta.png');
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

    const lv = await Jimp.read('./src/img/template/level.png');
    resizedPortrait.blit(lv, 49, 95)
    .print(font, 48, 95, 
        {
            text: String(level),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        30, 30);

    return resizedPortrait;
}

/**
 * 
 * @param {Array<Jimp>} portraits
 * @param {SaveTemplate} template
 */
async function createTemplate(portraits, path, template) {
    if (!template) {
        throw "arrayMode non è definito";
    }

    switch (template) {
        case SaveTemplate.SINGLE:
            if (portraits.length > 1) {
                throw "Hai scelto la modalità singola ma hai fornito più di un'immagine."
            }
            await portraits[0].write(path);
            break;
        case SaveTemplate.INLINE:
            const background = await Jimp.read('./src/img/template/inline_template.png')
            for (let i = 0; i < 5; i++)
            {
                textHelper.isGalacticLegend(portraits[i].base_id)
                .then(async (isGL) => {
                    if (isGL == true) {
                        const glBackground = await Jimp.read('./src/img/template/inlineGlBackground.png');
                        background.blit(glBackground, (i * 128), 0);
                    }
                    background.blit(portraits[i].img, (i * 128), 0);
                    background.write(path);
                })
            }
            break;
        case SaveTemplate.ARENA:
            var team = portraits.map(portrait => portrait.base_id);
            textHelper.hasGalacticLegend(team)
            .then(async (hasGL) => {
                var background;
                if (hasGL == true) {
                    background = await Jimp.read('./src/img/template/arenaGlTemplate.png');
                } else {
                    background = await Jimp.read('./src/img/template/arenaTemplate.png');
                }
                background.blit(portraits[0].img, 106, 0);
                background.blit(portraits[1].img, 0, 83);
                background.blit(portraits[2].img, 212, 83);
                background.blit(portraits[3].img, 43, 202);
                background.blit(portraits[4].img, 169, 202);
                background.write(path);
            })
            break;
        default:
            throw "Modalità di output non riconosciuta.";
    }
}

async function createInline() {
    var startTime = new Date();
    var pArr = [];
    pArr.push({ base_id: 'SITHPALPATINE', img: await makePortrait('SITHPALPATINE', 85, 7, 13, 7, 6)});
    pArr.push({ base_id: 'VADER', img: await makePortrait('VADER', 85, 7, 13, 7, 3)});
    pArr.push({ base_id: 'DARTHREVAN', img: await makePortrait('DARTHREVAN', 85, 7, 13, 5, 3)});
    pArr.push({ base_id: 'DARTHMALAK', img: await makePortrait('DARTHMALAK', 85, 7, 13, 5, 2)});
    pArr.push({ base_id: 'BASTILASHANDARK', img: await makePortrait('BASTILASHANDARK', 85, 7, 13, 2, 1)});

    createTemplate(pArr, './src/img/portrait/inline.png', SaveTemplate.INLINE).then(r => {
        console.log('Tempo totale: ', new Date() - startTime);    
    });
}

async function createArena() {
    var startTime = new Date();
    var pArr = [];
    pArr.push({ base_id: 'SITHPALPATINE', img: await makePortrait('SITHPALPATINE', 85, 7, 13, 7, 6)});
    pArr.push({ base_id: 'VADER', img: await makePortrait('VADER', 85, 7, 13, 7, 3)});
    pArr.push({ base_id: 'DARTHREVAN', img: await makePortrait('DARTHREVAN', 85, 7, 13, 5, 3)});
    pArr.push({ base_id: 'DARTHMALAK', img: await makePortrait('DARTHMALAK', 85, 7, 13, 5, 2)});
    pArr.push({ base_id: 'BASTILASHANDARK', img: await makePortrait('BASTILASHANDARK', 85, 7, 13, 2, 1)});

    createTemplate(pArr, './src/img/portrait/arena.png', SaveTemplate.ARENA).then(r => {
        console.log('Tempo totale: ', new Date() - startTime);    
    });
}


// createArena();
// createInline();
//const th = new TextHelper();
//th.findAlignment('ANAKINKNIGHT').then(r => console.log(r)).catch(e => console.log(e));
const imageProcessor = new ImageProcessor();
imageProcessor.downloadPortraits();