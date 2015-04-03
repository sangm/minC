import {expect} from 'chai'
import ParserConstants from '../src/ParserConstants'
import {NonterminalNode, TerminalNode, print} from '../src/tree'
import Parser from '../src/minCParser'
import {printTable, log} from '../src/util'

let scopeTest = (symbol, type, nodeType = null) => {
    let compareObj = {};
    compareObj['type'] = type;
    if (nodeType)
        compareObj['nodeType'] = nodeType;
    expect(symbol).to.deep.equal(compareObj);
}
let funcNodeTest = (node, type, nodeType) => {
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
        expect(global.foo).to.deep.equal({type: 'void foo[5]', nodeType: ParserConstants.arrayDecl});
    }),
    it("puts functions as global variables", () => {
        let table = Parser.parse("int main() {} void foo() {}").table;
        let global = table.getScope('global');
        expect(global.foo.nodeType).to.equal(ParserConstants.funcDecl)
    }),
    it("keeps track of parameters of a function", () => {
        let table = Parser.parse("int main(int argc, char argv[]) {}").table;
        let global = table.getScope(ParserConstants.globalScope);
        let main = table.getScope('main');
        expect(global.main.nodeType).to.equal(ParserConstants.funcDecl)
        expect(main.argc).to.deep.equal({type: 'int'});
        expect(main.argv).to.deep.equal({type: 'char argv[]', nodeType: ParserConstants.arrayDecl});
        
    }),
    it("keeps track of local variables within a function", () => {
        let table = Parser.parse("int main() { int a; char b; void foo[200];}").table;
        let main = table.getScope('main');
        expect(main.a).to.deep.equal({type: 'int'});
        expect(main.b).to.deep.equal({type: 'char'});
        expect(main.foo).to.deep.equal({type: 'void foo[200]', nodeType: ParserConstants.arrayDecl});
    }),
    it("makes sure function, global, local, and parameters are kept", () => {
        let table =  Parser.parse("int main(int argc, char argv[]) {int a; void dup[200];}" + 
                                   "void foo() {string dup[100];}").table;
        let global = table.getScope('global');
        let main = table.getScope('main');
        let foo = table.getScope('foo');
        expect(global.main.type).to.equal('int main(int argc, char argv[])');
        expect(global.main.nodeType).to.equal(ParserConstants.funcDecl)
        expect(global.foo.nodeType).to.equal(ParserConstants.funcDecl)
        expect(main.argc).to.deep.equal({type: 'int'});
        expect(main.argv).to.deep.equal({type: 'char argv[]', nodeType: ParserConstants.arrayDecl});
        expect(main.a).to.deep.equal({type: 'int'});
        expect(main.dup).to.deep.equal({type: 'void dup[200]', nodeType: ParserConstants.arrayDecl});
        expect(foo.dup).to.deep.equal({type: 'string dup[100]', nodeType: ParserConstants.arrayDecl});
    }),
    it("makes sure table gets cleared out after each parse", () => {
        let table = Parser.parse("int main() {}").table;
        let clean_table = Parser.parse("void foo() {}").table;
        let global = clean_table.getScope('global');
        expect(global.main).to.be.undefined;
        expect(global.foo.nodeType).to.equal(ParserConstants.funcDecl)
    })
    describe("Extending the Symbol Table", () => {
        describe("identifers that refer to variables should contain name, type, scope", () => {
            it("global variable", () => {
                let table = Parser.parse("int a;").table;
                let global = table.getScope('global'); // makes sure a is in the global scope
                expect(global.a).to.deep.equal({type: 'int'});
            }),
            it("local variable", () => {
                let table = Parser.parse("int main() { string y; }").table;
                let main = table.getScope('main');
                expect(main.y).to.deep.equal({type: 'string'});
            })
        }),
        describe("Scoping Rules in mC", () => {
            it("multiple local variables with the same name in different functions", () => {
                let table = Parser.parse("int main() { int x; } void foo() { int x; }").table
                let main = table.getScope('main');
                let foo = table.getScope('foo');
                scopeTest(main.x, 'int');
                scopeTest(foo.x, 'int');
            })
        }),
        describe("function's type is represented as the function signature including the return type, number of params, and type of each parameter", () => {
            it("main function without params", () => {
                let table = Parser.parse("int main() {} char foo() {}").table;
                let global = table.getScope('global');
                expect(global.main).to.deep.equal({type: 'int main', nodeType: ParserConstants.funcDecl});
                expect(global.foo).to.deep.equal({type: 'char foo', nodeType: ParserConstants.funcDecl});
            }),
            it("functions with one param", () => {
                let table = Parser.parse("int main(int argc) {}").table;
                let global = table.getScope('global');
                expect(global.main).to.deep.equal({type: 'int main(int argc)', nodeType: ParserConstants.funcDecl});
            }),
            it("functions with more than one params", () => {
                let table = Parser.parse("int main(int argc, char argv[], string foo) {}").table;
                let global = table.getScope('global');
                expect(global.main).to.deep.equal({type: 'int main(int argc, char argv[], string foo)', nodeType: ParserConstants.funcDecl});
            }),
            it("checking all types", () => {
                let table = Parser.parse("int x; char y; void z; int ax[100]; char ay[0]; void az[20];").table;
                let global = table.getScope('global');
                scopeTest(global.x, 'int');
                scopeTest(global.y, 'char');
                scopeTest(global.z, 'void');
                scopeTest(global.ax, 'int ax[100]', ParserConstants.arrayDecl);
                scopeTest(global.ay, 'char ay[0]', ParserConstants.arrayDecl);
                scopeTest(global.az, 'void az[20]', ParserConstants.arrayDecl);
            })
        })
    })
})
