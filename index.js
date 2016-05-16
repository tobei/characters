'use strict';

const fs = require('fs');
const csv = require('fast-csv');
const express = require('express');
const hanzi = require('hanzi');
const ChineseDocument = require('./document');
const hskWords = require('./hsk.json');
const hskCharacters = [uniqueHSK(1), uniqueHSK(2), uniqueHSK(3), uniqueHSK(4), uniqueHSK(5), uniqueHSK(6)];

hanzi.start();
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

fs.createReadStream("flash-1604161443.txt").pipe(csv({delimiter: '\t'}))
    .on("data", ([word]) => {
        words.add(word);
        for (const character of word) {
            const entry = characters.get(character) || {character: character, words: new Set(), pinyin: hanzi.getPinyin(character)};
            entry.words.add(word);
            characters.set(character, entry);
        }
    })
    .on("end",() => {
        const characterList = [...characters.values()];
        const knownSet = new Set(characters.keys());

        for (let level = 1; level <= 6; level++) {
            const missing = missingHSK(level, knownSet).size;
            const unique = uniqueHSK(level).size;
            const completeRatio = Math.round(100 * (1 - missing / unique));

            console.log(`HSK ${level}: you miss ${missing} characters out of ${unique}. Complete ratio: ${completeRatio}%`);
        }

        const pages = 20;
        const value = Math.sqrt(characterList.length / (pages * 1.414));
        const columns = Math.floor(value);
        const lines = Math.ceil(1.414 * value);

        console.log(characterList.length);
        const app = express();
        app.get('/', (req, res) => {
            console.log(characterList.length);
            const document = new ChineseDocument(lines, columns);
            document.pipe(res);

            for (let [index, character] of characterList.entries()) {
                document.character(character, Math.floor(index / 10) % 10, index % 10);
                if (index != 0 && index % 100 == 0) {
                    document.addPage();
                }
            }
            document.end();
            document.render(characterList);
        });
        app.listen(80);
    })


