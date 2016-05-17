'use strict';

const PDF = require('pdfkit');

class ChineseDocument extends PDF {
    constructor(options) {
        super(options);
        this.counter = 0;
        this.sequence = 0;
    }

    font(name) {
        if (name == 'chinese') {
            if (this.counter++ % 60 == 0) {
                delete this._fontFamilies['KaiTi'];
                this.registerFont(`simkai_${++this.sequence}`, '../fonts/simkai.ttf');
            }
            super.font(`simkai_${this.sequence}`);
        } else {
            super.font(name);
        }
    }
}

module.exports = ChineseDocument;