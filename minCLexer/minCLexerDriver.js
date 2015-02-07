var readline = require('readline');
var minCLexer = require('./minCLexer.js');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


rl.on('line', function(line) {
    minCLexer.setInput(line);
    console.log(minCLexer.lex());
    console.log(minCLexer.lex());
})
