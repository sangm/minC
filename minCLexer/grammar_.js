var validate = require('../validate-tokens.js');
/*
 *
    operators: [
        ["right", 'IF_WITHOUT_ELSE', 'KWD_ELSE' ]
    ],
    "start": "program",
    
    "bnf": {
        "program": [["declList EOF", "$$ = ['PROGRAM']; return $$"], "EOF"],

        "declList"      : ["decl", "decl declList"],
        "decl"          : ["varDecl", "funcDecl"],
        "varDecl"       : ["typeSpecifier ID LSQ_BRKT INTCONST RSQ_BRKT SEMICLN", "typeSpecifier ID SEMICLN"],
        "typeSpecifier" : ["KWD_INT", "KWD_CHAR", "KWD_VOID", "KWD_STRING"],
        "funcDecl"      : ["typeSpecifier ID LPAREN formalDeclList RPAREN funBody", "typeSpecifier ID LPAREN RPAREN funBody"],
        "formalDeclList": ["formalDecl", "formalDecl COMMA formalDeclList"],
        "formalDecl"    : ["typeSpecifier ID", "typeSpecifier ID LSQ_BRKT RSQ_BRKT"],
        "funBody"       : ["LCRLY_BR localDeclList statementList RCRLY_BR"],
        "localDeclList" : ["", "varDecl localDeclList"],
        "statementList" : ["", "statement statementList"],
        "statement"     : ["compoundStmt", "assignStmt", "condStmt", "loopStmt", "returnStmt"],
        "compoundStmt"  : ["LCRLY_BR statementList RCRLY_BR"],
        "assignStmt"    : ["var OPER_ASG expression SEMICLN", "expression SEMICLN"],
        "condStmt"      : [["KWD_IF LPAREN expression RPAREN statement", { prec: 'IF_WITHOUT_ELSE' }], "KWD_IF LPAREN expression RPAREN statement KWD_ELSE statement"],
        "loopStmt"      : ["KWD_WHILE LPAREN expression RPAREN statement"],
        "returnStmt"    : ["KWD_RETURN SEMICLN", "KWD_RETURN expression SEMICLN"],
        "var"           : ["ID", "ID LSQ_BRKT addExpr RSQ_BRKT"],
        "expression"    : ["addExpr", "expression relop addExpr"],
        "relop"         : ["OPER_LTE", "OPER_LT", "OPER_GT", "OPER_GTE", "OPER_EQ", "OPER_NEQ"],
        "addExpr"       : ["term", "addExpr addop term"],
        "addop"         : ["OPER_ADD", "OPER_SUB"],
        "term"          : ["factor", "term mulop factor"],
        "mulop"         : ["OPER_MUL", "OPER_DIV"],
        "factor"        : ["LPAREN expression RPAREN", "var", "funcCallExpr", "INTCONST", "CHARCONST", "STRCONST"],
        "funcCallExpr"  : ["ID LPAREN argList RPAREN", "ID LPAREN RPAREN"],
        "argList"       : ["expression", "argList COMMA expression"]
    },
    */
var grammar = {
    macros: {
        "identifier": "[a-zA-Z][a-zA-Z0-9]*",
        "word": "[a-zA-Z0-9_]",
    },
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
    moduleInclude: validate.validateNumber + validate.invalidToken + validate.validateString,
    options: {flex: true}
};
module.exports = grammar;
