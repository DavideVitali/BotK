module.exports = class ImageProcessor {
  constructor() {
    this.SaveTemplate = {
        ARENA: "ARENA",
        INLINE: "INLINE"
    };

    const TextHelper = require('../text/textHelper.js')
    const Swapi = require('../api/swgohApi.js')
    
    this.fs = require('fs');
    this.Jimp = require('jimp');
    this.textHelper = new TextHelper();
    this.swapi = new Swapi();
    this.fetch = require('node-fetch');
    this.statCalculator = require('swgoh-stat-calc');
  }

  downloadPortraits(isAdmin) {
      if (isAdmin) {
          try {
              this.swapi.characterList().then(async (cList) => {
                  cList.map(character => {
                      const id = character.base_id;
                      const url = 'http://swgoh.gg' + character.image;
                      const img = this.Jimp.read(url)
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

  // teamImage(teamList, allyCode, format, orderBy, withStats) {
  //   return Promise.all([
  //     this.textHelper.findAbbreviated(teamList),
  //     this.playerInfo(allyCode)])
  //     .then(promiseResults => {
  //       var selectedCharacters = [];
  //       for (var baseId of promiseResults[0]) {
  //           for (var unit of promiseResults[1].units) {
  //               if (unit.data.base_id === baseId) {
  //                   selectedCharacters.push(unit);
  //               }
  //           }
  //       }
  //       selectedCharacters.filter(c => {
  //           return c.base_id;
  //       });

  //       let members = [];
  //       members.push(allyCode);

  //       team = this.swapi.getTeamStats(selectedCharacters, members, orderBy)
  //       .then()
  //       var ca = this.processor.createCharacterArray(selectedCharacters);
  //       return this.processor.getImage(ca, format, allyCode);
  //     });
  // }

  buildTeamImage(teamList, allyCode, format, orderBy, isGuildRequest, withStats) {
    return new Promise((resolve, reject) => {
      this.swapi.getMemberTeamStats(teamList, allyCode, orderBy, isGuildRequest, withStats)
      .then(guildMembers => {
        var membersWithPortraits = [];
        guildMembers.forEach(member => {
          membersWithPortraits.push({
            "allyCode": member.allyCode,
            "name": member.name,
            "units": member.units,
            "portrait": this.getImage(member.units, format, member.name, member.allyCode)
          });
        });
        return membersWithPortraits;
      })
      .then(guildMember => {
        var promises = [];
        guildMember.forEach(m => {
          promises.push(m.portrait);
        });

        return promises;
      })
      .then(promises => {
        return Promise.all(promises)
      })
      .then(paths => {
        resolve(this.guildTeamImage(paths, teamList.length, withStats));
      })
      .catch(e => {
        reject(e);
      });
    })
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
  async makePortrait(base_id, level, rarity, gLevel, rLevel, nZeta, alignment, stats) {
      try {
          const gStartPoint = alignment == 'DARKSIDE' ? 112 : 0;
          const rStartPoint = alignment == 'DARKSIDE' ? 40 : 0;
          const maskPath = './src/img/template/mask.png';
          const starActivePath = './src/img/template/star_active.png';
          const starInactivePath = './src/img/template/star_inactive.png'; 
          var path = './src/img/portrait/';
          var name = base_id + '.png';
  
          const font = await this.Jimp.loadFont(this.Jimp.FONT_SANS_16_WHITE);
          const resizedPortrait = (await this.Jimp.read('./src/img/template/background.png')).blit((await this.Jimp.read(path + name)).resize(100,100), 14,14);
          const mask = await this.Jimp.read(maskPath);
  
          if (gLevel >= 13) {
              resizedPortrait.blit((await this.Jimp.read('./src/img/template/g13.png')), 4, 8, 0, gStartPoint, 120, 112).mask(mask);
              if (rLevel > 0) {
                  resizedPortrait
                  .blit((await this.Jimp.read('./src/img/template/relic.png')), 80, 78, 0, rStartPoint, 40, 40)
                  .print(font, 95, 89, String(rLevel));
              }
          } else {
              resizedPortrait.blit((await this.Jimp.read('./src/img/template/g' + String(gLevel) + '.png')), 14, 14).mask(mask);
          }
  
          if (nZeta > 0)
          {
              resizedPortrait.blit((await this.Jimp.read('./src/img/template/zeta.png')), 5, 78).print(font, 20, 89, String(nZeta));
          }
  
          for (let i = -3; i < 4; i++) {
              var degrees = i * -12; // la documentazione dice che il giro è orario, ma è sbagliata: la rotazione avviene in senso antiorario
              var yCoord = Math.pow(Math.abs(i*1.05), 2.15);

              if ((i + 3) < rarity) {
                  resizedPortrait.blit((await this.Jimp.read(starActivePath)).rotate(degrees, false), 10 + (12 * (i + 4)), 2 + yCoord);
              } else {
                  resizedPortrait.blit((await this.Jimp.read(starInactivePath)).rotate(degrees, false), 10 + (12 * (i + 4)), 2 + yCoord);
              }
          }
  
          resizedPortrait.blit((await this.Jimp.read('./src/img/template/level.png')), 49, 95)
          .print(font, 48, 95, 
              {
                  text: String(level),
                  alignmentX: this.Jimp.HORIZONTAL_ALIGN_CENTER,
                  alignmentY: this.Jimp.VERTICAL_ALIGN_MIDDLE
              },
              30, 30);
  
          return {
              "base_id": base_id,
              "portrait": resizedPortrait,
              "stats": stats
          }
      } catch (e) {
          throw new Error(e.message);
      }
  }

  getImage(characterList, template, playerName, allyCode)
  {
      return new Promise((resolve, reject) => {
        var pArray = [];
        var promises = [];
        characterList.forEach(c => {
          try {
            if (c.base_id){
              promises.push(this.makePortrait(c.base_id, c.level, c.rarity, c.gLevel, c.rLevel, c.zeta, c.alignment, c.stats));
            } else { // se chiamata da .help
              var relic = c.relic ? c.relic.currentTier - 2 : 0;
              var nZeta = c.skills.filter(skill => skill.isZeta && skill.tier == skill.tiers).length
              var alignment = this.textHelper.findAlignment(c.defId);
              promises.push(this.makePortrait( c.defId, c.level, c.rarity, c.gear, relic, nZeta, alignment, c.stats ));
            }
          } catch (e) {
            reject(e);
            return;
          }
          // se chiamata da .gg 
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
                    "img": e.portrait,
                    "stats": e.stats
                  });
                });
                
                //console.log('pArray: ', pArray);
                resolve(this.createTemplate(pArray, path, template, playerName));
            })
            .catch(e => {
              reject(e);
            });
          } catch (e) {
            reject(e);
          }
      });
  }

  /**
   * 
   * @param {Array<Jimp>} portraits - array dei personaggi
   * @param {SaveTemplate} template - Enum SaveTemplate
   */
  createTemplate( portraits, path, template, playerName ) {
      return new Promise(async (resolve, reject) => {
          const font = await this.Jimp.loadFont(this.Jimp.FONT_SANS_32_WHITE);
          const statFont = await this.Jimp.loadFont(this.Jimp.FONT_SANS_16_WHITE);
          if (!template) {
              throw "La definizione di template non è valida.";
          }
  
          var imgResult;
          switch (template) {
              case this.SaveTemplate.INLINE:
                  const WIDTH = 128 * portraits.length;
                  const HEIGHT = portraits.some(p => p.stats) == true ?  270 : 165;
                  
                  imgResult = await this.Jimp.read(WIDTH, HEIGHT, 0x00000000);
                  for (let i = 0; i < portraits.length; i++)
                  {
                      if (this.textHelper.isGalacticLegend(portraits[i].base_id) == true) {
                          imgResult.blit((await this.Jimp.read('./src/img/template/inlineGlBackground.png')), (i * 128), 30);
                      } else {
                          imgResult.blit((await this.Jimp.read('./src/img/template/inlineBackground.png')), (i * 128), 30);
                      }
                      imgResult
                      .blit(portraits[i].img, (i * 128), 35)
                      .print(statFont, i * 128, 165, {
                        text: 'S: ' + portraits[i].stats['Velocita'] + '\n' +'H: ' + portraits[i].stats['Salute'] + '\n'+'P: ' + portraits[i].stats['Protezione'],
                        alignmentX: this.Jimp.HORIZONTAL_ALIGN_MIDDLE,
                        alignmentY: this.Jimp.VERTICAL_ALIGN_MIDDLE
                      },
                      128, 105)
                  }
                  imgResult.print(font, 15, 0, 
                  {
                      text: playerName,
                      alignmentX: this.Jimp.HORIZONTAL_ALIGN_LEFT,
                      alignmentY: this.Jimp.VERTICAL_ALIGN_MIDDLE
                  },
                  640, 32);
                  //imgResult.scale(0.75);
                  imgResult.write(path);
                  break;
              case this.SaveTemplate.ARENA:
                  var team = portraits.map(portrait => portrait.base_id);
                  if (this.textHelper.hasGalacticLegend(team)) {
                      imgResult = await this.Jimp.read('./src/img/template/arenaGlTemplate.png');
                  } else {
                      imgResult = await this.Jimp.read('./src/img/template/arenaTemplate.png');
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
                  throw "Modalità di output non riconosciuta.";
          }
          resolve(path);
      });
  }

  guildTeamImage(paths, maxUnits, withStats) {
    // 1.00x : 128 x 165
    // 0.75x : 96 x 124
    const SINGLE_WIDTH = 128;
    const SINGLE_HEIGHT = withStats == true ? 270 : 165;

    const TOTAL_HEIGHT = paths.length * SINGLE_HEIGHT;
    const TOTAL_WIDTH = maxUnits * SINGLE_WIDTH;

    return new Promise(async (resolve, reject) => {
      var background = await this.Jimp.read(TOTAL_WIDTH, TOTAL_HEIGHT, '#000000');
      for (let i = 0; i < paths.length; i++) {
        background.blit((await this.Jimp.read(paths[i])), 0, i * SINGLE_HEIGHT)
      }

      var timestamp = new Date().getTime();
      var path = './src/img/processresult/_' + String(timestamp) + '.png'
      background.write(path, () => {
        paths.forEach(p => {
          this.fs.unlink(p, (err) => { if (err) { throw err; }});
        });
      });
      
      resolve(path);
    });
  }
}