/* lexical grammar */
%lex

IDENTIFIER [a-zA-Z][a-zA-Z0-9]*

%options flex

%%
\/\*\s*                 %{ 
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
                        %}
(\"|\')((?:(?=(\\?))\3(?:.|\n))*?)\1  return validateString(yytext, yylloc); 
\d+                       return 'INTCONST'

"if"                      return 'KWD_IF';
"else"                    return 'KWD_ELSE';
"while"                   return 'KWD_WHILE';
"int"                     return 'KWD_INT';
"string"                  return 'KWD_STRING';
"char"                    return 'KWD_CHAR';
"return"                  return 'KWD_RETURN';
"void"                    return 'KWD_VOID';
"if"                      return 'KWD_IF';
{IDENTIFIER}              return 'ID';
"+"                       return 'OPER_ADD';
"-"                       return 'OPER_SUB';
"*"                       return 'OPER_MUL';
"/"                       return 'OPER_DIV';
">="                      return 'OPER_GTE';
"=="                      return 'OPER_EQ';
"!="                      return 'OPER_NEQ';
"<="                      return 'OPER_LTE';
"<"                       return 'OPER_LT';
">"                       return 'OPER_GT';
"="                       return 'OPER_ASG';
"["                       return 'LSQ_BRKT';
"]"                       return 'RSQ_BRKT';
"{"                       return 'LCRLY_BR';
"}"                       return 'RCRLY_BR';
"("                       return 'LPAREN';
")"                       return 'RPAREN';
","                       return 'COMMA';
";"                       return 'SEMICLN';
\s+                       /* skip spaces */
<<EOF>>                   return 'EOF';

/lex

%right IF_WITHOUT_ELSE KWD_ELSE

%start program

%% /* language grammar */

program
    : declList EOF
        {
            $$ = new NonterminalNode(ParserConstants.Program, $1, @1);
            return $$;
        }
    | EOF { return new NonterminalNode(ParserConstants.Program); }
    ;
  
declList 
    : decl
    | declList decl
    ;

decl
    : varDecl
        {
            $$ = $1;
        }
    | funcDecl
    ;

varDecl
    : typeSpecifier ID LSQ_BRKT INTCONST RSQ_BRKT SEMICLN 
        {
            var terminal = new TerminalNode(ParserConstants.ID, $2, @2);
            $1.terminal.data = 'array ' + $1.terminal.data + $3 + $4 + $5;
            $$ = new NonterminalNode(ParserConstants.varDecl, [$1, terminal], @0);
        }
    | typeSpecifier ID SEMICLN
        {
            var terminal = new TerminalNode(ParserConstants.ID, $2, @2);
            $$ = new NonterminalNode(ParserConstants.varDecl, [$1, terminal], @0);
        }
    ;

typeSpecifier
    : KWD_INT  { $$ = new TerminalNode(ParserConstants.typeSpecifier, $1, @1); }
    | KWD_CHAR { $$ = new TerminalNode(ParserConstants.typeSpecifier, $1, @1); }
    | KWD_VOID { $$ = new TerminalNode(ParserConstants.typeSpecifier, $1, @1); }
    | KWD_STRING { $$ = new TerminalNode(ParserConstants.typeSpecifier, $1, @1); }
    ;
    
funcDecl
    : typeSpecifier ID LPAREN formalDeclList RPAREN funBody
    | typeSpecifier ID LPAREN RPAREN funBody
        {
            $1.terminal.data = 'function ' + $1.terminal.data + $3 + $4;
            var id = new TerminalNode(ParserConstants.ID, $2, @2);
            $$ = new NonterminalNode(ParserConstants.funcDecl, [$1, id, $5], @0)
        }
    ;

formalDeclList
    : formalDecl
    | formalDecl COMMA formalDeclList
    ;

formalDecl
    : typeSpecifier ID
    | typeSpecifier ID LSQ_BRKT RSQ_BRKT
    ;
    
funBody
    : LCRLY_BR localDeclList statementList RCRLY_BR
        {
            $$ = new NonterminalNode(ParserConstants.funBody, [$2, $3], @1);
        }
    ;
    
localDeclList
    : 
        {
            $$ = new NonterminalNode(ParserConstants.localDeclList, null, @1);
        } 
    | localDeclList varDecl
        {
            if ($$ == undefined) {
                $$ = new NonterminalNode(ParserConstants.localDeclList, $2, @1);
            }
            else {
                $$.addChild($2);
            }
        }
    ;

statementList
    :
        {
            $$ = new NonterminalNode(ParserConstants.statementList, null, @1);
        }
    | statementList statement
        {
            if ($$ == undefined) {
                $$ = new NonterminalNode(ParserConstants.statementList, $2, @1);
            }
            else {
                $$.addChild($2);
            }
        } 
    ;
    
statement
    : compoundStmt
    | assignStmt
    | condStmt
    | loopStmt
    | returnStmt
    ;
    
compoundStmt
    : LCRLY_BR statementList RCRLY_BR
        {
            $$ = new NonterminalNode(ParserConstants.compoundStmt, $2, @2);
        }
    ;
    
assignStmt
    : var OPER_ASG expression SEMICLN
    | expression SEMICLN
    ;
    
condStmt
    : KWD_IF LPAREN expression RPAREN statement %prec IF_WITHOUT_ELSE
    | KWD_IF LPAREN expression RPAREN statement KWD_ELSE statement
    ;
    
loopStmt
    : KWD_WHILE LPAREN expression RPAREN statement
    ;
    
returnStmt
    : KWD_RETURN SEMICLN
    | KWD_RETURN expression SEMICLN
    ;

var
    : ID
    | ID LSQ_BRKT addExpr RSQ_BRKT
    ;
    
expression
    : addExpr
    | expression relop addExpr
    ;

relop
    : OPER_LTE
    | OPER_LT
    | OPER_GT
    | OPER_GTE
    | OPER_EQ
    | OPER_NEQ
    ;

addExpr
    : term
    | addExpr addop term
    ;

addop
    : OPER_ADD
    | OPER_SUB
    ;

term
    : factor
    | term mulop factor
    ;

mulop
    : OPER_MUL
    | OPER_DIV
    ;

factor
    : LPAREN expression RPAREN
    | var
    | funcCallExpr
    | INTCONST
    | CHARCONST
    | STRCONST
    ;

funcCallExpr
    : ID LPAREN argList RPAREN
    | ID LPAREN RPAREN
    ;

argList
    : expression
    | argList COMMA expression
    ;
    
%%

var appRoot = require('app-root-path');
var ParserConstants = require(appRoot + '/minCParser/ParserConstants.js');
var Tree = require(appRoot + '/minCParser/src/tree.js');
var valid = require(appRoot + '/validate-tokens.js');

var TerminalNode = Tree.TerminalNode;
var NonterminalNode = Tree.NonterminalNode;

function log(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

parser.ast = {};
parser.validateNumber = valid.validateNumber;
parser.invalidToken = valid.invalidToken;
