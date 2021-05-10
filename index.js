const fs = require('fs');
const term = require('terminal-kit').terminal;
const ObjectsToCsv = require('objects-to-csv');

try {
    (async () => {
        term('Choose a file: ');
        const input = await term.fileInput();
        term.green("\nParsing '%s'\n", input);
        fs.readFile(input, "utf8", function (err, data) {
            const regex = /(?<=T\/V\s+N\s+NB\s+P\s+Q\s+Time\s+Gflops\n-+\n).+/g
            let reses = [...data.matchAll(regex)].map(item => {
                const data = item[0].match(/(?<=\S+\s+)\S+/g)
                const ret = {N: 0, GFlops: 0};
                ret.N = Number.parseFloat(data[0]);
                ret.GFlops = Number.parseFloat(data[5]);
                return ret;
            });

            const csv = new ObjectsToCsv(reses)
            csv.toDisk('./results.csv');
            process.exit(0);
        });
    })();
} catch (e){
    console.error(e);
    process.exit(1);
}
