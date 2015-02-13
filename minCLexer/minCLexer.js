'use strict'; 

(function () {
    var minCLexer = require('jison-lex');

    var func = function() { console.log("hello"); } 

    function hello() { console.log(''); }

    var grammar = {
        macros: {
            "identifier": "[a-zA-Z][a-zA-Z0-9]*",
            "word": "[a-zA-Z0-9_]",
        },
        actionInclude: String(hello), 
        rules: [
            ["if",                      "hello(); return {KWD_IF: yytext};"],
            ["else",                    "return {KWD_ELSE: yytext};"],
            ["while",                   "return {KWD_WHILE: yytext};"],
            ["int",                     "return {KWD_INT: yytext};"],
            ["string",                  "return {KWD_STRING: yytext};"],
            ["char",                    "return {KWD_CHAR: yytext};"],
            ["return",                  "return {KWD_RETURN: yytext};"],
            ["void",                    "return {KWD_VOID: yytext};"],

            ["{identifier}",            "return {'ID': yytext}"],
            ["\\d+",                    "return this.validateNumber(yytext)"],
            ['("|\')((?:(?=(\\\\?))\\3(?:.|\\n))*?)\\1', "return this.validateString(yytext)"],
            ['\\/\\*\s*', function() {
                var result;
                while((result = this.input()) != undefined) {
                    while (result === '*') {
                        result = this.input();
                        if (result == '/') {
                            return;
                        }
                    }
                }
                return this.validateInvalidToken(yytext);
            }],
            /* ["\\/\\*(?:.|\\n)*?\\*\\/", "/* skip comments "], */ 

            ["\\+",                     "return {OPER_ADD: '+'}"],
            ["\\-",                     "return {OPER_SUB: '-'}"],
            ["\\*",                     "return {OPER_MUL: '*'}"],
            ["\\/",                     "return {OPER_DIV: '/'}"],
            ["\\>=",                    "return {OPER_GTE: '>='}"],
            ["\\==",                    "return {OPER_EQ:  '=='}"],
            ["\\!=",                    "return {OPER_NEQ: '!='}"],
            ["\\<=",                    "return {OPER_LTE: '<='}"],
            ["<",                       "return {OPER_LT:  '<'}"],
            [">",                       "return {OPER_GT:  '>'}"],
            ["=",                       "return {OPER_ASGN: '='}"],

            ["\\[",                     "return {LSQ_BRKT: '['}"],
            ["\\]",                     "return {RSQ_BRKT: ']'}"],
            ["\\{",                     "return {LCRLY_BRKT: '{'}"],
            ["\\}",                     "return {RCRLY_BRKT: '}'}"],

            ["\\(",                     "return {LPAREN: '('}"],
            ["\\)",                     "return {RPAREN: ')'}"],

            [",",                       "return {COMMA: ','}"],
            [";",                       "return {SEMICLN: ';'}"],

            ["\\s+", "/* skip spaces */"],
            [".", "return this.validateInvalidToken(yytext)"],
        ],
        options: {flex: true}
    };

    module.exports = new minCLexer(grammar);
})()

