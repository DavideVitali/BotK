import { Console } from 'console';
import fs from 'fs';

class TextHelper {
    findAbbreviated(abbreviation) {
        return new Promise(function(resolve, reject) {
            var cList;
            fs.readFile('./_textModules/characterAbbreviationList.json', 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                cList = JSON.parse(data);
                var found = false;
                for (var el of cList) {
                    if (el.abbr.includes(abbreviation)) {
                        found = true;
                        resolve(el);
                    };
                };

                if (found == false) {
                    reject("Non ho trovato nessun personaggio corrisponde all'abbreviazione '" + abbreviation + "'");
                }
            });
        });
    }
}

export { TextHelper };