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
                const Swapi = require('../api/swgohApi.js');
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

    
    createCharacterArray(characterList) {
        var result = [];
        var th = new TextHelper();

        characterList.forEach(c => {
            result.push({
                "base_id": c.data.base_id,
                "level": c.data.level,
                "rarity": c.data.rarity,
                "gLevel": c.data.gear_level,
                "rLevel": Number(c.data.relic_tier) - 2,
                "zeta": c.data.zeta_abilities.length,
                "alignment": th.findAlignment(c.data.base_id)
            });
        });

        return result;
    }
  
    /**
     *  @param{Array<JSON>} characterList - Array di JSON dei personaggi
     */
    async getImage(characterList, template)
    {
        if (characterList.length > 5) {
            throw new Error('Non sono ammesse squadre con più di 5 personaggi.');
        }

        cArray = this.createCharacterArray(characterList);
        pArray = [];
        cArray.forEach(async (c) => {
          var portrait = await this.makePortrait(c.base_id, c.level, c.rarity, c.gLevel, c.rLevel, c.zeta, c.alignment).then(p => {
            pArray.push({ 
                "base_id": c.base_id,
                "img": p
                });
            });
        });

        try {
            var timestamp = new Date().getTime();
            this.createTemplate(pArray, './src/img/portrait/' + String(timestamp) + '.png', template).then(result => result);
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