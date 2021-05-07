const Jimp = require('jimp');
const TextHelper = require('../text/textHelper.js');

class ImageProcessor {
    constructor() {
        this.SaveTemplate = {
            SINGLE: "single",
            ARENA: "arena",
            INLINE: "inline"
        };
    }

    downloadPortraits(isAdmin) {
        if (isAdmin) {
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
                    if (e.isAxiosError) {
                        throw new Error('Errore di rete');
                    }
                    else {
                        throw new Error(e.message);
                    }
                });
            }
            catch (e) {
                throw e;
            }
        } else {
            throw new Error('Non sei autorizzato a eseguire questo comando.');
        }
    }

    /**
     * 
     * @param {Number} level 
     * @param {Number} rarity 
     * @param {Number} gLevel 
     * @param {Number} relic 
     * @param {Number} nZeta 
     * @param {String} alignment - "DARKSIDE", "LIGHTSIDE"
     */
    async makePortrait(base_id, level, rarity, gLevel, rLevel, nZeta, alignment) {
        try {
            const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
            var gStartPoint = 0;
            var rStartPoint = 0;
            var path = './src/img/portrait/';
            var name = base_id + '.png';
            var maskPath = './src/img/template/mask.png';
    
            if (alignment == 'DARKSIDE') {
                gStartPoint = 112;
                rStartPoint = 40;
            }
            const startPortrait = (await Jimp.read(path + name)).resize(100,100);
            const resizedPortrait = (await Jimp.read('./src/img/template/background.png')).blit(startPortrait, 14,14);
            const mask = await Jimp.read(maskPath);
            const starActivePath = './src/img/template/star_active.png';
            const starInactivePath = './src/img/template/star_inactive.png'; 
    
            var gearLevel;
            if (gLevel >= 13) {
                const gearRelicLevel = await Jimp.read('./src/img/template/g13.png');
                resizedPortrait.blit(gearRelicLevel, 4, 8, 0, gStartPoint, 120, 112).mask(mask);
                if (rLevel > 0) {
                    const relic = await Jimp.read('./src/img/template/relic.png');
                    resizedPortrait
                    .blit(relic, 80, 78, 0, rStartPoint, 40, 40)
                    .print(font, 95, 89, String(rLevel));
                }
            } else {
                const gearNoRelicLevel = await Jimp.read('./src/img/template/g' + String(gLevel) + '.png');
                gearLevel = gearNoRelicLevel.resize(100,100).blit(gearLevel, 14, 14).mask(mask);
            }
    
            if (nZeta > 0)
            {
                const zeta = await Jimp.read('./src/img/template/zeta.png');
                resizedPortrait.blit(zeta, 5, 78).print(font, 20, 89, String(nZeta));
            }
    
            for (let i = -3; i < 4; i++) {
                var star;
                if ((i + 3) < rarity) {
                    star = await Jimp.read(starActivePath);
                } else {
                    star = await Jimp.read(starInactivePath);
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
        } catch (e) {
            throw new Error(e.message);
        }
    }

    /**
     * 
     * @param {Array<String>} portraitArray - Array con i base_id dei personaggi da visualizzare
     */
    async createInline(portraitArray) {
        var pArr = [];
        pArr.push({ base_id: 'SITHPALPATINE', img: await this.makePortrait('SITHPALPATINE', 85, 7, 13, 7, 6, "DARKSIDE")});
        pArr.push({ base_id: 'DARTHREVAN', img: await this.makePortrait('DARTHREVAN', 85, 7, 13, 5, 3, "DARKSIDE")});
        pArr.push({ base_id: 'DARTHMALAK', img: await this.makePortrait('DARTHMALAK', 85, 7, 13, 5, 2, "DARKSIDE")});
        pArr.push({ base_id: 'BASTILASHANDARK', img: await this.makePortrait('BASTILASHANDARK', 85, 7, 13, 2, 1, "DARKSIDE")});
        pArr.push({ base_id: 'VADER', img: await this.makePortrait('VADER', 85, 7, 13, 7, 3, "DARKSIDE")});
    
        try {
            this.createTemplate(pArr, './src/img/portrait/inline.png', this.SaveTemplate.INLINE).then(result => result);
        } catch (e) {
            throw e;
        }
    }
    
    /**
     * @param {Array<String>} portraitArray - 
     */
    async createArena(portraitArray) {
        portraitArray.forEach()
        var path = './src/img/processresult/' + String(new Date().getTime()) + '.png';
        var pArr = [];
        pArr.push({ base_id: portraitArray[0], img: await this.makePortrait(portraitArray[0], 85, 7, 13, 7, 6, "DARKSIDE")});
        pArr.push({ base_id: portraitArray[1], img: await this.makePortrait(portraitArray[1], 85, 7, 13, 7, 3, "DARKSIDE")});
        pArr.push({ base_id: portraitArray[2], img: await this.makePortrait(portraitArray[2], 85, 7, 13, 5, 3, "DARKSIDE")});
        pArr.push({ base_id: portraitArray[3], img: await this.makePortrait(portraitArray[3], 85, 7, 13, 5, 2, "DARKSIDE")});
        pArr.push({ base_id: portraitArray[4], img: await this.makePortrait(portraitArray[4], 85, 7, 13, 2, 1, "DARKSIDE")});
    
        try {
            return this.createTemplate(pArr, path, this.SaveTemplate.ARENA).then(result => result);
        } catch (e) {
            throw e;
        }
    }

    /**
     * 
     * @param {Array<Jimp>} portraits - array dei personaggi
     * @param {SaveTemplate} template - Enum SaveTemplate
     */
    async createTemplate(portraits, path, template) {
        const textHelper = new TextHelper();
        if (!template) {
            throw "La definizione di template non è valida.";
        }

        var imgResult;
        switch (template) {
            case this.SaveTemplate.SINGLE:
                if (portraits.length > 1) {
                    throw "Hai scelto la modalità singola ma hai fornito più di un'immagine."
                }
                imgResult = portraits[0];
                imgResult.write(path);
                break;
            case this.SaveTemplate.INLINE:
                imgResult = await Jimp.read('./src/img/template/inline5v5template.png')
                for (let i = 0; i < 5; i++)
                {
                    textHelper.isGalacticLegend(portraits[i].base_id)
                    .then(async (isGL) => {
                        if (isGL == true) {
                            const pBack = await Jimp.read('./src/img/template/inlineGlBackground.png');
                            imgResult.blit(pBack, (i * 128), 0);
                        } else {
                            const pBack = await Jimp.read('./src/img/template/inlineBackground.png');
                            imgResult.blit(pBack, (i * 128), 0);
                        }
                        imgResult.blit(portraits[i].img, (i * 128), 3);
                        imgResult.write(path);
                    })
                }
                break;
            case this.SaveTemplate.ARENA:
                var team = portraits.map(portrait => portrait.base_id);
                textHelper.hasGalacticLegend(team)
                .then(async (hasGL) => {
                    if (hasGL == true) {
                        imgResult = await Jimp.read('./src/img/template/arenaGlTemplate.png');
                    } else {
                        imgResult = await Jimp.read('./src/img/template/arenaTemplate.png');
                    }
                    imgResult.blit(portraits[0].img, 106, 0);
                    imgResult.blit(portraits[1].img, 0, 83);
                    imgResult.blit(portraits[2].img, 212, 83);
                    imgResult.blit(portraits[3].img, 43, 202);
                    imgResult.blit(portraits[4].img, 169, 202);
                    imgResult.write(path);
                })
                break;
            default:
                throw "Modalità di output non riconosciuta.";
        }
        return path;
    }
}

module.exports = ImageProcessor;