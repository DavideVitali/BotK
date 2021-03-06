const Jimp = require('jimp');
const TextHelper = require('../text/textHelper.js');

module.exports = class ImageProcessor {
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
            const resizedPortrait = (await Jimp.read('./src/img/template/background.png')).blit((await Jimp.read(path + name)).resize(100,100), 14,14);
            const mask = await Jimp.read(maskPath);
            const starActivePath = './src/img/template/star_active.png';
            const starInactivePath = './src/img/template/star_inactive.png'; 
    
            if (gLevel >= 13) {
                resizedPortrait.blit((await Jimp.read('./src/img/template/g13.png')), 4, 8, 0, gStartPoint, 120, 112).mask(mask);
                if (rLevel > 0) {
                    resizedPortrait
                    .blit((await Jimp.read('./src/img/template/relic.png')), 80, 78, 0, rStartPoint, 40, 40)
                    .print(font, 95, 89, String(rLevel));
                }
            } else {
                resizedPortrait.blit((await Jimp.read('./src/img/template/g' + String(gLevel) + '.png')), 14, 14).mask(mask);
            }
    
            if (nZeta > 0)
            {
                resizedPortrait.blit((await Jimp.read('./src/img/template/zeta.png')), 5, 78).print(font, 20, 89, String(nZeta));
            }
    
            for (let i = -3; i < 4; i++) {
                var degrees = i * -12; // la documentazione dice che il giro ?? orario, ma ?? sbagliata: la rotazione avviene in senso antiorario
                var yCoord = Math.pow(Math.abs(i*1.05), 2.15);

                if ((i + 3) < rarity) {
                    resizedPortrait.blit((await Jimp.read(starActivePath)).rotate(degrees, false), 10 + (12 * (i + 4)), 2 + yCoord);
                } else {
                    resizedPortrait.blit((await Jimp.read(starInactivePath)).rotate(degrees, false), 10 + (12 * (i + 4)), 2 + yCoord);
                }
            }
    
            resizedPortrait.blit((await Jimp.read('./src/img/template/level.png')), 49, 95)
            .print(font, 48, 95, 
                {
                    text: String(level),
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                },
                30, 30);
    
            return {
                "base_id": base_id,
                "portrait": resizedPortrait
            }
        } catch (e) {
            throw new Error(e.message);
        }
    }
  
    /**
     *  @param{Array<JSON>} characterList - Array di JSON dei personaggi
     */
    getImage(characterList, template, playerName, allyCode)
    {
        const textHelper = new TextHelper();
        const Swapi = require('../api/swgohApi.js');
        var swapi = new Swapi();

        if (characterList.length > 5) {
            throw new Error('Non sono ammesse squadre con pi?? di 5 personaggi.');
        }

        return new Promise((resolve, reject) => {
          var pArray = [];
          var promises = [];
          characterList.forEach(c => {
            // se chiamata da .gg 
            if (c.base_id){
              promises.push(this.makePortrait(c.base_id, c.level, c.rarity, c.gLevel, c.rLevel, c.zeta, c.alignment));
            } else { // se chiamata da .help
              var relic = c.relic ? c.relic.currentTier - 2 : 0;
              var nZeta = c.skills.filter(skill => skill.isZeta && skill.tier == skill.tiers).length
              var alignment = textHelper.findAlignment(c.defId);
              promises.push(this.makePortrait( c.defId, c.level, c.rarity, c.gear, relic, nZeta, alignment ));
            }
          });

          //console.log('characterList: ', characterList);

          try {
              var timestamp;
              var path;
              Promise.all(promises)
              .then(resolved => {
                  timestamp = new Date().getTime();
                  path = './src/img/processresult/' + String(allyCode) + String(timestamp) + '.png'
                  resolved.forEach(e => {
                    pArray.push({
                      "base_id": e.base_id,
                      "img": e.portrait
                    });
                  });
                  
                  //console.log('pArray: ', pArray);
                  resolve(this.createTemplate(pArray, path, template, playerName));
              });
            } catch (e) {
              throw e;
            }
        });
    }

    /**
     * 
     * @param {Array<Jimp>} portraits - array dei personaggi
     * @param {SaveTemplate} template - Enum SaveTemplate
     */
    createTemplate(portraits, path, template, playerName) {
        return new Promise(async (resolve, reject) => {
            const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
            const textHelper = new TextHelper();
            if (!template) {
                throw "La definizione di template non ?? valida.";
            }
    
            var imgResult;
            switch (template) {
                case this.SaveTemplate.SINGLE:
                    if (portraits.length > 1) {
                        throw "Hai scelto la modalit?? singola ma hai fornito pi?? di un'immagine."
                    }
                    imgResult = portraits[0].img;
                    imgResult.write(path);
                    break;
                case this.SaveTemplate.INLINE:
                    imgResult = await Jimp.read('./src/img/template/inline5v5template.png')
                    for (let i = 0; i < portraits.length; i++)
                    {
                        if (textHelper.isGalacticLegend(portraits[i].base_id) == true) {
                            imgResult.blit((await Jimp.read('./src/img/template/inlineGlBackground.png')), (i * 128), 30);
                        } else {
                            imgResult.blit((await Jimp.read('./src/img/template/inlineBackground.png')), (i * 128), 30);
                        }
                        imgResult.blit(portraits[i].img, (i * 128), 35);
                    }
                    imgResult.print(font, 15, 0, 
                    {
                        text: playerName,
                        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                    },
                    640, 32);
                    imgResult.scale(0.75);
                    imgResult.write(path);
                    break;
                case this.SaveTemplate.ARENA:
                    var team = portraits.map(portrait => portrait.base_id);
                    if (textHelper.hasGalacticLegend(team)) {
                        imgResult = await Jimp.read('./src/img/template/arenaGlTemplate.png');
                    } else {
                        imgResult = await Jimp.read('./src/img/template/arenaTemplate.png');
                    }
                    for (let i = 0; i < portraits.length; i++) {
                      switch (i){
                        case 0:
                          imgResult.blit(portraits[i].img, 106, 0);
                          break;
                        case 1:
                          imgResult.blit(portraits[1].img, 0, 83);
                          break;
                        case 2:
                          imgResult.blit(portraits[2].img, 212, 83);
                          break;
                        case 3:
                          imgResult.blit(portraits[3].img, 43, 202);
                          break;
                        case 4:
                          imgResult.blit(portraits[4].img, 169, 202);
                          break;
                      }
                    }
                    imgResult.scale(0.75);
                    imgResult.write(path);
                    break;
                default:
                    throw "Modalit?? di output non riconosciuta.";
            }
            resolve(path);
        });
    }
}