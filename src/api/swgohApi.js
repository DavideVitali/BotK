const fetch = require('node-fetch');

class Swapi {
  constructor() {
    this.axios = require('axios');
    this.fs = require('fs');
    this.statCalculator = require('swgoh-stat-calc');
    
    const TextHelper = require('../text/textHelper.js');
    this.textHelper = new TextHelper();
  }

  guildMembers(allyCode) {
    return new Promise((resolve, reject) => {
      try {
        var url = 'https://api.swgoh.help/swgoh/guilds/' + allyCode;
        const request = this.axios.get(url);
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
    const payload = { "allycodes": allyCodes };

    const ApiSwgohHelp = require('api-swgoh-help');
    const swhelp = new ApiSwgohHelp({
        "username": process.env['swgohHelpUser'],
        "password": process.env['swgohHelpPassword']
    });

    return swhelp.fetchPlayer({ "allycodes": allyCodes })
    .then(response => {
      if (response.error || response.warning) {
        throw new Error(response.error ? response.error : response.warning)
      }
      return response.result;
    });
  }

  playerInfoHELP(allyCode) {
    return new Promise((resolve, reject) => {
      try {
        const response = this.axios.get('https://api.swgoh.help/swgoh/player/' + allyCode);
        resolve(response.then(r => r.data));
      } catch (error) {
        reject(error => error.data);
      }
    });
  }

  playerRosterHELP(allyCode) {
    return new Promise((resolve, reject) => {
      try {
        const response = this.axios.get('https://api.swgoh.help/swgoh/player/' + allyCode);
        resolve(response.then(r => r.data[0].roster));
      } catch (error) {
        reject(error => error.data);
      }
    });
  }

  playerInfo(allyCode) {
    return new Promise((resolve, reject) => {
      try {
        const response = this.axios.get('https://swgoh.gg/api/player/' + allyCode);
        resolve(response.then(r => r.data));
      } catch (error) {
        reject(error => error.data);
      }
    });
  }

  characterList() {
    return this.axios.get('https://swgoh.gg/api/characters/').then(r => r.data).catch(e => { throw e;});
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

  getTeamStats(teamList, members, orderBy) {
    const promises = [];

    promises.push(fetch('https://swgoh-stat-calc.glitch.me/gameData.json').then(r => r.json()));
    promises.push(this.textHelper.findAbbreviated(teamList));
    promises.push(this.playersInfo(members));
      
    return Promise.all(promises)
    .then(promiseResults => {
      let gameData = promiseResults[0];
      let ids = promiseResults[1];
      let members = promiseResults[2];

      this.statCalculator.setGameData( gameData );

      var result = [];
      members.forEach(member => {
        var orderedRoster = new Array(5);
        var trimmedRoster = [];
        var totalGp = 0;

        var filteredRoster = member.roster.filter(unit => ids.includes(unit.defId)).map(filteredUnit => {        
          var i = ids.indexOf(filteredUnit.defId);
          orderedRoster[i] = filteredUnit;
          totalGp += this.statCalculator.calcCharGP( filteredUnit );
        });
        
        orderedRoster.map(o => {
          if (o) {
            trimmedRoster.push(o);
          }
        });
        
        result.push({
          "allyCode": member.allyCode,
          "name": member.name,
          "units": trimmedRoster,
          "totalGp": totalGp
        });
      });

      if (orderBy == "p") {
        return result.sort((f, s) => s.totalGp - f.totalGp);
      } else {
        return result.sort((f, s) => f.name.toUpperCase() - s.name.toUpperCase() ? -1 : 1);
      }
    })
    .catch(err => { throw err; });
  }

  /**
   *  @param{Array<Promise>} team - Promise[0] = Array<base_id>, Promise[1] = playerInfo
   */
  teamTextualData(teamList, allyCode) {
    var promiseArray = Promise.all([
      this.textHelper.findAbbreviated(teamList),
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