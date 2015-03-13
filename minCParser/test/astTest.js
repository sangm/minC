import {expect} from 'chai'
import ParserConstants from '../ParserConstants'
import {NonterminalNode, TerminalNode, Node} from '../src/tree'
import Parser from '../src/minCParser'

let log = (obj) => {
    console.log(JSON.stringify(obj, null, 2));
}


let terminalNodeTest = (node, expectedType, expectedData) => {
    expect(node.terminal.type).to.equal(expectedType);
    expect(node.terminal.data).to.equal(expectedData);
};
let getSubChildren = (node, index, type) => {
    expect(node.children[index].type).to.equal(type);
    return node.children[index];
}

describe('Abstrct Syntax Tree from minCParser', () => {
    it('ProgramNode should be at the top of an empty program with 0 children', () => {
        let ast = Parser.parse(''); // empty program should generate a program node
        expect(ast.type).to.equal(ParserConstants.Program);
        expect(ast.children.length).to.equal(0);
    }),
    describe('program -> decl -> vardecl -> typeSpecifier ID SEMICLN', () => {
        it('int x;', () => {
            let ast = Parser.parse('int x;');
            let varDecl = getSubChildren(ast, 0, ParserConstants.varDecl);
            terminalNodeTest(varDecl.children[0], ParserConstants.typeSpecifier, 'int');
            terminalNodeTest(varDecl.children[1], ParserConstants.ID, 'x');
        }),
        it('char y;', () => {
            let ast = Parser.parse('char y;');
            let varDecl = getSubChildren(ast, 0, ParserConstants.varDecl);
            terminalNodeTest(varDecl.children[0], ParserConstants.typeSpecifier, 'char');
            terminalNodeTest(varDecl.children[1], ParserConstants.ID, 'y');
        }),
        it('void foo;', () => {
            let ast = Parser.parse('void foo;');
            let varDecl = getSubChildren(ast, 0, ParserConstants.varDecl);
            terminalNodeTest(varDecl.children[0], ParserConstants.typeSpecifier, 'void');
            terminalNodeTest(varDecl.children[1], ParserConstants.ID, 'foo');
        }),
        it('string xxx;', () => {
            let ast = Parser.parse('string xxx;');
            let varDecl = getSubChildren(ast, 0, ParserConstants.varDecl);
            terminalNodeTest(varDecl.children[0], ParserConstants.typeSpecifier, 'string');
            terminalNodeTest(varDecl.children[1], ParserConstants.ID, 'xxx');
        })
    }),
    describe('program -> decl -> vardecl -> typeSpecifier ID LSQ_BRKT INTCONST RSQ_BRKT SEMICLN', () => {
        it('int x[5];', () => {
            let ast = Parser.parse('int x[5];');
            let arrayDecl = getSubChildren(ast, 0, ParserConstants.arrayDecl);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.typeSpecifier, 'int');
            terminalNodeTest(arrayDecl.children[1], ParserConstants.ID, 'x');
            terminalNodeTest(arrayDecl.children[2], ParserConstants.intConst, 5);
        }),
        it('char y[200];', () => {
            let ast = Parser.parse('char y[200];');
            let arrayDecl = getSubChildren(ast, 0, ParserConstants.arrayDecl);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.typeSpecifier, 'char');
            terminalNodeTest(arrayDecl.children[1], ParserConstants.ID, 'y');
            terminalNodeTest(arrayDecl.children[2], ParserConstants.intConst, 200);
        }),
        it('void foo[2];', () => {
            let ast = Parser.parse('void foo[2];');
            let arrayDecl = getSubChildren(ast, 0, ParserConstants.arrayDecl);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.typeSpecifier, 'void');
            terminalNodeTest(arrayDecl.children[1], ParserConstants.ID, 'foo');
            terminalNodeTest(arrayDecl.children[2], ParserConstants.intConst, 2);
        }),
        it('string bar[1];', () => {
            let ast = Parser.parse('string bar[1];');
            let arrayDecl = getSubChildren(ast, 0, ParserConstants.arrayDecl);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.typeSpecifier, 'string');
            terminalNodeTest(arrayDecl.children[1], ParserConstants.ID, 'bar');
            terminalNodeTest(arrayDecl.children[2], ParserConstants.intConst, 1);
        })
    }),
    describe('program -> funcDecl -> typeSpecifier ID LPAREN RPAREN funBody', () => {
        it('int foo() {}', () => {
            let ast = Parser.parse('int foo() {}');
            let funcDecl = getSubChildren(ast, 0, ParserConstants.funcDecl);
            let funBody = getSubChildren(funcDecl, 2, ParserConstants.funBody);
            
            terminalNodeTest(funcDecl.children[0], ParserConstants.typeSpecifier, 'int');
            terminalNodeTest(funcDecl.children[1], ParserConstants.ID, 'foo');
            expect(ast.children[0].children[2].children[0].children.length).to.equal(0);
            expect(ast.children[0].children[2].children[1].children.length).to.equal(0);
        }),
        it('char foo() {}', () => {
            let ast = Parser.parse('char foo() {}');
            expect(ast.children[0].children[0].terminal.data).to.equal('char');
        })
        it('void foo() {}', () => {
            let ast = Parser.parse('void foo() {}');
            expect(ast.children[0].children[0].terminal.data).to.equal('void');
        })
        it('string foo() {}', () => {
            let ast = Parser.parse('string foo() {}');
            expect(ast.children[0].children[0].terminal.data).to.equal('string');
        }),
        it("(localDeclList) int foo() { int x; int y;} ", () => {
            
            let ast = Parser.parse('int foo() { int x; char y;}');
            let funcDecl = getSubChildren(ast, 0, ParserConstants.funcDecl);
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
            let funcBody = ast.children[0].children[2];
            expect(funcBody.type).to.equal(ParserConstants.funBody);
            expect(funcBody.children[1].type).to.equal(ParserConstants.statementList);
            expect(funcBody.children[1].children[0].type).to.equal(ParserConstants.compoundStmt);
            expect(funcBody.children[1].children[0].children[0].type).to.equal(ParserConstants.statementList);
        }),
        it("(statementList assignStmt) void foo() { x = 2 + 4; y = '6'; }", () => {
            let ast = Parser.parse("void foo() { x = 2 + 4; y = '6'; z[2] = 10 - 5;} ");
            let statementList = ast.children[0].children[2].children[1];
            let assignStmtX = getSubChildren(statementList, 0, ParserConstants.assignStmt); // x = 2 + 4;
            let assignStmtY = getSubChildren(statementList, 1, ParserConstants.assignStmt); // x = 2 + 4;
            let assignStmtZ = getSubChildren(statementList, 2, ParserConstants.assignStmt); // x = 2 + 4;
            
            /* x = 2 + 4 */
            terminalNodeTest(assignStmtX.children[0], ParserConstants.ID, 'x');
            let addExprX = getSubChildren(assignStmtX, 1, ParserConstants.addExpr);
            terminalNodeTest(addExprX.children[0], ParserConstants.intConst, 2);
            terminalNodeTest(addExprX.children[1], ParserConstants.addOp, '+');
            terminalNodeTest(addExprX.children[2], ParserConstants.intConst, 4);
            
            /* y = '6' */
            terminalNodeTest(assignStmtY.children[0], ParserConstants.ID, 'y');
            terminalNodeTest(assignStmtY.children[1], ParserConstants.charConst, '6');
            
            /* z[2] = 10 - 5; */
            let arrayDecl = getSubChildren(assignStmtZ, 0, ParserConstants.arrayDecl);
            terminalNodeTest(arrayDecl.children[0], ParserConstants.ID, 'z');
            terminalNodeTest(arrayDecl.children[1], ParserConstants.intConst, 2);

            let addExprZ = getSubChildren(assignStmtZ, 1, ParserConstants.addExpr);
            terminalNodeTest(addExprZ.children[0], ParserConstants.intConst, 10);
            terminalNodeTest(addExprZ.children[1], ParserConstants.subOp, '-');
            terminalNodeTest(addExprZ.children[2], ParserConstants.intConst, 5);
        }),
        it("array declartion with addexpr within the brackets", () => {
        })

    }),
    describe("Node functions", () => {
        it("should return right nodes", () => {
            let ast = Parser.parse("void foo() { { } }");
            let node = Node.getChildren(ast, ParserConstants.Program, 0);

//            expect(Node.getChildren(ast, 0).type).to.equal(ParserConstants.Program);
//           expect(Node.getChildren(ast, 1).type).to.equal(ParserConstants.funcDecl);

        })
    })
});
