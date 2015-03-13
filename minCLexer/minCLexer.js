'use strict'; 

(function () {
<<<<<<< HEAD
    var Lexer = require('jison-lex');
    var grammar = require('./grammar.js');
    var minCLexer = Lexer(grammar);
    minCLexer.object = function(value) {
        var result = {}
        result[value] = this.yytext;
        return result;
    }
    module.exports = minCLexer;
})()

