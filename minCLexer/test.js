var getTokens = require('./utils.js').getTokens;
var lexer = require('./minCLexer.js');

var result = lexer.setInput('00');
console.log(getTokens(result));

