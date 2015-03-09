'use strict'; 

(function () {
    var minCLexer = require('jison-lex');
    var grammar = require('../grammar.js');
    module.exports = new minCLexer(grammar);
})()

