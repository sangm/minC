import {expect} from 'chai'
import ParserConstants from '../src/ParserConstants'
import {NonterminalNode, TerminalNode} from '../src/tree'
import Parser from '../src/minCParser'
import {extractNode, print, printTable, log} from '../src/util'
import Exception from '../src/exceptions'

describe("Semantic Analysis", () => {
    describe("Undeclared variables and undefined functions", () => {
        it("variable is considered undeclared if it does not have a declaration in the current scope", () => {
            // should throw a SemanticError 
            expect(() => Parser.semantic("int main() { x = 5;}")).to.throw(/x is not declared/);
            // should not throw a SemanticError local scope
            expect(() => Parser.semantic("int main() { int x; x = 5;}")).to.not.throw(/x is not declared/);
            // should not throw a SemanticError global
            expect(() => Parser.semantic("int x; int y; int main() { x = 5;}")).to.not.throw();
        }),
        it("function is considered undeclared if it does not have a declaration in the current scope", () => {
            describe("functions without args", () => {
                expect(() => Parser.semantic("void main() { foo();}")).to.throw(/foo is not declared/);
                expect(() => Parser.semantic("void foo() { } int main() { foo(); }")).to.not.throw();
            }),
            describe("functions with args", () => {
               expect(() => Parser.semantic("void main() { foo(1, 2, 3); }")).to.throw(/foo is not declared/);
               expect(() => Parser.semantic("void foo() { } void main() { foo(); }")).to.not.throw(/foo is not declared/);
            })
        })
    }),
    describe("Multiply declared variables and multiply defined functions", () => {
        describe("variable that has been declared more than once", () => {
            it("two global variables", () => {
                expect(() => Parser.semantic("int x; int x;")).to.throw(/x has already been declared/);
            }),
            it("two local variables", () => {
                expect(() => Parser.semantic("int main() { int x; int x; }")).to.throw(/x has already been declared/);
                expect(() => Parser.semantic("int main(int x, int x) { }")).to.throw(/x has already been declared/);
                expect(() => Parser.semantic("int main(int x, char x) { }")).to.throw(/x has already been declared/);
                expect(() => Parser.semantic("int main(int x, char x, string x) { }")).to.throw(/x has already been declared/);
            }),
            it("one global, one local", () => {
                expect(() => Parser.semantic("int x; int main() { int x; }")).to.not.throw(/x has already been declared/);
            }),
            it("one global, one formalDecl", () => {
                expect(() => Parser.semantic("int y; int main(int y) { }")).to.not.throw();
            }),
            it("one formalDecl, one local", () => {
                expect(() => Parser.semantic("int main(int z) { int z; }")).to.throw(/z has already been declared/);
            })
        })
    }),
    describe("Function declaration/call mismatch", () => {
        it("mismatch argument one arg", () => {
            expect(() => Parser.semantic("void foo(int x) {} int main() { foo(); }")).to.throw(/foo does not match any function/);
            expect(() => Parser.semantic("void foo() {} int main() { foo(1); }")).to.throw(/foo does not match any function/);
            expect(() => Parser.semantic("void foo(int x) { } int main() { foo(1); }")).to.not.throw(/foo does not match any function/);
        }),
        it("mismatch argument multiple args", () => {
            expect(() => Parser.semantic("void foo(int x, char y, void z) {} int main() { foo(1); }")).to.throw(/foo does not match any function/);
            expect(() => Parser.semantic("void foo(int x, char y, int z) {} int main() { foo(1, 'y', 1); }")).to.not.throw(/foo does not match any function/);
        }),
        it("type mismatch with one arg", () => {
            expect(() => Parser.semantic("void foo(int x) {} int main() { foo('1'); }")).to.throw(/foo does not match any function/);
            expect(() => Parser.semantic("void foo(char x) {} int main() { foo(1); }")).to.throw(/foo does not match any function/);
            expect(() => Parser.semantic("void foo(string x) {} int main() { foo(1); }")).to.throw(/foo does not match any function/);

            expect(() => Parser.semantic("void foo(int x) {} int main() { foo(1); }")).to.not.throw(/foo does not match any function/);
            expect(() => Parser.semantic("void foo(char x) {} int main() { foo('1'); }")).to.not.throw(/foo does not match any function/);
            expect(() => Parser.semantic("void foo(string x) {} int main() { foo(\"1\"); }")).to.not.throw(/foo does not match any function/);
        }),
        it("type mismatch with multiple args", () => {
            expect(() => Parser.semantic("void foo(char x, string y) {} int main() { foo(1, \"y\"); }")).to.throw(/foo does not match any function/);
            expect(() => Parser.semantic("void foo(string x, string y) {} int main() { foo(\"1\", \"y\"); }")).to.not.throw(/foo does not match any function/);
        })
    }),
    describe("Indexing an array variable with a non integer type", () => {
        it("index an array with char", () => {
            expect(() => Parser.semantic("int main() { int a[200]; a['2'] = 2; }")).to.throw('a type does not match')
            // expect(() => Parser.semantic("int main() { int a[200]; a[2] = 2;}")).to.not.throw();
        }),
         it('function with variable', function() {
            let {ast} = Parser.semantic("int main(int argc, char argv[], string foo) {}");
           // foo() int foo;  
            // void foo(int c)
            // void foo(char c)
            // void foo(int c) void foo(int m) should throw an error
          // formalDecl variable names do not matter
        });

   })
})
    
