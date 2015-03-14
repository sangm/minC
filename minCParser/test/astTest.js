import {expect} from 'chai'
import ParserConstants from '../src/ParserConstants'
import {NonterminalNode, TerminalNode, print} from '../src/tree'
import Parser from '../src/minCParser'

let log = (obj) => {
    console.log(JSON.stringify(obj, null, 2));
}


let terminalNodeTest = (node, expectedType, expectedData) => {
    if (expectedType == null || expectedData == null) {
        console.warn("One of the arguments is null");
    }
    expect(node.terminal.type).to.equal(expectedType);
    expect(node.terminal.data).to.equal(expectedData);
};
let getSubChildren = (node, index, type) => {
    expect(node.children[index].type).to.equal(type);
    return node.children[index];
}
let printNode = (node) => {
    
}

describe('Abstrct Syntax Tree from minCParser', () => {
    it('ProgramNode should be at the top of an empty program with 0 children', () => {
        let ast = Parser.parse(''); // empty program should generate a program node
        expect(ast.type).to.equal(ParserConstants.Program);
        expect(ast.children.length).to.equal(0);
    }),
    it("multiple variable declarations", () => {
        let ast = Parser.parse("int a; char b; string c;");
        let declList = getSubChildren(ast, 0, ParserConstants.declList);
        let varDeclA = getSubChildren(declList, 0, ParserConstants.varDecl);
        let varDeclB = getSubChildren(declList, 1, ParserConstants.varDecl);
        let varDeclC = getSubChildren(declList, 2, ParserConstants.varDecl);
        terminalNodeTest(varDeclA.children[0], ParserConstants.typeSpecifier, 'int');
        terminalNodeTest(varDeclA.children[1], ParserConstants.ID, 'a');
        terminalNodeTest(varDeclB.children[0], ParserConstants.typeSpecifier, 'char');
        terminalNodeTest(varDeclB.children[1], ParserConstants.ID, 'b');
        terminalNodeTest(varDeclC.children[0], ParserConstants.typeSpecifier, 'string');
        terminalNodeTest(varDeclC.children[1], ParserConstants.ID, 'c');
    }),
    it("multiple function declarations", () => {
        let ast = Parser.parse("int main() {} void foo() {}");
        let declList = getSubChildren(ast, 0, ParserConstants.declList);
        let funcDeclA = getSubChildren(declList, 0, ParserConstants.funcDecl);
        let funcDeclB = getSubChildren(declList, 1, ParserConstants.funcDecl);
        terminalNodeTest(funcDeclA.children[0], ParserConstants.typeSpecifier, 'int');
        terminalNodeTest(funcDeclA.children[1], ParserConstants.ID, 'main');
        terminalNodeTest(funcDeclB.children[0], ParserConstants.typeSpecifier, 'void');
        terminalNodeTest(funcDeclB.children[1], ParserConstants.ID, 'foo');
    }),
    describe('program -> decl -> vardecl -> typeSpecifier ID SEMICLN', () => {
        it('int x;', () => {
            let ast = Parser.parse('int x;');
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let varDecl = getSubChildren(declList, 0, ParserConstants.varDecl);
            terminalNodeTest(varDecl.children[0], ParserConstants.typeSpecifier, 'int');
            terminalNodeTest(varDecl.children[1], ParserConstants.ID, 'x');
        }),
        it('char y;', () => {
            let ast = Parser.parse('char y;');
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let varDecl = getSubChildren(declList, 0, ParserConstants.varDecl);
            terminalNodeTest(varDecl.children[0], ParserConstants.typeSpecifier, 'char');
            terminalNodeTest(varDecl.children[1], ParserConstants.ID, 'y');
        }),
        it('void foo;', () => {
            let ast = Parser.parse('void foo;');
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let varDecl = getSubChildren(declList, 0, ParserConstants.varDecl);
            terminalNodeTest(varDecl.children[0], ParserConstants.typeSpecifier, 'void');
            terminalNodeTest(varDecl.children[1], ParserConstants.ID, 'foo');
        }),
        it('string xxx;', () => {
            let ast = Parser.parse('string xxx;');
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let varDecl = getSubChildren(declList, 0, ParserConstants.varDecl);
            terminalNodeTest(varDecl.children[0], ParserConstants.typeSpecifier, 'string');
            terminalNodeTest(varDecl.children[1], ParserConstants.ID, 'xxx');
        })
    }),
    describe('program -> decl -> vardecl -> typeSpecifier ID LSQ_BRKT INTCONST RSQ_BRKT SEMICLN', () => {
        it('int x[5];', () => {
            let ast = Parser.parse('int x[5];');
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let arrayDecl = getSubChildren(declList, 0, ParserConstants.arrayDecl);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.typeSpecifier, 'int');
            terminalNodeTest(arrayDecl.children[1], ParserConstants.ID, 'x');
            terminalNodeTest(arrayDecl.children[2], ParserConstants.intConst, 5);
        }),
        it('char y[200];', () => {
            let ast = Parser.parse('char y[200];');
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let arrayDecl = getSubChildren(declList, 0, ParserConstants.arrayDecl);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.typeSpecifier, 'char');
            terminalNodeTest(arrayDecl.children[1], ParserConstants.ID, 'y');
            terminalNodeTest(arrayDecl.children[2], ParserConstants.intConst, 200);
        }),
        it('void foo[2];', () => {
            let ast = Parser.parse('void foo[2];');
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let arrayDecl = getSubChildren(declList, 0, ParserConstants.arrayDecl);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.typeSpecifier, 'void');
            terminalNodeTest(arrayDecl.children[1], ParserConstants.ID, 'foo');
            terminalNodeTest(arrayDecl.children[2], ParserConstants.intConst, 2);
        }),
        it('string bar[1];', () => {
            let ast = Parser.parse('string bar[1];');
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let arrayDecl = getSubChildren(declList, 0, ParserConstants.arrayDecl);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.typeSpecifier, 'string');
            terminalNodeTest(arrayDecl.children[1], ParserConstants.ID, 'bar');
            terminalNodeTest(arrayDecl.children[2], ParserConstants.intConst, 1);
        })
    }),
    describe('program -> funcDecl -> typeSpecifier ID LPAREN RPAREN funBody', () => {
        it('int foo() {}', () => {
            let ast = Parser.parse('int foo() {}');
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funcBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            terminalNodeTest(funcDecl.children[0], ParserConstants.typeSpecifier, 'int');
            terminalNodeTest(funcDecl.children[1], ParserConstants.ID, 'foo');
            terminalNodeTest(funcBody.children[0], ParserConstants.localDeclList, ParserConstants.empty);
            terminalNodeTest(funcBody.children[1], ParserConstants.statementList, ParserConstants.empty);
        }),
        it("(localDeclList) int foo() { int x; int y;} ", () => {
            let ast = Parser.parse('int foo() { int x; char y;}');
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funcBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let localDeclList = getSubChildren(funcBody, 0, ParserConstants.localDeclList);
            let varDeclX = getSubChildren(localDeclList, 0, ParserConstants.varDecl);
            let varDeclY = getSubChildren(localDeclList, 1, ParserConstants.varDecl);
            
            terminalNodeTest(funcDecl.children[0], ParserConstants.typeSpecifier, 'int');
            terminalNodeTest(funcDecl.children[1], ParserConstants.ID, 'foo');
            terminalNodeTest(varDeclX.children[0], ParserConstants.typeSpecifier, 'int');
            terminalNodeTest(varDeclX.children[1], ParserConstants.ID, 'x');
            terminalNodeTest(varDeclY.children[0], ParserConstants.typeSpecifier, 'char');
            terminalNodeTest(varDeclY.children[1], ParserConstants.ID, 'y');
        }),
        it("(statementList compoundStmt) void foo() { { } }", () => {
            let ast = Parser.parse("void foo() { { } }");
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funcBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let statementList = getSubChildren(funcBody, 1, ParserConstants.statementList);
            terminalNodeTest(funcBody.children[0], ParserConstants.localDeclList, ParserConstants.empty);
            terminalNodeTest(statementList.children[0], ParserConstants.compoundStmt, ParserConstants.empty);
        }),
        it("(statementList assignStmt) void foo() { x = 2 + 4; y = '6'; }", () => {
            let ast = Parser.parse("void foo() { x = 2 + 4; y = '6'; z[2] = 10 - 5; f = 20 * 1; k = foo / bar;} ");
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let statementList = getSubChildren(funBody, 1, ParserConstants.statementList);
            let assignStmtX = getSubChildren(statementList, 0, ParserConstants.assignStmt); // x = 2 + 4;
            let assignStmtY = getSubChildren(statementList, 1, ParserConstants.assignStmt); // y = '6';
            let assignStmtZ = getSubChildren(statementList, 2, ParserConstants.assignStmt); // z[2] = 10;
            let assignStmtF = getSubChildren(statementList, 3, ParserConstants.assignStmt); // f = 20 * 1;
            let assignStmtK = getSubChildren(statementList, 4, ParserConstants.assignStmt); // k = foo / bar;
            
            /* x = 2 + 4 */
            terminalNodeTest(assignStmtX.children[0], ParserConstants.ID, 'x');
            let addExprX = getSubChildren(assignStmtX, 1, ParserConstants.addOp);
            terminalNodeTest(addExprX.children[0], ParserConstants.intConst, 2);
            terminalNodeTest(addExprX.children[1], ParserConstants.intConst, 4);
            
            /* y = '6' */
            terminalNodeTest(assignStmtY.children[0], ParserConstants.ID, 'y');
            terminalNodeTest(assignStmtY.children[1], ParserConstants.charConst, '6');
            
            /* z[2] = 10 - 5; */
            let arrayDecl = getSubChildren(assignStmtZ, 0, ParserConstants.arrayDecl);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.ID, 'z');
            terminalNodeTest(arrayDecl.children[1], ParserConstants.intConst, 2);
            let addExprZ = getSubChildren(assignStmtZ, 1, ParserConstants.subOp);
            terminalNodeTest(addExprZ.children[0], ParserConstants.intConst, 10);
            terminalNodeTest(addExprZ.children[1], ParserConstants.intConst, 5);
            
            /* f = 20 * 1; */
            let multExpr = getSubChildren(assignStmtF, 1, ParserConstants.mulOp);
            terminalNodeTest(assignStmtF.children[0], ParserConstants.ID, 'f');
            terminalNodeTest(multExpr.children[0], ParserConstants.intConst, 20);
            terminalNodeTest(multExpr.children[1], ParserConstants.intConst, 1);

            /* k = foo / bar; */
            let divExpr = getSubChildren(assignStmtK, 1, ParserConstants.divOp);
            terminalNodeTest(assignStmtK.children[0], ParserConstants.ID, 'k');
            terminalNodeTest(divExpr.children[0], ParserConstants.ID, 'foo');
            terminalNodeTest(divExpr.children[1], ParserConstants.ID, 'bar');
        }),
        it("(condStmt without else) void foo() { if (x == 2) x = 5; } ", () => {
            let ast = Parser.parse("void foo() { if (x == 2) x = 5; }");
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let statementList = getSubChildren(funBody, 1, ParserConstants.statementList);
            let condStmt = getSubChildren(statementList, 0, ParserConstants.condStmt);
            let ifStmt = getSubChildren(condStmt, 0, ParserConstants.kwdIf);
            let equalStmt = getSubChildren(ifStmt, 0, ParserConstants.eqOp);
            let assignStmt = getSubChildren(ifStmt, 1, ParserConstants.assignStmt);
            terminalNodeTest(equalStmt.children[0], ParserConstants.ID, 'x');
            terminalNodeTest(equalStmt.children[1], ParserConstants.intConst, 2);
            terminalNodeTest(assignStmt.children[0], ParserConstants.ID, 'x')
            terminalNodeTest(assignStmt.children[1], ParserConstants.intConst, 5)
        }),
        it("(condStmt with else) void foo() { if (x == 2) y = 6; else y = 2; }", () => {
            let ast = Parser.parse("void foo() { if (x == 2) y = 6; else y = 2; }")
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let statementList = getSubChildren(funBody, 1, ParserConstants.statementList);
            let condStmt = getSubChildren(statementList, 0, ParserConstants.condStmt);
            let ifStmt = getSubChildren(condStmt, 0, ParserConstants.kwdIf);
            let elseStmt = getSubChildren(condStmt, 1, ParserConstants.kwdElse);
            let equalStmt = getSubChildren(ifStmt, 0, ParserConstants.eqOp);
            let assignStmt = getSubChildren(ifStmt, 1, ParserConstants.assignStmt);
            terminalNodeTest(equalStmt.children[0], ParserConstants.ID, 'x');
            terminalNodeTest(equalStmt.children[1], ParserConstants.intConst, 2);
            terminalNodeTest(assignStmt.children[0], ParserConstants.ID, 'y');
            terminalNodeTest(assignStmt.children[1], ParserConstants.intConst, 6);
            assignStmt = getSubChildren(elseStmt, 0, ParserConstants.assignStmt);
            terminalNodeTest(assignStmt.children[0], ParserConstants.ID, 'y');
            terminalNodeTest(assignStmt.children[1], ParserConstants.intConst, 2);
        }),
        it("(loopStmt) void foo() { while (x == 2) x = 1; }", () => {
            let ast = Parser.parse("void foo() { while (x == 2) x = 1; }");
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let statementList = getSubChildren(funBody, 1, ParserConstants.statementList);
            let loopStmt = getSubChildren(statementList, 0, ParserConstants.loopStmt);
            let whileLoop = getSubChildren(loopStmt, 0, ParserConstants.kwdWhile);
            let equalStmt = getSubChildren(whileLoop, 0, ParserConstants.eqOp);
            let assignStmt = getSubChildren(whileLoop, 1, ParserConstants.assignStmt);
        }),
        it("(return) void foo() { return; }", () => {
            let ast = Parser.parse("void foo() { return; }")        
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let statementList = getSubChildren(funBody, 1, ParserConstants.statementList);
            terminalNodeTest(statementList.children[0], ParserConstants.kwdReturn, ';');
        }),
        it("(return expr) void foo() {  return 2+2; }", () => {
            let ast = Parser.parse("void foo() { return 2+4; }")        
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let statementList = getSubChildren(funBody, 1, ParserConstants.statementList);
            let returnStmt = getSubChildren(statementList, 0, ParserConstants.kwdReturn);
            let addExpr = getSubChildren(returnStmt, 0, ParserConstants.addOp);
            terminalNodeTest(addExpr.children[0], ParserConstants.intConst, 2);
            terminalNodeTest(addExpr.children[1], ParserConstants.intConst, 4);
        }),
        it("void foo() { foo[2+2] = 2;}", () => {
            let ast = Parser.parse("void foo() { foo[2+4] = 8; }");
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let statementList = getSubChildren(funBody, 1, ParserConstants.statementList);
            let assignStmt = getSubChildren(statementList, 0, ParserConstants.assignStmt);
            let arrayDecl = getSubChildren(assignStmt, 0, ParserConstants.arrayDecl);
            let addExpr = getSubChildren(arrayDecl, 1, ParserConstants.addOp);
            terminalNodeTest(assignStmt.children[1], ParserConstants.intConst, 8);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.ID, 'foo');
            terminalNodeTest(addExpr.children[0], ParserConstants.intConst, 2);
            terminalNodeTest(addExpr.children[1], ParserConstants.intConst, 4);
        })
    }),
   describe("program -> funcDecl -> typeSpecifier ID LPAREN formalDeclList RPAREN -> funBody", () => {
       /* formalDeclList */
       it("int main(int argc, string argv) { }", () => {
           let ast = Parser.parse("int main(int argc, string argv) { }");
           let declList = getSubChildren(ast, 0, ParserConstants.declList);
           let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
           let formalDeclList = getSubChildren(funcDecl, 0, ParserConstants.formalDeclList);
           let formalDeclArgc = getSubChildren(formalDeclList, 0, ParserConstants.formalDecl);
           let formalDeclArgv = getSubChildren(formalDeclList, 1, ParserConstants.formalDecl);
           terminalNodeTest(formalDeclArgc.children[0], ParserConstants.typeSpecifier, 'int');
           terminalNodeTest(formalDeclArgc.children[1], ParserConstants.ID, 'argc');
           terminalNodeTest(formalDeclArgv.children[0], ParserConstants.typeSpecifier, 'string');
           terminalNodeTest(formalDeclArgv.children[1], ParserConstants.ID, 'argv');
       }),
       it("int main(int argc, char argv[]) { }", () => {
           let ast = Parser.parse("int main(int argc, char argv[] ) { }");
           let declList = getSubChildren(ast, 0, ParserConstants.declList);
           let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
           
           let formalDeclList = getSubChildren(funcDecl, 0, ParserConstants.formalDeclList);
           let formalDeclArgv = getSubChildren(formalDeclList, 1, ParserConstants.formalDecl);
           let arrayDecl = getSubChildren(formalDeclArgv, 0, ParserConstants.arrayDecl);
           terminalNodeTest(arrayDecl.children[0], ParserConstants.typeSpecifier, 'char');
           terminalNodeTest(arrayDecl.children[1], ParserConstants.ID, 'argv');
       })
           
    }),
       /* Functon Calls*/ 
    describe("program -> funcDecl -> funBody -> assignStmt -> funcExpr", () => {
        it("int main() { x = sum(); }", () => {
            let ast = Parser.parse("int main() { x = sum(); }");
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let statementList = getSubChildren(funBody, 1, ParserConstants.statementList);
            let assignStmt = getSubChildren(statementList, 0, ParserConstants.assignStmt);
            let funcExpr = getSubChildren(assignStmt, 1, ParserConstants.funcCallExpr);
            terminalNodeTest(funcExpr.children[0], ParserConstants.ID, 'sum');
            terminalNodeTest(funcExpr.children[1], ParserConstants.argList, ParserConstants.empty);
        }),
        it("int main() { x = sum(1, 2, 3); }", () => {
            let ast = Parser.parse("int main() { x = sum(1, 2, 3); }");
            let declList = getSubChildren(ast, 0, ParserConstants.declList);
            let funcDecl = getSubChildren(declList, 0, ParserConstants.funcDecl);
            let funBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            let statementList = getSubChildren(funBody, 1, ParserConstants.statementList);
            let assignStmt = getSubChildren(statementList, 0, ParserConstants.assignStmt);
            let funcExpr = getSubChildren(assignStmt, 1, ParserConstants.funcCallExpr);
            let argList = getSubChildren(funcExpr, 1, ParserConstants.argList);
            terminalNodeTest(funcExpr.children[0], ParserConstants.ID, 'sum');
            terminalNodeTest(argList.children[0], ParserConstants.intConst, 1);
            terminalNodeTest(argList.children[1], ParserConstants.intConst, 2);
            terminalNodeTest(argList.children[2], ParserConstants.intConst, 3);
        })
    })
});
