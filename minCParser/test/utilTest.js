import {expect} from 'chai'
import Parser from '../src/minCParser'
import ParserConstants from '../src/ParserConstants'
import {extractNode, print, printTable, log} from '../src/util'

describe("extractNode", () => {
    it("gets nth code correctly", () => {
        let {ast, table} = Parser.Parse("int x; char y; void z; int ax[100]; char ay[0]; void az[20];");
        let node = extractNode(ast, ParserConstants.declList, 0);
        expect(node.type).to.equal(ParserConstants.declList); 

        node = extractNode(ast, ParserConstants.varDecl, 0);
        expect(node.type).to.equal(ParserConstants.varDecl); 
        expect(node.children[1].data).to.equal('x'); 

        node = extractNode(ast, ParserConstants.varDecl, 1);
        expect(node.type).to.equal(ParserConstants.varDecl); 
        expect(node.children[1].data).to.equal('y'); 
        
        node = extractNode(ast, ParserConstants.varDecl, 2);
        expect(node.type).to.equal(ParserConstants.varDecl); 
        expect(node.children[1].data).to.equal('z'); 

        node = extractNode(ast, ParserConstants.arrayDecl, 0);
        expect(node.type).to.equal(ParserConstants.arrayDecl); 
        expect(node.children[1].data).to.equal('ax'); 
        expect(node.children[2].data).to.equal(100); 

        node = extractNode(ast, ParserConstants.arrayDecl, 1);
        expect(node.type).to.equal(ParserConstants.arrayDecl); 
        expect(node.children[1].data).to.equal('ay'); 
        expect(node.children[2].data).to.equal(0); 

        node = extractNode(ast, ParserConstants.arrayDecl, 2);
        expect(node.type).to.equal(ParserConstants.arrayDecl); 
        expect(node.children[1].data).to.equal('az'); 
        expect(node.children[2].data).to.equal(20); 
        
    }),
    it("function decl", () => {
        /*
        let {ast, table} =  Parser.parse("int main(int argc, char argv[]) {int a; void dup[200];}" + 
                                   "void foo() {string dup[100];}");
        let node;
        node = extractNode(ast, ParserConstants.funcDecl, 0);
        expect(node.type).to.equal(ParserConstants.funcDecl); 
        expect(node.children[0].data).to.equal('int'); 
        expect(node.children[1].data).to.equal('main'); 

        node = extractNode(ast, ParserConstants.formalDecl, 0);
        */
    })

})
    
