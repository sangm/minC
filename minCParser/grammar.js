(function () {
    var validate = require('../validate-tokens.js');
    function functionsToString(functions) {
        var result = Object.keys(validate).map(function(v) {
            return String(validate[v]);
        });
        return result.join('\n');
    };
    var grammar = {
        macros: {
            "identifier": "[a-zA-Z][a-zA-Z0-9]*",
            "word": "[a-zA-Z0-9_]",
        },
        actionInclude: functionsToString(validate),
        rules: [
            ["if",                      "return 'KWD_IF';"],
            ["else",                    "return 'KWD_ELSE';"],
            ["while",                   "return 'KWD_WHILE'"],
            ["int",                     "return 'KWD_INT'"],
            ["string",                  "return 'KWD_STRING'"],
            ["char",                    "return 'KWD_CHAR'"],
            ["return",                  "return 'KWD_RETURN'"],
            ["void",                    "return 'KWD_VOID'"],

            ["{identifier}",            "return 'ID'"],
            ["\\d+",                    "return validateNumber(yytext, yylloc)"],
            ['("|\')((?:(?=(\\\\?))\\3(?:.|\\n))*?)\\1', "return validateString(yytext, yylloc)"],
            
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
                return validateInvalidToken(yytext, yylloc);
            }],
            /* ["\\/\\*(?:.|\\n)*?\\*\\/", "/* skip comments "], */ 

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
            ["=",                       "return 'OPER_ASG'"],

            ["\\[",                     "return 'LSQ_BRKT'"],
            ["\\]",                     "return 'RSQ_BRKT'"],
            ["\\{",                     "return 'LCRLY_BR'"],
            ["\\}",                     "return 'RCRLY_BR'"],

            ["\\(",                     "return 'LPAREN'"],
            ["\\)",                     "return 'RPAREN'"],

            [",",                       "return 'COMMA'"],
            [";",                       "return 'SEMICLN'"],

            ["\\s+", "/* skip spaces */"],
            ["$", "return 'EOF'"],
            [".", function() {
                if (this.matched === '"') {
                    // consume rest of characters
                    while (this.input());
                }
                return validateInvalidToken(yytext, yylloc);
            }],
        ],
        options: {flex: true}
    };
    module.exports = grammar;
})();
