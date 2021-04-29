const axios = require('axios');
const { errorMonitor } = require('events');
const fs = require('fs');

class Swapi {
  playerInfo(allyCode, mock) {
    if (mock && mock === true) {
      return new Promise((resolve, reject) => {
        fs.readFile('./src/_apiModules/mockPlayerInfo.json', 'utf8', (err, data) => {
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
    return axios.get('https://swgoh.gg/api/characters/').then(r => r.data);
  }
}

module.exports = Swapi;