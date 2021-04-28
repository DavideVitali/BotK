const axios = require('axios');
const fs = require('fs');

class Swapi {
  playerInfo(allyCode, mock) {
    if (mock && mock === true) {
      return new Promise((resolve, reject) => {
        fs.readFile('./_apiModules/mockPlayerInfo.json', 'utf8', (err, data) => {
          if (err) {
              reject(err);
              return;
          }

          var pInfo = JSON.parse(data);
          resolve(pInfo);
        });
      });
    } else {
      return axios.get('https://swgoh.gg/api/player/' + allyCode).then(r => r.data);
    }
  }

  characterList() {
    return axios.get('https://swgoh.gg/api/characters/').then(r => r.data);
  }
}

module.exports = Swapi;