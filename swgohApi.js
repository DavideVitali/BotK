import axios from 'axios';

 function playerInfo(allyCode) {
    var response = axios.get('https://swgoh.gg/api/player/' + allyCode)
    .then(res => res.text())
    .catch(e => console.log(e.message));

    return response;
}

export { playerInfo }