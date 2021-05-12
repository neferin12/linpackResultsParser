#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const term = require('terminal-kit').terminal;
const ObjectsToCsv = require('objects-to-csv');

try {
    (async () => {

        const args = process.argv.slice(2);
        if (!args.length) {
            term('Choose a file: ');
            args.push(await term.fileInput())
        }

        for (const input of args) {
            if (!fs.existsSync(input)) {
                await term.red("\n File '%s' does not exist!\n", input);
                continue;
            }

            await term.green("\nParsing '%s'\n", input);

            const x = await term.singleColumnMenu(['N', 'NB', 'P', 'Q', 'Time']).promise
            const data = fs.readFileSync(input, {encoding: "utf8"});
            const regex = /(?<=T\/V\s+N\s+NB\s+P\s+Q\s+Time\s+Gflops\n-+\n).+/g
            let reses = [...data.matchAll(regex)].map(item => {
                const data = item[0].match(/(?<=\S+\s+)\S+/g)
                const ret = {};
                ret[x.selectedText] = Number.parseFloat(data[x.selectedIndex]);
                ret['GFlops'] = Number.parseFloat(data[5]);
                return ret;
            });

            const resultFile = `./${path.basename(input)}.csv`

            const csv = new ObjectsToCsv(reses);
            await csv.toDisk(resultFile, {});

            term.green("\nSaved %d results to '%s'\n",reses.length, resultFile);
        }
        process.exit(0);
    })();
} catch (e){
    console.error(e);
    process.exit(1);
}
