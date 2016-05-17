'use strict';

const PDF = require('pdfkit');
const unihan = require('./data.json');

function tone(pinyin) {
    const tones = [/\u0304/g, /\u0301/g, /\u030C/g, /\u0300/g];
    let normalizedPinyin = pinyin.normalize('NFD');
    for (let index = 0; index < 4; index++) {
        if (tones[index].test(normalizedPinyin)) {
            return index + 1;
        }
    }
    return 0;
}

function pinyin(pinyins) {
    return pinyins.splice(0, 2).join(',');
}

function definition(definitions) {
    return definitions.splice(0, 2).map(majorDefinition => {
        return majorDefinition.split(',')[0];
    }).join(',');
}

class ChineseDocument extends PDF {
    constructor(lines, columns) {
        super({size: 'A4'});
        this.colors = {
            '1': 'cornflowerblue',
            '2': 'mediumseagreen',
            '3': 'lightsalmon',
            '4': 'indianred',
            '0': 'lightslategray'
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
            width: Math.floor((595 - 10 - 2 * this.offsets.margin.horizontal) / this.grid.columns),
            height: Math.floor((842 - 10 - 2 * this.offsets.margin.vertical) / this.grid.lines)
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

            this.x = this.offsets.margin.horizontal + (position.column) * this.metrics.width;
            this.y = this.offsets.margin.vertical + (position.line + 0.60) * this.metrics.height;
            this.fillColor('black');
            this.font(`calibri.ttf`);
            this.fontSize(Math.round(0.15 * Math.min(this.metrics.width, this.metrics.height)));
            this.text(pinyin(unihan[character.character].pinyin), {lineBreak: false, width: this.metrics.width, height: this.metrics.height, align: 'center'});

            this.x = this.offsets.margin.horizontal + (position.column) * this.metrics.width;
            this.y = this.offsets.margin.vertical + (position.line + 0.75) * this.metrics.height;
            this.font(`calibri.ttf`);
            this.fontSize(Math.round(0.15 * Math.min(this.metrics.width, this.metrics.height)));
            this.text(definition(unihan[character.character].definition), {lineBreak: true, width: this.metrics.width, height: 10, align: 'center', ellipsis: true});

            this.x = this.offsets.margin.horizontal + (position.column) * this.metrics.width;
            this.y = this.offsets.margin.vertical + (position.line) * this.metrics.height;
            this.font(`calibri.ttf`);
            this.fontSize(Math.round(0.15 * Math.min(this.metrics.width, this.metrics.height)));
            this.text(character.words.size, {lineBreak: true, width: this.metrics.width, height: 10, align: 'left', ellipsis: true});

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
        this.fontSize(Math.round(0.60 * Math.min(this.metrics.width, this.metrics.height)));
        const t = tone(unihan[character.character].pinyin[0]);
        this.fillColor(this.colors[t]);
        this.text(character.character, {lineBreak: false, width: this.metrics.width, height: this.metrics.height, align: 'center'});
    }
}

module.exports = ChineseDocument;