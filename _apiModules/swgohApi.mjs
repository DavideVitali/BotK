import axios from 'axios';
import fs from 'fs';

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
      return axios.get('https://swgoh.gg/api/player/' + allyCode);
    }
  }

  characterList() {
    return axios.get('https://swgoh.gg/api/characters/');
  }
}

export { Swapi };