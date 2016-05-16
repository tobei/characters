'use strict';

const PDF = require('pdfkit');

class ChineseDocument extends PDF {
    constructor(lines, columns) {
        super({size: 'A4'});
        this.colors = {
            '1': 'cornflowerblue',
            '2': 'mediumseagreen',
            '3': 'lightsalmon',
            '4': 'indianred',
            '5': 'lightslategray'
        }
        this.grid = {
            lines: lines,
            columns: columns
        }
        this.offsets = {
            margin: {
                horizontal: 30,
                vertical: 30
            },
            padding: {
                horizontal: 0,
                vertical: 0
            }
        }
        this.metrics = {
            width: Math.floor((595 - 2 * this.offsets.margin.horizontal) / this.grid.columns),
            height: Math.floor((842 - 2 * this.offsets.margin.vertical) / this.grid.lines)
        }
        this.counter = 0;
        this.sequence = 0;
    }

    render(iterable) {
        let index = 0;
        let pageSize = this.grid.lines * this.grid.columns;
        for (let character of iterable) {
            if (index > 0 && index % pageSize == 0) {
                this.addPage();
            }
            let position = {
                line: Math.floor(index / this.grid.columns) % this.grid.lines,
                column: index % this.grid.columns
            }
            this.x = this.offsets.margin.horizontal + position.column * this.metrics.width;
            this.y = this.offsets.margin.vertical + position.line * this.metrics.height;
            this._character(character);
            index++;
        }
        this.end();
    }


    _character(character) {
        if (this.counter++ % 60 == 0) {
            delete this._fontFamilies['KaiTi'];
            this.registerFont(`simkai_${++this.sequence}`, 'simkai.ttf');
        }
        this.font(`simkai_${this.sequence}`);
        //console.log(Math.min(this.metrics.width, this.metrics.height));
        this.fontSize(Math.round(0.70 * Math.min(this.metrics.width, this.metrics.height)));
        console.log(`character ${character.character} usages ${character.words.size}`);
        this.fillColor([Math.floor((character.words.size - 1) / 5 * 255), 0, 0]);
        this.text(character.character, {lineBreak: false});
    }
}

module.exports = ChineseDocument;