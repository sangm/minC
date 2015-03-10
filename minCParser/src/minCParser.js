'use strict';

import {Parser} from 'jison'
import lexGrammar from '../grammar.js'

// a grammar in JSON
let grammar = {
    // JavaScript comments also work
    "operators": [
        ["left", "+", "-"],
        ["left", "*", "/"],
        ["left", "^"],
        ["right", "!"],
        ["right", "%"],
        ["left", "UMINUS"]
    ],
    
    "start": "program",
    
    "bnf": {
        "program": [["declList EOF", ""]],

        "declList"      : ["decl", "decl declList"],
        "decl"          : ["varDecl", "funcDecl"],
        "varDecl"       : ["typeSpecifier ID LSQ_BRKT INTCONST RSQ_BRKT SEMICLN", "typeSpecifier ID SEMICLN"],
        "typeSpecifier" : ["KWD_INT", "KWD_CHAR", "KWD_VOID", "KWD_STRING"],
        "funcDecl"      : ["typeSpecifier ID LPAREN formalDeclList RPAREN funBody", "typeSpecifier ID LPAREN RPAREN funBody"],
        "funBody"       : ["LCRLY_BR localDeclList statementList RCRLY_BR"],
        "localDeclList" : ["", "varDecl localDeclList"],
        "statementList" : ["", "statement statementList"],
        "statement"     : ["compoundStmt", "assignStmt", "condStmt", "loopStmt", "returnStmt"],
        "compoundStmt"  : ["LCRLY_BR statementList RCRLY_BR"],
        "assignStmt"    : ["var OPER_ASG expression SEMICLN", "expression SEMICLN"],
        "condStmt"      : ["if LPAREN expression RPAREN statement", "if LPAREN expression RPAREN statement else statement"],
        "loopStmt"      : ["while LPAREN expression RPAREN statement"],
        "returnStmt"    : ["return SEMICLN", "return expression SEMICLN"],
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
    }
}

grammar.lex = lexGrammar;
// `grammar` can also be a string that uses jison's grammar format
var parser = new Parser(grammar);

export default new Parser(grammar);
