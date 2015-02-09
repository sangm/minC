var fs = require('fs');
var readline = require('readline');
var minCLexer = require('./minCLexer.js');


var handleInput = function(line) {
    minCLexer.setInput(line);
    var result = minCLexer.lex();
    while (result !== 1) {
        console.log(result);
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
