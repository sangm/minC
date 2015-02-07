'use strict';

(function () {
    var minCLexer = require('jison-lex');
    var grammar = {
        macros: {
            "identifier": "[a-zA-Z][a-zA-Z0-9]*",
            "spc": "[\t ]",
        },
        rules: [
            ["\\s+", "/* skip spaces */"],
            ["if", "return 'KWD_IF';"],
            ["else", "console.log(yytext); return 'KWD_ELSE';"],
            ["while", "return 'KWD_WHILE';"],
            ["int", "return 'KWD_INT';"],
            ["string", "return 'KWD_STRING';"],
            ["char", "return 'KWD_CHAR';"],
            ["return", "return 'KWD_RETURN';"],
            ["void", "return 'KWD_VOID';"],
            ["{identifier}", "return {'ID': yytext}"],
            ["$", "return 'EOF'"],
            [".", "return 'Unrecognized'"],
        ]
    };
    
    module.exports = new minCLexer(grammar);
})()

