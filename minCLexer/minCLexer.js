'use strict';

(function () {
    var minCLexer = require('jison-lex');

    var grammar = {
        macros: {
            "identifier": "[a-zA-Z][a-zA-Z0-9]*",
            "word": "[a-zA-Z0-9_]",
        },
        rules: [
            ["if", "return 'KWD_IF';"],
            ["else", "return 'KWD_ELSE';"],
            ["while", "return 'KWD_WHILE';"],
            ["int", "return 'KWD_INT';"],
            ["string", "return 'KWD_STRING';"],
            ["char", "return 'KWD_CHAR';"],
            ["return", "return 'KWD_RETURN';"],
            ["void", "return 'KWD_VOID';"],
            ["\\d+", "return this.validateNumber(yytext)"],
            ["'.'", "return {KWD_CHAR:yytext.substring(1,yytext.length-1)}"],
       
            ["{identifier}", "return {'ID': yytext}"],

            ["\\+",                     "return 'OPER_ADD'"],
            ["\\-",                     "return 'OPER_SUB'"],
            ["\\*",                     "return 'OPER_MUL'"],
            ["\\/",                     "return 'OPER_DIV'"],
            ["\\>=",                    "return 'OPER_GTE'"],
            ["\\==",                    "return 'OPER_EQ'"],
            ["\\!=",                    "return 'OPER_NEQ'"],
            ["\\<=",                    "return 'OPER_LTE'"],
            ["<",                       "return 'OPER_LT'"],
            [">",                       "return 'OPER_GT'"],
            ["=",                       "return 'OPER_ASGN'"],

            ["\\[",                     "return 'LSQ_BRKT'"],
            ["\\]",                     "return 'RSQ_BRKT'"],
            ["\\{",                     "return 'LCRLY_BRKT'"],
            ["\\}",                     "return 'RCRLY_BRKT'"],

            ["\\(",                     "return 'LPAREN'"],
            ["\\)",                     "return 'RPAREN'"],

            [",",                       "return 'COMMA'"],
            [";",                       "return 'SEMICLN'"],


            ["\\s+", "/* skip spaces */"],
            [".", "return this.validateInvalidToken(yytext)"],
        ]
    };
    
    module.exports = new minCLexer(grammar);
})()

