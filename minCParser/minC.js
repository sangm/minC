require('babel/register');

var fs = require('fs');
var colors = require('colors/safe');
var readline = require('readline');
var minCParser = require('./dist/minCParser.js');

var blue = colors.blue;
var red = colors.red;
var args = require('minimist')(process.argv.slice(2));

var print = require('./dist/util.js').print;
var printTable = require('./dist/util.js').printTable;

var Table = require('cli-table');
var readline = require('readline');

var codeGen = require('./src/code-gen.js'),
    codeGen = new codeGen();
var ASM = require('./dist/asm.js');

console.log(blue("Usage: node minC.js --file(optional) filename --folding(optional) "));

function handleInput(data) {
    try {
        var parser = minCParser.semantic(data, args);
        var ast = parser.ast;
        var symTable = parser.table;
        console.log(colors.magenta(data));
        if (args['ast']) {
            print(ast);
        }
        if (args['table']) {
            printTable(symTable.table);
        }
        if (args["asm"]) {
            // do code generation here
            var asm = codeGen.generate(ast, symTable);
            console.log(ASM.generate(asm))
        }
    }
    catch(err) {
        console.log(red(err));
    }
}

if (args.file) {
    fs.readFile(args.file, 'utf8', function(err, data) {
        if (err)
            console.log(red("Could not fild the file %s"), args.file)
        else {
            handleInput(data);
        }
    })
}
else {
    console.log("No file specified: running repl; you can use --file flag for files"); 
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', function(line) {
        handleInput(line);
    })
}
