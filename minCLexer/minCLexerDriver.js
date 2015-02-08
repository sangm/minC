var readline = require('readline');
var minCLexer = require('./minCLexer.js');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var handleInput = function(line) {
    minCLexer.setInput(line);
    var result = minCLexer.lex();
    while (result !== 1) {
        console.log(result);
        result = minCLexer.lex();
    }
}

rl.on('line', function(line) {
    handleInput(line);
})
