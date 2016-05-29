'use strict';

const fs = require('fs');
const csv = require('fast-csv');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const Poster = require('./poster_document');
const hskWords = require('./data/hsk.json');
const unihan = require('./data/unihan.json');

const colors = {
    '1': 'cornflowerblue',
    '2': 'mediumseagreen',
    '3': 'lightsalmon',
    '4': 'indianred',
    '0': 'lightslategray'
}

function tone(pinyin) {
    const tones = [/\u0304/, /\u0301/, /\u030C/, /\u0300/];
    let normalizedPinyin = pinyin.normalize('NFD');
    for (let index = 0; index < 4; index++) {
        if (tones[index].test(normalizedPinyin)) {
            return index + 1;
        }
    }
    return 0;
}

function pinyin(pinyins) {
    return Array.from(pinyins).splice(0, 2).join(', ');
}

function definition(definitions) {
    return Array.from(definitions).map(majorDefinition => {
        return majorDefinition.split(',')[0];
    }).join(',');
}



const hskCharacters = [uniqueHSK(1), uniqueHSK(2), uniqueHSK(3), uniqueHSK(4), uniqueHSK(5), uniqueHSK(6)];

const characters = new Map();
const words = new Set();

function uniqueCharacters(words, existing = new Set()) {
    for (const word of words) {
        for (const character of word) {
            existing.add(character);
        }
    }
    return existing;
}

function uniqueHSK(level) {
    let unique = new Set();
    for (const wordsForLevel of hskWords.slice(0, level)) {
        unique = uniqueCharacters(wordsForLevel, unique);
    }
    return unique;
}

function missingHSK(level, knownCharacters) {
    const missingCharacters = new Set();
    for (const shouldKnow of uniqueHSK(level)) {
        if (!knownCharacters.has(shouldKnow)) {
            missingCharacters.add(shouldKnow);
        }
    }
    return missingCharacters;
}

function hskLevel(hsk, word) {
    for (let [index, list] of hsk.entries()) {
        if (list.indexOf(word) != -1) {
            return index + 1;
        }
    }
    return 0;
}

fs.createReadStream("src/data/flash-final-s.txt").pipe(csv({delimiter: '\t'}))
    .on("data", ([word]) => {
        if (!word) return;
        words.add(word);
        for (const character of word) {
            const entry = characters.get(character) || {character: character, words: new Set()};
            entry.words.add(word);
            characters.set(character, entry);
        }
    })
    .on("end",() => {
        let characterList = [...characters.values()];

        const knownSet = new Set(characters.keys());

        for (let level = 1; level <= 6; level++) {
            const missing = missingHSK(level, knownSet).size;
            const unique = uniqueHSK(level).size;
            const completeRatio = Math.round(100 * (1 - missing / unique));

            console.log(`HSK ${level}: you miss ${missing} characters out of ${unique}. Complete ratio: ${completeRatio}%`);
            console.log(missingHSK(level, knownSet));
        }

        console.log(`There are ${characterList.length} distincts characters`);

        characterList.sort((element1, element2) => element2.words.size - element1.words.size);


        const app = express();
        app.set('views', path.join(__dirname, '../views'));
        app.set('view engine', 'pug');
        app.use(bodyParser.urlencoded({extended: true, limit: false}));

        app.get('/', (req, res) => {
            res.render('index.pug');
        });
        /**app.post('/generate', (req, res) => {
            const document = new Poster({size: req.body.size, layout: req.body.layout}, req.body.lines, req.body.columns);
            document.pipe(res);

            for (const character of req.body.characters.split(/[,;\t]/)) {
                if (!unihan[character]) {
                    console.log(`No information about character ${character}`);
                }

                document.next((document, cell) => {
                    document.font('chinese');
                    document.fontSize(cell.fit(0.60));
                    document.fillColor(colors[tone(unihan[character].pinyin[0])]);
                    document.text(character, 0, 0, {lineBreak: false, width: cell.width, height: cell.height, align: 'center'});

                    document.font(`fonts/calibri.ttf`);
                    document.fillColor('black');
                    document.fontSize(cell.fit(0.15));

                    document.text(pinyin(unihan[character].pinyin), 0, cell.fit(0.60), {width: cell.width, align: 'center'});
                    document.text(definition(unihan[character].definition), 0, cell.fit(0.75), {lineBreak: true, width: cell.width, height: 10, align: 'center', ellipsis: true});
                });
            }
            document.end();
        });**/
        app.get('/download', (req, res) => {
            //const document = new Poster({size: 'A4', layout: 'portrait'}, 22, 15);
            const document = new Poster({size: 'A3', layout: 'landscape'}, 22, 29);
            //const document = new Poster({size: 'A4', layout: 'portrait'}, 1, 1);

            document.pipe(res);
            for (let character of characterList) {
                document.next((document, cell) => {
                    document.font('chinese');
                    document.fontSize(cell.fit(0.60));

                    document.fillColor(colors[tone(unihan[character.character].pinyin[0])]);
                    document.text(character.character, 0, 0, {lineBreak: false, width: cell.width, height: cell.height, align: 'center'});

                    document.font(`fonts/calibri.ttf`);
                    document.fillColor('black');
                    document.fontSize(cell.fit(0.15));

                    document.text(pinyin(unihan[character.character].pinyin), 0, cell.fit(0.60), {width: cell.width, align: 'center'});
                    document.text(definition(unihan[character.character].definition), 0, cell.fit(0.75), {lineBreak: true, width: cell.width, height: cell.fit(0.15), align: 'center', ellipsis: true});
                    document.text(character.words.size, 0, 0, {width: cell.width, align: 'left', lineBreak: false});
                });
            }
            document.end();
        });
        app.get('/download2', (req, res) => {
            //const document = new Poster({size: 'A4', layout: 'portrait'}, 22, 15);
            const document = new Poster({size: 'A3', layout: 'landscape'}, 10, 30);
            //const document = new Poster({size: 'A4', layout: 'portrait'}, 1, 1);

            document.pipe(res);
            for (let character of characterList) {
                document.next((document, cell) => {
                    document.font('chinese');
                    document.fontSize(cell.fit(1.00));

                    document.fillColor(colors[tone(unihan[character.character].pinyin[0])]);
                    document.text(character.character, 0, 0, {lineBreak: false, width: cell.width, height: cell.height, align: 'center'});

                    document.font('chinese');
                    document.fillColor('black');
                    document.fontSize(cell.h(0.15));





                });

                document.next((document, cell) => {
                    let usage = [...character.words].filter(word => word.length > 1).sort((word1, word2) => word1.length - word2.length);
                    document.font('chinese');
                    document.fillColor('black');
                    document.fontSize(cell.fit(0.15));
                    document.text(usage.join(','), 0, 0, {lineBreak: false, width: cell.width, height: cell.height, align: 'center', ellipsis: true});

                });
            }
            document.end();
        });

        app.listen(80);
    })


