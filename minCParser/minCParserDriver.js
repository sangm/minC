var colors = require('colors/safe');
var fs = require('fs');
var minCParser = require('./dist/minCParser.js');
var print = require('./dist/util.js').print;
var printTable = require('./dist/util.js').printTable;
var Table = require('cli-table');

if (process.argv.length <= 2) {
    console.log(blue("Usage: node minCParser.js filename"));
}
else {
    fs.readFile(process.argv[2], 'utf8', function(err, data) {
        if (err)
            console.log(red("Could not fild the file %s"), process.argv[2])
        else {
            var parser = minCParser.parse(data);
            var ast = parser.ast;
            var symTable = parser.table.table;
            console.log(colors.magenta(data));
            console.log(print);
            printTable(symTable);
            print(ast);
        }
    })
}
