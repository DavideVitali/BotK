module.exports = class ImageProcessor {
  constructor() {
    this.SaveTemplate = {
        SINGLE: "single",
        ARENA: "arena",
        INLINE: "inline"
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

  teamImage(teamList, allyCode, format, orderBy) {
    return Promise.all([
      this.textHelper.findAbbreviated(teamList),
      this.playerInfo(allyCode)])
      .then(promiseResults => {
        var selectedCharacters = [];
        for (var baseId of promiseResults[0]) {
            for (var unit of promiseResults[1].units) {
                if (unit.data.base_id === baseId) {
                    selectedCharacters.push(unit);
                }
            }
        }
        selectedCharacters.filter(c => {
            return c.base_id;
        });

        let members = [];
        members.push(allyCode);

        team = this.swapi.getTeamStats(selectedCharacters, members, orderBy)
        .then()
        var ca = this.processor.createCharacterArray(selectedCharacters);
        switch (format.toUpperCase()) {
          case "ARENA":
            return this.processor.getImage(ca, 'arena', allyCode);
            break;
          case "INLINE":
            return this.processor.getImage(ca, 'inline', allyCode);
            break;
          case "SINGLE":
            return this.processor.getImage(ca, 'single', allyCode);
            break;
          default:
            throw new Error('Formato non riconosciuto. Le opzioni valide sono: "single", "arena" e "inline".');
        }
      } 
    ).catch(e => { throw e; })
  }

  buildTeamImage(teamList, allyCode, orderBy, isGuildRequest) {
    return new Promise((resolve, reject) => {
      var promiseResult;
      var memberPromise;
      
      if (isGuildRequest == true) {
        memberPromise = this.swapi.guildMembers(allyCode)
        .then(members => {
          var players = members.map(m => m.allyCode);
          return this.swapi.getTeamStats(teamList, players, 'p');
        })
      } else {
        memberPromise = Promise.resolve(allyCode)
        .then(member => {
          return this.swapi.getTeamStats(teamList, member, 'p');
        })
      }

      memberPromise
      .then(guildMembers => {
        var membersWithPortraits = [];
        guildMembers.forEach(member => {
          membersWithPortraits.push({
            "allyCode": member.allyCode,
            "name": member.name,
            "units": member.units,
            "portrait": this.getImage(member.units, 'inline', member.name, member.allyCode)
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
        resolve(this.guildTeamImage(paths));
      })
      .catch(e => {
        console.log(e);
        throw e;
      });
    });
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
          const font = await this.Jimp.loadFont(this.Jimp.FONT_SANS_16_WHITE);
          var gStartPoint = 0;
          var rStartPoint = 0;
          var path = './src/img/portrait/';
          var name = base_id + '.png';
          var maskPath = './src/img/template/mask.png';
  
          if (alignment == 'DARKSIDE') {
              gStartPoint = 112;
              rStartPoint = 40;
          }
          const resizedPortrait = (await this.Jimp.read('./src/img/template/background.png')).blit((await this.Jimp.read(path + name)).resize(100,100), 14,14);
          const mask = await this.Jimp.read(maskPath);
          const starActivePath = './src/img/template/star_active.png';
          const starInactivePath = './src/img/template/star_inactive.png'; 
  
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
      if (characterList.length > 5) {
          throw new Error('Non sono ammesse squadre con più di 5 personaggi.');
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
            var alignment = this.textHelper.findAlignment(c.defId);
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
          const font = await this.Jimp.loadFont(this.Jimp.FONT_SANS_32_WHITE);
          if (!template) {
              throw "La definizione di template non è valida.";
          }
  
          var imgResult;
          switch (template) {
              case this.SaveTemplate.SINGLE:
                  if (portraits.length > 1) {
                      throw "Hai scelto la modalità singola ma hai fornito più di un'immagine."
                  }
                  imgResult = portraits[0].img;
                  imgResult.write(path);
                  break;
              case this.SaveTemplate.INLINE:
                  imgResult = await this.Jimp.read('./src/img/template/inline5v5template.png')
                  for (let i = 0; i < portraits.length; i++)
                  {
                      if (this.textHelper.isGalacticLegend(portraits[i].base_id) == true) {
                          imgResult.blit((await this.Jimp.read('./src/img/template/inlineGlBackground.png')), (i * 128), 30);
                      } else {
                          imgResult.blit((await this.Jimp.read('./src/img/template/inlineBackground.png')), (i * 128), 30);
                      }
                      imgResult.blit(portraits[i].img, (i * 128), 35);
                  }
                  imgResult.print(font, 15, 0, 
                  {
                      text: playerName,
                      alignmentX: this.Jimp.HORIZONTAL_ALIGN_LEFT,
                      alignmentY: this.Jimp.VERTICAL_ALIGN_MIDDLE
                  },
                  640, 32);
                  imgResult.scale(0.75);
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

  guildTeamImage(paths) {
    // scalato dello 0.75
    const HEIGHT = paths.length * 124;
    const WIDTH = 480;

    return new Promise(async (resolve, reject) => {
      var background = await this.Jimp.read(WIDTH, HEIGHT, 0x00ffffff);
      for (let i = 0; i < paths.length; i++) {
        background.blit((await this.Jimp.read(paths[i])), 0, i * 124)
      }

      var timestamp = new Date().getTime();
      var path = './src/img/processresult/_' + String(timestamp) + '.png'
      Promise.resolve(background.write(path)).then(r => {
        paths.forEach(p => {
          fs.unlink(p, (err) => {
            if (err) { throw err; }
          });
        });
      });
      
      resolve(path);
    });
  }
}