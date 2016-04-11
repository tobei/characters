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
        const app = express();
        app.get('/', (req, res) => {
            const document = new ChineseDocument();
            document.pipe(res);

            for (const character of characterList) {
                document.character(character);
            }

            document.end();
        });
        app.listen(80);
    })


