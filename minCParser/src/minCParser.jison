%right IF_WITHOUT_ELSE KWD_ELSE

%start program

%% /* language grammar */

program
    : declList EOF
        {
            $$ = new NonterminalNode(ParserConstants.Program, $1, @1);
            var parserObject = { ast: $$, table: parser.symbolTable };
            parser.symbolTable = new SymbolTable(ParserConstants.globalScope);
            return parserObject;
        }
    | EOF 
        { 
            $$ = new NonterminalNode(ParserConstants.Program); 
            return {ast: $$, table: parser.symbolTable};
        }
    ;

declList 
    : decl { $$ = new NonterminalNode(ParserConstants.declList, $1, @1); }
    | declList decl { $1.addChild($2); }
    ;

decl
    : varDecl { parser.symbolTable.addTemps(ParserConstants.globalScope); }
    | funcDecl
    ;

varDecl
    : typeSpecifier ID LSQ_BRKT INTCONST RSQ_BRKT SEMICLN 
        {
            $2 = new TerminalNode(ParserConstants.ID, $2, @2);
            $4 = new TerminalNode(ParserConstants.intConst, $4, @4);
            $$ = new NonterminalNode(ParserConstants.arrayDecl, [$1, $2, $4], @1);
            parser.symbolTable.addTemp($2.data, $1.data, ParserConstants.arrayDecl);
        }
    | typeSpecifier ID SEMICLN
        {
            $2 = new TerminalNode(ParserConstants.ID, $2, @2);
            $$ = new NonterminalNode(ParserConstants.varDecl, [$1, $2], @0);
            parser.symbolTable.addTemp($2.data, $1.data);
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
        {
            $2 = new TerminalNode(ParserConstants.ID, $2, @2);
            $$ = new NonterminalNode(ParserConstants.funcDecl, [$1, $2, $4, $6], @1);
            parser.symbolTable.insert($2.data, $1.data, ParserConstants.funcDecl);
            parser.symbolTable.addTemps($2.data);
        }
    | typeSpecifier ID LPAREN RPAREN funBody
        {
            $2 = new TerminalNode(ParserConstants.ID, $2, @2);
            $$ = new NonterminalNode(ParserConstants.funcDecl, [$1, $2, $5], @1)
            parser.symbolTable.insert($2.data, $1.data + $3 + $4, ParserConstants.funcDecl);
            parser.symbolTable.addTemps($2.data);
        }
    ;

formalDeclList
    : formalDecl { $$ = new NonterminalNode(ParserConstants.formalDeclList, $1, @1); }
    | formalDeclList COMMA formalDecl { $1.addChild($3); }
    ;

formalDecl
    : typeSpecifier ID 
        {
            $2 = new TerminalNode(ParserConstants.ID, $2, @2);
            $$ = new NonterminalNode(ParserConstants.formalDecl, [$1, $2]);
            parser.symbolTable.addTemp($2.data, $1.data)
        }
    | typeSpecifier ID LSQ_BRKT RSQ_BRKT
        {
            $2 = new TerminalNode(ParserConstants.ID, $2, @2);
            var array = new NonterminalNode(ParserConstants.arrayDecl, [$1, $2], @1);
            $$ = new NonterminalNode(ParserConstants.formalDecl, array);
            parser.symbolTable.addTemp($2.data, $1.data, ParserConstants.arrayDecl)
        }
    ;
    
funBody
    : LCRLY_BRKT localDeclList statementList RCRLY_BRKT
        {
            if ($2 == null)
                $2 = new TerminalNode(ParserConstants.localDeclList, ParserConstants.empty, @1);
            if ($3 == null)
                $3 = new TerminalNode(ParserConstants.statementList, ParserConstants.empty, @1);
            $$ = new NonterminalNode(ParserConstants.funBody, [$2, $3], @1);
        }
    ;
    
localDeclList
    :  
    | localDeclList varDecl 
        { 
            if ($1 == null)
                $$ = new NonterminalNode(ParserConstants.localDeclList, $2, @1);
            else
                $1.addChild($2);
        }
    ;

statementList
    :
    | statementList statement 
        { 
            if ($1 == null)
                $$ = new NonterminalNode(ParserConstants.statementList, $2, @1); 
            else 
                $1.addChild($2);
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
            if ($2 == null)
                $$ = new TerminalNode(ParserConstants.compoundStmt, ParserConstants.empty, @1);
            else
                $$ = new NonterminalNode(ParserConstants.compoundStmt, $2, @2);
        }
    ;
    
assignStmt
    : var OPER_ASGN expression SEMICLN { $$ = new NonterminalNode(ParserConstants.assignStmt, [$1, $3], @1); }
    | expression SEMICLN { $$ = new NonterminalNode(ParserConstants.assignStmt, $1, @1); }
    ;
    
condStmt
    : KWD_IF LPAREN expression RPAREN statement %prec IF_WITHOUT_ELSE
        {
            $1 = new NonterminalNode(ParserConstants.kwdIf, [$3, $5]);
            $$ = new NonterminalNode(ParserConstants.condStmt, $1, @1);
        }
    | KWD_IF LPAREN expression RPAREN statement KWD_ELSE statement
        {
            $1 = new NonterminalNode(ParserConstants.kwdIf, [$3, $5], @1);
            $6 = new NonterminalNode(ParserConstants.kwdElse, $7, @6)
            $$ = new NonterminalNode(ParserConstants.condStmt, [$1, $6], @1);
        }
    ;
    
loopStmt
    : KWD_WHILE LPAREN expression RPAREN statement
        {
            $1 = new NonterminalNode(ParserConstants.kwdWhile, [$3, $5]);
            $$ = new NonterminalNode(ParserConstants.loopStmt, $1, @1);
        }
    ;
    
returnStmt
    : KWD_RETURN SEMICLN { $$ = new TerminalNode(ParserConstants.kwdReturn, $2, @1); }
    | KWD_RETURN expression SEMICLN { $$ = new NonterminalNode(ParserConstants.kwdReturn, $2); }
    ;

var
    : ID { $$ = new TerminalNode(ParserConstants.ID, $1, @1); }
    | ID LSQ_BRKT addExpr RSQ_BRKT
        {
            $1 = new TerminalNode(ParserConstants.ID, $1, @1);
            $$ = new NonterminalNode(ParserConstants.arrayDecl, [$1, $3], @1);
        }
    ;
    
expression
    : addExpr
    | expression relop addExpr
        {
            $2.addChild($1);
            $2.addChild($3);
            $$ = $2;
        }
    ;

relop
    : OPER_LTE  { $$ = new NonterminalNode(ParserConstants.lteOp, [], @1); }
    | OPER_LT  { $$ = new NonterminalNode(ParserConstants.ltOp, [], @1); }
    | OPER_GT  { $$ = new NonterminalNode(ParserConstants.gtOp, [], @1); }
    | OPER_GTE { $$ = new NonterminalNode(ParserConstants.gteOp, [], @1); }
    | OPER_EQ  { $$ = new NonterminalNode(ParserConstants.eqOp, [], @1); }
    | OPER_NEQ  { $$ = new NonterminalNode(ParserConstants.neqOp, [], @1); }
    ;

addExpr
    : term
    | addExpr addop term
        {
            $2.addChild($1);
            $2.addChild($3);
            $$ = $2;
        }
    ;

addop
    : OPER_ADD { $$ = new NonterminalNode(ParserConstants.addOp, [], @1); }
    | OPER_SUB { $$ = new NonterminalNode(ParserConstants.subOp, [], @1); }
    ;

term
    : factor
    | term mulop factor
        {
            $2.addChild($1);
            $2.addChild($3);
            $$ = $2;
        }
    ;

mulop
    : OPER_MUL { $$ = new NonterminalNode(ParserConstants.mulOp, [], @1); }
    | OPER_DIV{ $$ = new NonterminalNode(ParserConstants.divOp, [], @1); }
    ;

factor
    : LPAREN expression RPAREN { $$ = $2; }
    | var
    | funcCallExpr
    | INTCONST { $$ = new TerminalNode(ParserConstants.intConst, $1, @1); }
    | CHARCONST { $$ = new TerminalNode(ParserConstants.charConst, $1, @1); }
    | STRCONST  { $$ = new TerminalNode(ParserConstants.strConst, $1, @1); }
    ;

funcCallExpr
    : ID LPAREN argList RPAREN
        {
            $1 = new TerminalNode(ParserConstants.ID, $1, @1);
            $$ = new NonterminalNode(ParserConstants.funcCallExpr, [$1, $3], @1)
        }
    | ID LPAREN RPAREN
        {
            $1 = new TerminalNode(ParserConstants.ID, $1, @1);
            var argList = new TerminalNode(ParserConstants.argList, ParserConstants.empty, @1);
            $$ = new NonterminalNode(ParserConstants.funcCallExpr, [$1, argList], @1);
        }
    ;

argList
    : expression { $$ = new NonterminalNode(ParserConstants.argList, $1, @1); }
    | argList COMMA expression { $1.addChild($3); }
    ;

%%

var appRoot = require('app-root-path');
var ParserConstants = require(appRoot + '/minCParser/dist/ParserConstants.js');
var Tree = require(appRoot + '/minCParser/dist/tree.js');
var SymbolTable = require(appRoot + '/minCParser/dist/symbol-table.js');
var log = require(appRoot + '/minCParser/dist/util.js').log;

var TerminalNode = Tree.TerminalNode;
var NonterminalNode = Tree.NonterminalNode;
var print = Tree.print;

parser.symbolTable = new SymbolTable(ParserConstants.globalScope);
