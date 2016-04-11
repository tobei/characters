'use strict';

const PDF = require('pdfkit');

class ChineseDocument extends PDF {
    constructor() {
        super({size: 'A4'});
        this.counter = 0;
        this.sequence = 0;
    }

    character(character) {
        if (this.counter++ % 120 == 0) {
            delete this._fontFamilies['KaiTi'];
            this.registerFont(`simkai_${++this.sequence}`, 'simkai.ttf');
        }
        this.font(`simkai_${this.sequence}`);
        this.fontSize(32);
        this.fillColor('red');
        this.text(character.character);

        this.font('calibri.ttf');
        this.fontSize(10);
        this.fillColor('black');
        this.text(character.pinyin);
    }

}

module.exports = ChineseDocument;