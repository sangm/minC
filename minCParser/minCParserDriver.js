var colors = require('colors/safe');
var fs = require('fs');
var minCParser = require('./dist/minCParser.js');
var print = require('./dist/util.js').print;
var printTable = require('./dist/util.js').printTable;
var Table = require('cli-table');
var readline = require('readline');

var blue = colors.blue;

function handleInput(data) {
    try {
        var parser = minCParser.parse(data);
        var ast = parser.ast;
        var symTable = parser.table.table;
        console.log(colors.magenta(data));
        printTable(symTable);
        print(ast);
    }
    catch(err) {
        console.log(err);
    }
}

if (process.argv.length <= 2) {
    console.log(blue("Usage: node minCParser.js filename"));
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', function(line) {
        handleInput(line);
    })
}
else {
    fs.readFile(process.argv[2], 'utf8', function(err, data) {
        if (err)
            console.log(red("Could not fild the file %s"), process.argv[2])
        else {
            handleInput(data);
        }
    })
}
