'use strict';

const fs = require('fs');
const csv = require('fast-csv');
const express = require('express');
const hanzi = require('hanzi');
const ChineseDocument = require('./document');

hanzi.start();
const characters = new Map();


fs.createReadStream("data.txt").pipe(csv({delimiter: '\t'}))
    .on("data", ([word]) => {
        for (const character of word) {
            const entry = characters.get(character) || {character: character, words: new Set(), pinyin: hanzi.getPinyin(character)};
            entry.words.add(word);
            characters.set(character, entry);
        }
    })
    .on("end",() => {
        const characterList = [...characters.values()];
        const pages = 1;
        const value = Math.sqrt(characterList.length / (pages * 1.414));
        const columns = Math.ceil(value);
        const lines = Math.ceil(1.414 * value);

        console.log(characterList.length);
        const app = express();
        app.get('/', (req, res) => {
            console.log(characterList.length);
            const document = new ChineseDocument(lines, columns);
            document.pipe(res);
            document.render(characterList);
        });
        app.listen(80);
    })


