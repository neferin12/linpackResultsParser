#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const term = require('terminal-kit').terminal;
const ObjectsToCsv = require('objects-to-csv');
const version = require('./package.json').version;

/**
 *
 * @param s the value to search for
 * @param pat the filename pattern
 * @param file the filename
 * @returns {Number}
 */
function getValueForFor(s, pat, file) {
    let split = pat.split(s);
    if (split.length !== 2) {
        throw new Error('Pattern falsch formatiert')
    }
    split = split.map(it => it.replace(/(%n|%f)/g, '.+'))

    return Number.parseFloat(file.match(new RegExp(`(?<=${split[0]}).+(?=${split[1]})`))[0]);

}

/**
 *
 * @param pat {String} the pattern
 */
async function parseHPCG(pat) {
    pat = pat.replace('.', '\\.').replace('*', '.+');
    const results = [];
    const wantedFiles = [];
    const reg = new RegExp(pat.replace(/(%n|%f)/g, '.+'))
    for (const file of fs.readdirSync('.')) {
        if (file.match(reg)) {
            wantedFiles.push(file);
        }
    }

    let errors = [];

    for (const file of wantedFiles) {
        try {
            term.grey('Parsing file '+file+"\n");
            const data = {};
            data.f = getValueForFor('%f', pat, file);
            data.n = getValueForFor('%n', pat, file);

            const fileData = fs.readFileSync(file, {encoding: "utf8"});
            const dataRegex = /(?<=Power \[W\] STAT\s+\|\s+)\S+/g
            const w = Number.parseFloat(fileData.match(dataRegex)[0])
            const gflops = Number.parseFloat(fileData.match(/(?<=HPCG result is VALID with a GFLOP\/s rating of )\S+/g)[0]);

            data.gpw = Math.round(gflops*10000 / w)/10000;

            results.push(data);
        }catch (e) {
            term.red('Error parsing file ' + file + ': ' + e.message + '\n');
            errors.push('Error parsing file ' + file + ': ' + e.message + '\n');
        }
    }

    term.red('\nThere were ' + errors.length + ' errors:\n');
    for (const error of errors) {
        term.red(error+'\n');
    }

    const csv = new ObjectsToCsv(results);
    await csv.toDisk('results.csv', {});
}

try {
    (async () => {

        const args = process.argv.slice(2);
        if (!args.length) {
            term('Choose a file: ');
            args.push(await term.fileInput())
        }
        if (args[0] === '-h' || args[0] === '--help') {
            console.log(
                "Verwendung: \n" +
                "linpack-parser [files...]: parses linpack benchmark files\n" +
                "linpack-parser -h: Shows this help\n" +
                "linpack-parser -v: Shows current version\n" +
                "linpack-parser --hpcg filepattern: parses multible hpcg files, must contain %n and %f"
            )
            process.exit(0);
        }
        if (args[0] === '-v') {
            console.log(version);
            process.exit(0);
        }
        if (args[0] === '--hpcg') {
            const reg = args[1];
            if (!reg) {
                await term.red("Regex for files needed\n");
                process.exit(1);
            }
            await parseHPCG(reg);
            term.green('Results saved to result.csv\n');
            process.exit(0);
        }

        for (const input of args) {
            if (!fs.existsSync(input)) {
                await term.red("\n File '%s' does not exist!\n", input);
                continue;
            }

            await term.green("\nParsing '%s'\n", input);

            const x = await term.singleColumnMenu(['N', 'NB', 'P', 'Q', 'Time']).promise;
            const data = fs.readFileSync(input, {encoding: "utf8"});
            const regex = /(?<=T\/V\s+N\s+NB\s+P\s+Q\s+Time\s+Gflops\n-+\n).+/g;
            let reses = [...data.matchAll(regex)].map(item => {
                const data = item[0].match(/(?<=\S+\s+)\S+/g)
                const ret = {};
                ret[x.selectedText] = Number.parseFloat(data[x.selectedIndex]);
                ret['GFlops'] = Number.parseFloat(data[5]);
                return ret;
            });

            const resultFile = `./${path.basename(input)}_${x.selectedText}.csv`;

            const csv = new ObjectsToCsv(reses);
            await csv.toDisk(resultFile, {});

            term.green("\nSaved %d results to '%s'\n", reses.length, resultFile);
        }
        process.exit(0);
    })();
} catch (e) {
    console.error(e);
    process.exit(1);
}
