import {expect} from 'chai'
import ParserConstants from '../ParserConstants'
import {Node} from '../src/tree'
import Parser from '../src/minCParser'

let log = (obj) => {
    console.log(JSON.stringify(obj, null, 2));
}

describe('Abstrct Syntax Tree from minCParser', () => {
    it('ProgramNode should be at the top of an empty program with 0 children', () => {
        let ast = Parser.parse(''); // empty program should generate a program node
        expect(ast.type).to.equal(ParserConstants.PROGRAM);
        expect(ast.children.length).to.equal(0);
    }),
    describe('program -> decl -> vardecl -> typeSpecifier ID SEMICLN', () => {
        it('int x;', () => {
            let ast = Parser.parse('int x;');
            expect(ast.children[0].type).to.equal(ParserConstants.varDecl);
            expect(ast.children[0].children[0].terminal.type).to.equal(ParserConstants.typeSpecifier);
            expect(ast.children[0].children[0].terminal.data).to.equal('int');
            expect(ast.children[0].children[1].terminal.type).to.equal(ParserConstants.ID);
            expect(ast.children[0].children[1].terminal.data).to.equal('x');
        }),
        it('char y;', () => {
            let ast = Parser.parse('char y;');
            expect(ast.children[0].type).to.equal(ParserConstants.varDecl);
            expect(ast.children[0].children[0].terminal.type).to.equal(ParserConstants.typeSpecifier);
            expect(ast.children[0].children[0].terminal.data).to.equal('char');
            expect(ast.children[0].children[1].terminal.type).to.equal(ParserConstants.ID);
            expect(ast.children[0].children[1].terminal.data).to.equal('y');
        }),
        it('void foo;', () => {
            let ast = Parser.parse('void foo;');
            expect(ast.children[0].type).to.equal(ParserConstants.varDecl);
            expect(ast.children[0].children[0].terminal.type).to.equal(ParserConstants.typeSpecifier);
            expect(ast.children[0].children[0].terminal.data).to.equal('void');
            expect(ast.children[0].children[1].terminal.type).to.equal(ParserConstants.ID);
            expect(ast.children[0].children[1].terminal.data).to.equal('foo');
        }),
        it('string xxx;', () => {
            let ast = Parser.parse('string xxx;');
            expect(ast.children[0].type).to.equal(ParserConstants.varDecl);
            expect(ast.children[0].children[0].terminal.type).to.equal(ParserConstants.typeSpecifier);
            expect(ast.children[0].children[0].terminal.data).to.equal('string');
            expect(ast.children[0].children[1].terminal.type).to.equal(ParserConstants.ID);
            expect(ast.children[0].children[1].terminal.data).to.equal('xxx');
        })
    }),
    describe('program -> decl -> vardecl -> typeSpecifier ID LSQ_BRKT INTCONST RSQ_BRKT SEMICLN', () => {
        it('int x[5];', () => {
            let ast = Parser.parse('int x[5];');
            expect(ast.children[0].type).to.equal(ParserConstants.varDecl);
            expect(ast.children[0].children[0].terminal.type).to.equal(ParserConstants.typeSpecifier);
            expect(ast.children[0].children[0].terminal.data).to.equal('array int[5]');
            expect(ast.children[0].children[1].terminal.type).to.equal(ParserConstants.ID);
            expect(ast.children[0].children[1].terminal.data).to.equal('x');
        }),
        it('char y[200];', () => {
            let ast = Parser.parse('char y[200];');
            expect(ast.children[0].type).to.equal(ParserConstants.varDecl);
            expect(ast.children[0].children[0].terminal.type).to.equal(ParserConstants.typeSpecifier);
            expect(ast.children[0].children[0].terminal.data).to.equal('array char[200]');
            expect(ast.children[0].children[1].terminal.type).to.equal(ParserConstants.ID);
            expect(ast.children[0].children[1].terminal.data).to.equal('y');
        }),
        it('void foo[2];', () => {
            let ast = Parser.parse('void foo[2];');
            expect(ast.children[0].type).to.equal(ParserConstants.varDecl);
            expect(ast.children[0].children[0].terminal.type).to.equal(ParserConstants.typeSpecifier);
            expect(ast.children[0].children[0].terminal.data).to.equal('array void[2]');
            expect(ast.children[0].children[1].terminal.type).to.equal(ParserConstants.ID);
            expect(ast.children[0].children[1].terminal.data).to.equal('foo');
        }),
        it('string bar[1];', () => {
            let ast = Parser.parse('string bar[1];');
            expect(ast.children[0].type).to.equal(ParserConstants.varDecl);
            expect(ast.children[0].children[0].terminal.type).to.equal(ParserConstants.typeSpecifier);
            expect(ast.children[0].children[0].terminal.data).to.equal('array string[1]');
            expect(ast.children[0].children[1].terminal.type).to.equal(ParserConstants.ID);
            expect(ast.children[0].children[1].terminal.data).to.equal('bar');
        })
    }),
    describe('program -> funcDecl -> typeSpecifier ID LPAREN RPAREN funBody', () => {
        it('int foo() {}', () => {
            let ast = Parser.parse('int foo() {}');
            expect(ast.children[0].type).to.equal(ParserConstants.funcDecl);
            expect(ast.children[0].children[0].terminal.type).to.equal(ParserConstants.typeSpecifier);
            expect(ast.children[0].children[0].terminal.data).to.equal('function int()');
            expect(ast.children[0].children[1].type).to.equal(ParserConstants.funBody);
            expect(ast.children[0].children[1].children[0]).to.be.undefined;
            expect(ast.children[0].children[1].children[1]).to.be.undefined;
        }),
        it('char foo() {}', () => {
            let ast = Parser.parse('char foo() {}');
            expect(ast.children[0].children[0].terminal.data).to.equal('function char()');
        })
        it('void foo() {}', () => {
            let ast = Parser.parse('void foo() {}');
            expect(ast.children[0].children[0].terminal.data).to.equal('function void()');
        })
        it('string foo() {}', () => {
            let ast = Parser.parse('string foo() {}');
            expect(ast.children[0].children[0].terminal.data).to.equal('function string()');
        }),
        it('int foo() { int x; int y;} ', () => {
            let ast = Parser.parse('int foo() { int x; char y;}');
            let funcBody = ast.children[0].children[1];
            let localDeclList = funcBody.children[0];
            let varDeclX = localDeclList.children[0];
            let varDeclY = localDeclList.children[1];
            expect(localDeclList.type).to.equal(ParserConstants.localDeclList);
            expect(localDeclList.children[0].type).to.equal(ParserConstants.varDecl);
            expect(localDeclList.children[1].type).to.equal(ParserConstants.varDecl);
            expect(varDeclX.children[0].terminal.data).to.equal('int');
            expect(varDeclY.children[0].terminal.data).to.equal('char');
            expect(varDeclX.children[1].terminal.data).to.equal('x');
            expect(varDeclY.children[1].terminal.data).to.equal('y');
        })
    })
});
