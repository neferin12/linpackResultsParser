#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const term = require('terminal-kit').terminal;
const ObjectsToCsv = require('objects-to-csv');

try {
    (async () => {
        term('Choose a file: ');
        const input = await term.fileInput();
        await term.green("\nParsing '%s'\n", input);

        const x = await term.singleColumnMenu(['N', 'NB', 'P', 'Q', 'Time']).promise
        fs.readFile(input, "utf8", function (err, data) {
            const regex = /(?<=T\/V\s+N\s+NB\s+P\s+Q\s+Time\s+Gflops\n-+\n).+/g
            let reses = [...data.matchAll(regex)].map(item => {
                const data = item[0].match(/(?<=\S+\s+)\S+/g)
                const ret = {};
                ret[x.selectedText] = Number.parseFloat(data[x.selectedIndex]);
                ret['GFlops'] = Number.parseFloat(data[5]);
                return ret;
            });

            const resultFile = `./${path.basename(input)}.csv`

            const csv = new ObjectsToCsv(reses)
            csv.toDisk(resultFile, {}).finally(() => process.exit(0));

            term.green("\nSaved %d results to '%s'\n",reses.length, resultFile);
        });
    })();
} catch (e){
    console.error(e);
    process.exit(1);
}
