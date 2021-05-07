const axios = require('axios');
const { errorMonitor } = require('events');
const fs = require('fs');

class Swapi {
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

  /**
   *  @param{Array<Promise>} team - Promise[0] = Array<base_id>, Promise[1] = playerInfo
   */
  teamTextualData(team) {
    return team
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