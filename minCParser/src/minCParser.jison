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
            var id = new TerminalNode(ParserConstants.ID, $2, @2);
            var intConst = new TerminalNode(ParserConstants.intConst, $4, @4);
            $$ = new NonterminalNode(ParserConstants.arrayDecl, [$1, id, intConst], @1);
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
    : LCRLY_BRKT localDeclList statementList RCRLY_BRKT
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
    : LCRLY_BRKT statementList RCRLY_BRKT
        {
            $$ = new NonterminalNode(ParserConstants.compoundStmt, $2, @2);
        }
    ;
    
assignStmt
    : var OPER_ASGN expression SEMICLN 
        {
            $$ = new NonterminalNode(ParserConstants.assignStmt, [$1, $3], @1);
        }
    | expression SEMICLN
        {
            $$ = new NonterminalNode(ParserConstants.assignStmt, $1, @1);
        }
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
        {
            $$ = new TerminalNode(ParserConstants.ID, $1, @1);
        }
    | ID LSQ_BRKT addExpr RSQ_BRKT
        {
            var id = new TerminalNode(ParserConstants.ID, $1, @1);
            $$ = new NonterminalNode(ParserConstants.arrayDecl, [id, $3], @1);
        }
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
        {
        }
    | addExpr addop term
        {
            $$ = new NonterminalNode(ParserConstants.addExpr, [$1, $2, $3], @1);
        }
    ;

addop
    : OPER_ADD { $$ = new TerminalNode(ParserConstants.addOp, $1, @1); }
    | OPER_SUB { $$ = new TerminalNode(ParserConstants.subOp, $1, @1); }
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
    | INTCONST { $$ = new TerminalNode(ParserConstants.intConst, $1, @1); }
    | CHARCONST { $$ = new TerminalNode(ParserConstants.charConst, $1, @1); }
    | STRCONST  { $$ = new TerminalNode(ParserConstants.strConst, $1, @1); }
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

var TerminalNode = Tree.TerminalNode;
var NonterminalNode = Tree.NonterminalNode;

function log(obj) {
    console.log(JSON.stringify(obj, null, 2));
}
