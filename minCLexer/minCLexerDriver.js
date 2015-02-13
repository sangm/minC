var fs = require('fs');
var readline = require('readline');
var minCLexer = require('./minCLexer.js');

console.log("minC Scanner");
console.log("provide an extra argument to run a scanner on the file itself");
console.log("built by sangm (Sang Mercado)");
console.log();

var handleInput = function(line) {
    minCLexer.setInput(line);
    var result = minCLexer.lex();
    while (result !== 1) {
        if (typeof result === "object") {
            var key = Object.keys(result);
            console.log('<' + key + ', ' + result[key] + '>');
        }
        else {
            console.log(result);
        }
        result = minCLexer.lex();
    }
}


if (process.argv.length <= 2) {
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
        handleInput(data);
    })
}
