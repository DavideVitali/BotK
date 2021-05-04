const jimp = require('jimp');

class ImageProcessor {
    makePortrait(base_id, level, rarity, gLevel, relic, nZeta, alignment) {
        const font = await jimp.loadFont(jimp.FONT_SANS_16_WHITE);
        
        
        var gStartPoint = 0;
        var rStartPoint = 0;
        
        
        if (alignment == 'dark side') {
            gStartPoint = 112;
            rStartPoint = 40;
        }
    
        var path = './src/img/portrait/';
        var name = base_id + '.png';
        var maskPath = './src/img/equipment/mask.png';
        
        const startPortrait = (await jimp.read(path + name)).resize(100,100);
        const resizedPortrait = (await jimp.read('./src/img/equipment/background.png')).blit(startPortrait, 14,14);
        const mask = await jimp.read(maskPath);
        const zeta = await jimp.read('./src/img/equipment/zeta.png');
    
        var gearLevel;
        if (gLevel >= 13) {
            gearLevel = (await jimp.read('./src/img/equipment/g13.png'));
            resizedPortrait.blit(gearLevel, 4, 8, 0, gStartPoint, 120, 112).mask(mask);
            if (relic > 0) {
                resizedPortrait
                .blit(
                    (await jimp.read('./src/img/equipment/relic.png')),
                    80, 78, 0, rStartPoint, 40, 40)
                .print(font, 95, 89, String(relic));
            }
        } else {
            gearLevel = (await jimp.read('./src/img/equipment/g' + String(gLevel) + '.png')).resize(100,100);
            resizedPortrait.blit(gearLevel, 14, 14).mask(mask);
        }
    
        if (nZeta > 0)
        {
            resizedPortrait.blit(zeta, 5, 78).print(font, 20, 89, String(nZeta));;
        }
    
        for (let i = -3; i < 4; i++) {
            var starPath;
            if ((i + 3) < rarity) {
                starPath = './src/img/equipment/star_active.png';
            } else {
                starPath = './src/img/equipment/star_inactive.png';
            }
    
            var degrees = i * -12; // la documentazione dice che il giro è orario, ma è sbagliata: la rotazione avviene in senso antiorario
            var yCoord = Math.pow(Math.abs(i*1.05), 2.15);
            resizedPortrait.blit(
                (await jimp.read(starPath)).rotate(degrees, false),
                    10 + (12 * (i + 4)), 2 + yCoord);
        }
    
        resizedPortrait.write(path + '_' + name);
        console.log((new Date()) - startTime);
    }
}

module.exports = ImageProcessor;