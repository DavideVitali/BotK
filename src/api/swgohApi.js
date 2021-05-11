const axios = require('axios');
const ImageProcessor = require('../img/processor.js');
const TextHelper = require('../text/textHelper.js');
const fs = require('fs');
const fetch = require('node-fetch');

class Swapi {
  guildMembers(allyCode) {
    return new Promise((resolve, reject) => {
      try {
        var url = 'https://api.swgoh.help/swgoh/guilds/' + allyCode;
        const request = axios.get(url);
        resolve(request.then(response => {
          var members = [];
          
          response.data[0].roster.forEach(m => members.push({ "name": m.name, "allyCode": m.allyCode })); 
          return members.sort((first, second) => { 
            if (first.name.toUpperCase() > second.name.toUpperCase()) {
              return 1
            }

            if (first.name.toUpperCase() < second.name.toUpperCase()) {
              return -1
            }

            return 0;
          });
        }).catch(e => { 
          throw e; 
          }));
      } catch (error) {
        reject(error => error.data);
      }
    });
  }

  playersInfo(allyCodes) {
    console.log(allyCodes);
    fetch('https://api.swgoh.help/auth/signin', {
      "method": "post",
      "headers": {
        "content-type": "application/x-www-form-urlencoded"
      }
    })
    .then(response => console.log(response));

    fetch('https://api.swgoh.help/swgoh/player', {
      "method": "POST",
      "body": {
        "allyCodes": allyCodes,
      },
      "headers": {                              // ***
        "Content-Type": "application/json"    // ***
      }                                       // ***
    })
    .then(r => r);
  }

  playerInfoHELP(allyCode) {
    return new Promise((resolve, reject) => {
      try {
        const response = axios.get('https://api.swgoh.help/swgoh/player/' + allyCode);
        resolve(response.then(r => r.data));
      } catch (error) {
        reject(error => error.data);
      }
    });
  }

  playerRosterHELP(allyCode) {
  return new Promise((resolve, reject) => {
    try {
      const response = axios.get('https://api.swgoh.help/swgoh/player/' + allyCode);
      resolve(response.then(r => r.data[0].roster));
    } catch (error) {
      reject(error => error.data);
    }
  });
}

  playerInfo(allyCode, mock) {
    if (mock && mock === true) {
      return new Promise((resolve, reject) => {
        fs.readFile('./src/api/mockPlayerInfo.json', 'utf8', (err, data) => {
          if (err) {
              reject(err);
              return;
          }

          var pInfo = JSON.parse(data);
          resolve(pInfo);
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        try {
          const response = axios.get('https://swgoh.gg/api/player/' + allyCode);
          resolve(response.then(r => r.data));
        } catch (error) {
          reject(error => error.data);
        }
      });
    }
  }

  characterList() {
    return axios.get('https://swgoh.gg/api/characters/').then(r => r.data).catch(e => { throw e;});
  }

  updateAbbreviationList(isAdmin) {
    if (!isAdmin) {
      throw new Error('Non hai i permessi per eseguire questo comando.');
    }

    const localList = require('../text/characterAbbreviationList.json');

    characterList().then(cList => {
      cList.forEach(fromApi => {
        var found = localList.find(fromLocal => {
          fromLocal.base_id == fromApi.base_id
        }); 
        if (!found) {
          newChar = {
            'name': fromApi.name,
            'base_id': fromApi.base_id,
            'abbr': []
          };
          localList.push(newChar);
        }
      });
    });
  }

  guildTeamImage(teamList, members) {
    const textHelper = new TextHelper();
    const processor = new ImageProcessor();
    const promises = [];
    
    promises.push(textHelper.findAbbreviated(teamList));
    members.forEach(m => {
      promises.push(this.playerInfoHELP(m.allyCode))
    });

    
    return Promise.all(promises)
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
        
        for(let i = 1; i < promiseResults.length; i++)
        {
          var memberCharacters = processor.createCharacterArray(promiseResult[i].roster);
          
        }
    });
  }

  teamImage(teamList, allyCode, format) {
    const textHelper = new TextHelper();
    const processor = new ImageProcessor();
    return Promise.all([
      textHelper.findAbbreviated(teamList),
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
        var ca = processor.createCharacterArray(selectedCharacters);
        switch (format.toUpperCase()) {
          case "ARENA":
            return processor.getImage(ca, 'arena', allyCode);
            break;
          case "INLINE":
            return processor.getImage(ca, 'inline', allyCode);
            break;
          case "SINGLE":
            return processor.getImage(ca, 'single', allyCode);
            break;
          default:
            throw new Error('Formato non riconosciuto. Le opzioni valide sono: "single", "arena" e "inline".');
        }
      } 
    ).catch(e => { throw e; })
  }

  /**
   *  @param{Array<Promise>} team - Promise[0] = Array<base_id>, Promise[1] = playerInfo
   */
  teamTextualData(teamList, allyCode) {
    const textHelper = new TextHelper();
    var promiseArray = Promise.all([
      textHelper.findAbbreviated(teamList),
      this.playerInfo(allyCode)]);

    return promiseArray
    .then(promiseResults => {
        var selectedCharacters = [];
        var result = '';
        for (var baseId of promiseResults[0]) {
            for (var unit of promiseResults[1].units) {
                if (unit.data.base_id === baseId) {
                    selectedCharacters.push(unit);
                }
            }
        }
        selectedCharacters.map(c => {
            var gear;
            if (Number(c.data.gear_level) >= 13) {
                gear = "R" + String(Number(c.data.relic_tier) - 2);
            } else {
                gear = "G" + c.data.gear_level;
            }
            result = result + c.data.name + ": " + c.data.rarity + '* | ' + gear + ' | ' + String(c.data.zeta_abilities.length) + 'z | v. ' + c.data.stats['5'] + '\n';
        });

        return result;
    })
    .catch(err => {
        if (err.response && err.response.status == '404' && err.response.config.url.includes('swgoh.gg/api/player/')) {
            throw 'Il codice alleato richiesto è inesistente.';
        }
        throw err;
    });
  }
}

module.exports = Swapi;