import {expect} from 'chai'
import ParserConstants from '../src/ParserConstants'
import {NonterminalNode, TerminalNode, print} from '../src/tree'
import Parser from '../src/minCParser'

let tableTest = (symbol, type) => {
}

let log = (obj) => {
    console.log(JSON.stringify(obj, null, 2));
}

describe("Symbol Table", function() {
    it("maintains global scope of just one global variable", () => {
        let tableA = Parser.parse('int a;').table;
        let tableB = Parser.parse('void foo[10];');
    }),

    it("maintains global scope of global variables", () => {
        let table = Parser.parse('int a; string b; char c; void foo[5];').table;
        let global = table.getScope('global');
        expect(global.a).to.deep.equal({type: 'int'});
        expect(global.b).to.deep.equal({type: 'string'});
        expect(global.c).to.deep.equal({type: 'char'});
        expect(global.foo).to.deep.equal({type: 'void', nodeType: ParserConstants.arrayDecl});
    }),
    it("puts functions as global variables", () => {
        let table = Parser.parse("int main() {} void foo() {}").table;
        let global = table.getScope('global');
        expect(global.main).to.deep.equal({type: 'int', nodeType: ParserConstants.funcDecl});
        expect(global.foo).to.deep.equal({type: 'void', nodeType: ParserConstants.funcDecl});
        
    }),
    it("keeps track of parameters of a function", () => {
        let table = Parser.parse("int main(int argc, char argv[]) {}").table;
        let global = table.getScope(ParserConstants.globalScope);
        expect(global.main).to.deep.equal({type: 'int', nodeType: ParserConstants.funcDecl});
        let main = table.getScope('main');
        expect(main.argc).to.deep.equal({type: 'int'});
        expect(main.argv).to.deep.equal({type: 'char', nodeType: ParserConstants.arrayDecl});
        
    }),
    it("keeps track of local variables within a function", () => {
        let table = Parser.parse("int main() { int a; char b; void foo[200];}").table;
        let main = table.getScope('main');
        expect(main.a).to.deep.equal({type: 'int'});
        expect(main.b).to.deep.equal({type: 'char'});
        expect(main.foo).to.deep.equal({type: 'void', nodeType: ParserConstants.arrayDecl});
    }),
    it("makes sure function, global, local, and parameters are kept", () => {
        let table =  Parser.parse("int main(int argc, char argv[]) {int a; void dup[200];}" + 
                                   "void foo() {string dup[100];}").table;
        let global = table.getScope('global');
        let main = table.getScope('main');
        let foo = table.getScope('foo');
        expect(global.main).to.deep.equal({type: 'int', nodeType: ParserConstants.funcDecl});
        expect(global.foo).to.deep.equal({type: 'void', nodeType: ParserConstants.funcDecl});
        expect(main.argc).to.deep.equal({type: 'int'});
        expect(main.argv).to.deep.equal({type: 'char', nodeType: ParserConstants.arrayDecl});
        expect(main.a).to.deep.equal({type: 'int'});
        expect(main.dup).to.deep.equal({type: 'void', nodeType: ParserConstants.arrayDecl});
        expect(foo.dup).to.deep.equal({type: 'string', nodeType: ParserConstants.arrayDecl});
    })
})
