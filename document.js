'use strict';

const PDF = require('pdfkit');

class ChineseDocument extends PDF {
    constructor() {
        super({size: 'A4'});
        this.counter = 0;
        this.sequence = 0;
        this.registerFont('calibri', './calibri.ttf');
    }

    chinese(size, color) {
        if (this.counter++ % 50 == 0) {
            delete this._fontFamilies['KaiTi'];
            this.sequence++;
            this.registerFont(`simkai_${this.sequence}`, './simkai.ttf');
        }
        this.font(`simkai_${this.sequence}`);
        this.fontSize(size);
        this.fillColor(color);
    }


    pinyin(size, color) {
        this.font("calibri");
        this.fontSize(size);
        this.fillColor(color);
    }
}

module.exports = ChineseDocument;