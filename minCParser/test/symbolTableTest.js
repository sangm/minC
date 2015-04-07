import {expect} from 'chai'
import ParserConstants from '../src/ParserConstants'
import {NonterminalNode, TerminalNode} from '../src/tree'
import Parser from '../src/minCParser'
import {extractNode, print, printTable, log} from '../src/util'

let scopeTest = (symbol, type, ...rest) => {
    let compareObj = {};
    compareObj['type'] = type;
    rest.filter(arg => typeof arg === 'object')
        .map(arg => Object.assign(compareObj, arg));
    expect(symbol).to.deep.equal(compareObj);
}

describe("Symbol Table", function() {
    describe("keeps track of function calls", () => {
        describe("without args", () => {
            it("one function", () => {
                let {ast, table} = Parser.Parse("void foo() {} int main() { foo(); }");
                let foo = extractNode(ast, ParserConstants.funcDecl, 0);
                let main = extractNode(ast, ParserConstants.funcDecl, 1);
                let funcCall = main.children[2].children[1].children[0].children[0]
                expect(table.functionCalls).to.deep.equal([funcCall]);
            }),
            it("two functions defined, one function stored", () => {
                let {ast, table} = Parser.Parse("void foo() {} char bar() {} int main() { foo(); }");
                let foo = extractNode(ast, ParserConstants.funcDecl, 0);
                let main = extractNode(ast, ParserConstants.funcDecl, 2);
                let funcCall = main.children[2].children[1].children[0].children[0]
                expect(table.functionCalls).to.deep.equal([funcCall]);
            })
                it("two functions", () => {
                    let {ast, table} = Parser.Parse("void foo() {} char bar() {} int main() { foo(); bar(); }");
                    let foo = extractNode(ast, ParserConstants.funcDecl, 0);
                    let main = extractNode(ast, ParserConstants.funcDecl, 2);
                    let funcCallFoo = main.children[2].children[1].children[0].children[0]
                    let funcCallBar = main.children[2].children[1].children[1].children[0]
                    expect(table.functionCalls).to.deep.equal([funcCallFoo, funcCallBar]);
                })
        }),
        describe("with args", () => {
            it("one arg", () => {
                let {ast, table} = Parser.Parse("void foo(int x) {} int main() { foo(1); }");
                let foo = extractNode(ast, ParserConstants.funcDecl, 0);
                let main = extractNode(ast, ParserConstants.funcDecl, 1);
                let funcCall = main.children[2].children[1].children[0].children[0]
                expect(table.functionCalls).to.deep.equal([funcCall]);
            }),
            it("multiple args", () => {
                let {ast, table} = Parser.Parse("void foo(int x, char y, string z) {} int main() { foo(1, 'a', \"test\"); }");
                let foo = extractNode(ast, ParserConstants.funcDecl, 0);
                let main = extractNode(ast, ParserConstants.funcDecl, 1);
                let funcCall = main.children[2].children[1].children[0].children[0]
                expect(table.functionCalls).to.deep.equal([funcCall]);
            })
        })
    }),
    it("maintains global scope of just one global variable", () => {
        let tableA = Parser.Parse('int a;').table;
        let tableB = Parser.Parse('void foo[10];');
    }),
    it("maintains global scope of global variables", () => {
        let {ast, table} = Parser.Parse('int a; string b; char c; void foo[5];');
        let global = table.getScope('global');
        let a = extractNode(ast, ParserConstants.varDecl, 0);
        let b = extractNode(ast, ParserConstants.varDecl, 1);
        let c = extractNode(ast, ParserConstants.varDecl, 2);
        let node = extractNode(ast, ParserConstants.arrayDecl, 0);
        expect(global.a).to.deep.equal({type: a});
        expect(global.b).to.deep.equal({type: b});
        expect(global.c).to.deep.equal({type: c});
        expect(global.foo).to.deep.equal({type: 'void foo[5]', nodeType: ParserConstants.arrayDecl, node: node});
    }),
    it("puts functions as global variables", () => {
        let table = Parser.Parse("int main() {} void foo() {}").table;
        let global = table.getScope('global');
        expect(global.foo.nodeType).to.equal(ParserConstants.funcDecl)
    }),
    it("keeps track of parameters of a function", () => {
        let {ast, table} = Parser.Parse("int main(int argc, char argv[]) {}");
        let global = table.getScope(ParserConstants.globalScope);
        let main = table.getScope('main');
        let argv = ast.children[0].children[0].children[2].children[1].children[0];
        let argc = ast.children[0].children[0].children[2].children[0];
        expect(global.main.nodeType).to.equal(ParserConstants.funcDecl)
        expect(main.argc).to.deep.equal({type: argc});
        scopeTest(main.argv, "char argv[]", {nodeType: ParserConstants.arrayDecl}, {node: argv});
    }),
    it("keeps track of local variables within a function", () => {
        let {ast, table} = Parser.Parse("int main() { int a; char b; void foo[200];}");
        let main = table.getScope('main');
        let a = ast.children[0].children[0].children[2].children[0].children[0];
        let b = ast.children[0].children[0].children[2].children[0].children[1];
        let foo = ast.children[0].children[0].children[2].children[0].children[2];
        expect(main.a).to.deep.equal({type: a});
        expect(main.b).to.deep.equal({type: b});
        scopeTest(main.foo, "void foo[200]", {nodeType: ParserConstants.arrayDecl}, {node: foo});
    }),
    it("makes sure function, global, local, and parameters are kept", () => {
        let {ast, table} =  Parser.Parse("int main(int argc, char argv[]) {int a; void dup[200];}" + 
                                   "void foo() {string dup[100];}");
        let global = table.getScope('global');
        let main = table.getScope('main');
        let foo = table.getScope('foo');
        
        let mainAst = extractNode(ast, ParserConstants.funcDecl, 0);
        let fooAst = extractNode(ast, ParserConstants.funcDecl, 1);
        let argvNode = mainAst.children[2].children[1].children[0];
        let dupNode = mainAst.children[3].children[0].children[1];
        let fooDup = fooAst.children[2].children[0].children[0];
        let argc = ast.children[0].children[0].children[2].children[0];
        let a = ast.children[0].children[0].children[3].children[0].children[0];
           
        scopeTest(global.main, "int main(int argc, char argv[])", {nodeType: ParserConstants.funcDecl}, {node: mainAst});
        scopeTest(global.foo, "void foo", {nodeType: ParserConstants.funcDecl}, {node: fooAst});
        scopeTest(main.argc, argc);
        scopeTest(main.argv, "char argv[]", {nodeType: ParserConstants.arrayDecl}, {node: argvNode});
        scopeTest(main.a, a);
        scopeTest(main.dup, "void dup[200]", {nodeType: ParserConstants.arrayDecl}, {node: dupNode});
        scopeTest(foo.dup, "string dup[100]", {nodeType: ParserConstants.arrayDecl}, {node: fooDup})
    }),
    it("makes sure table gets cleared out after each parse", () => {
        let table = Parser.Parse("int main() {}").table;
        let clean_table = Parser.Parse("void foo() {}").table;
        let global = clean_table.getScope('global');
        console.log(global);
        expect(global.main).to.be.undefined;
        expect(global.foo.nodeType).to.equal(ParserConstants.funcDecl)
    }),
    describe("Extending the Symbol Table", () => {
        describe("identifers that refer to variables should contain name, type, scope", () => {
            it("global variable", () => {
                let {ast, table} = Parser.Parse("int a;");
                let a = extractNode(ast, ParserConstants.varDecl, 0);
                let global = table.getScope('global'); // makes sure a is in the global scope
                scopeTest(global.a, a);
            }),
            it("local variable", () => {
                let {ast, table} = Parser.Parse("int main() { string y; }");
                let main = table.getScope('main');
                let y = ast.children[0].children[0].children[2].children[0].children[0];
                scopeTest(main.y, y);
            })
        }),
        describe("Scoping Rules in mC", () => {
            it("multiple local variables with the same name in different functions", () => {
                let {ast, table} = Parser.Parse("int main() { int x; } void foo() { int x; }")
                let x = ast.children[0].children[0].children[2].children[0].children[0];
                let foox = ast.children[0].children[1].children[2].children[0].children[0];
                let main = table.getScope('main');
                let foo = table.getScope('foo');
                scopeTest(main.x, x);
                scopeTest(foo.x, foox);
            })
        }),
        describe("function's type is represented as the function signature including the return type, number of params, and type of each parameter", () => {
            it("main function without params", () => {
                let {ast, table} = Parser.Parse("int main() {} char foo() {}");
                let global = table.getScope('global');
                let main = extractNode(ast, ParserConstants.funcDecl, 0);
                let foo = extractNode(ast, ParserConstants.funcDecl, 1);
                scopeTest(global.main, 'int main', {nodeType: ParserConstants.funcDecl}, {node: main});
                scopeTest(global.foo, 'char foo', {nodeType: ParserConstants.funcDecl}, {node: foo});
            }),
            it("functions with one param", () => {
                let {ast, table} = Parser.Parse("int main(int argc) {}");
                let global = table.getScope('global');
                let node = extractNode(ast, ParserConstants.funcDecl, 0);
                scopeTest(global.main, 'int main(int argc)', {nodeType: ParserConstants.funcDecl}, {node: node});
            }),
            it("functions with more than one params", () => {
                let {ast, table} = Parser.Parse("int main(int argc, char argv[], string foo) {}");
                let global = table.getScope('global');
                let node = extractNode(ast, ParserConstants.funcDecl, 0);
                scopeTest(global.main, 'int main(int argc, char argv[], string foo)', {nodeType: ParserConstants.funcDecl}, {node: node});
            }),
            it("checking all types", () => {
                let {ast, table} = Parser.Parse("int x; char y; void z; int ax[100]; char ay[0]; void az[20];");
                let global = table.getScope('global');
                let x = extractNode(ast, ParserConstants.varDecl, 0);
                let y = extractNode(ast, ParserConstants.varDecl, 1);
                let z = extractNode(ast, ParserConstants.varDecl, 2);
                let ax = extractNode(ast, ParserConstants.arrayDecl, 0);
                let ay = extractNode(ast, ParserConstants.arrayDecl, 1);
                let az = extractNode(ast, ParserConstants.arrayDecl, 2);
                scopeTest(global.x, x);
                scopeTest(global.y, y); 
                scopeTest(global.z, z);
                scopeTest(global.ax, 'int ax[100]', {nodeType: ParserConstants.arrayDecl}, {node: ax});
                scopeTest(global.ay, 'char ay[0]', {nodeType: ParserConstants.arrayDecl}, {node: ay});
                scopeTest(global.az, 'void az[20]', {nodeType: ParserConstants.arrayDecl}, {node: az});
            })
        })
    })
})
