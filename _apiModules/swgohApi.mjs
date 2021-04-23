import axios from 'axios';

class Swapi {
  playerInfo(allyCode) {
    return axios.get('https://swgoh.gg/api/player/' + allyCode);
  }

  characterList() {
    return axios.get('https://swgoh.gg/api/characters/');
  }
}

export { Swapi };