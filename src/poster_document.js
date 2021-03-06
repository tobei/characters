'use strict';

const ChineseDocument = require('./chinese_document');

class PosterDocument extends ChineseDocument {
    constructor(options, lines, columns) {
        super(options);

        this.grid = {
            lines: lines,
            columns: columns,
            size: lines * columns
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
            width: (this.page.width - 2 * this.offsets.margin.horizontal) / this.grid.columns,
            height: (this.page.height - 2 * this.offsets.margin.vertical) / this.grid.lines
        }

        this.font('fonts/Righteous-Regular.ttf');
        this.fontSize(20);
        const message = 'Marie Haps 2014-2016';
        this.fillColor('black');
        this.text(message, this.page.width - this.offsets.margin.horizontal - this.widthOfString(message), this.page.height - this.offsets.margin.vertical - this.metrics.height + 7, {lineBreak: false});
        this.index = 0;
    }

    next(callback) {
        if (this.index > 0 && this.index % this.grid.size == 0) {
            this.addPage();
        }

        this.save();
        try {
            const cell = {
                index: this.index,
                line: Math.floor(this.index / this.grid.columns) % this.grid.lines,
                column: this.index % this.grid.columns,
                page: this.index % this.grid.size,
                height: this.metrics.height,
                width: this.metrics.width,
                fit: ratio => Math.floor(ratio * Math.min(this.metrics.width, this.metrics.height)),
                h: ratio => Math.floor(ratio * this.metrics.height),
                w: ratio => Math.floor(ratio * this.metrics.width)
            }
            const translation = {
                horizontal: this.offsets.margin.horizontal + cell.column * cell.width,
                vertical: this.offsets.margin.vertical + cell.line * cell.height
            }
            this.translate(translation.horizontal, translation.vertical);
            callback(this, cell);
        } catch (exception) {
            console.error(exception);
        } finally {
            this.restore();
            this.index++;
        }
    }

}

module.exports = PosterDocument;