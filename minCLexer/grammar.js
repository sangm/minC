(function () {
    var validate = require('./validate-tokens.js');
    var fs = require('fs');

    var grammar = {
        macros: {
            "identifier": "[a-zA-Z][a-zA-Z0-9]*",
            "word": "[a-zA-Z0-9_]",
        },
        actionInclude: validate.validateNumber + validate.invalidToken + validate.validateString,
        rules: [
            ["if",                      "return 'KWD_IF'"],
            ["else",                    "return 'KWD_ELSE'"],
            ["while",                   "return 'KWD_WHILE'"],
            ["int",                     "return 'KWD_INT'"],
            ["string",                  "return 'KWD_STRING'"],
            ["char",                    "return 'KWD_CHAR'"],
            ["return",                  "return 'KWD_RETURN'"],
            ["void",                    "return 'KWD_VOID'"],

            ["{identifier}",            "return 'ID'"],
            ["\\d+", function() {
                var regexPattern = /^[1-9]\d*/;
                if (regexPattern.test(yytext) || yytext === '0') {
                    yytext = parseInt(yytext);
                    return 'INTCONST';
                }
                return invalidToken(yytext, yylloc);
            }],
            ['("|\')((?:(?=(\\\\?))\\3(?:.|\\n))*?)\\1', function() {
                yytext = yytext.replace("\\t", "\t")
                    .replace("\\n", "\n")
                    .replace('\\"', "\"")
                    .replace('\\\\', '\\');
                var result = yytext.substring(1, yytext.length-1);
                if (yytext[0] === "'") {
                    if (result.length > 1)
                        return invalidToken(yytext, yylloc);
                    yytext = result.replace("\\'", "\'");
                    return 'CHARCONST';
                }
                yytext = result;
                return 'STRCONST';
            }],
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
                return invalidToken(yytext, yylloc);
            }],
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
            ["$", "return 'EOF'"],
            [".", function() {
                if (this.match === '"') 
                    while(this.input()); // consume rest of characters
                return invalidToken(yytext, yylloc);
            }],
        ],
        options: {flex: true}
    };
    module.exports = grammar;
})();
