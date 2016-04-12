'use strict';

const PDF = require('pdfkit');

class ChineseDocument extends PDF {
    constructor() {
        super({size: 'A4'});
        this.colors = {
            '1': 'cornflowerblue',
            '2': 'mediumseagreen',
            '3': 'lightsalmon',
            '4': 'indianred',
            '5': 'lightslategray'
        }
        this.counter = 0;
        this.sequence = 0;
    }


    character(character, line, column) {
        if (this.counter++ % 120 == 0) {
            delete this._fontFamilies['KaiTi'];
            this.registerFont(`simkai_${++this.sequence}`, 'simkai.ttf');
        }
        this.font(`simkai_${this.sequence}`);
        this.fontSize(32);
        //console.log(character.character + ' ' + character.pinyin);
        //console.log(character.character + ' ' + character.pinyin[0]);
        //this.fillColor(this.colors[this._tone(character.pinyin[0])]);

        this.x = column * 50;
        this.y = line * 50;

        console.log(`${character.character} at line ${line}, column ${column}`);
        this.text(character.character);

        //this.font('calibri.ttf');
        //this.fontSize(10);
        //this.fillColor('black');
        //this.text(character.pinyin);
    }

    _tone(pinyin) {
        return pinyin.charAt(pinyin.length - 1);
    }

}

module.exports = ChineseDocument;