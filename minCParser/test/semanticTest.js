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
    describe("Overloading functions", () => {
        it("checks formal decl list for functions", () => {
             // expect(() => Parser.semantic("void foo(int c) {} void foo(char d) {}")).to.not.throw();
             // expect(() => Parser.semantic("void foo(int c) {} void foo(int d) {}")).to.throw(/foo has already been declared/);
            /*
            // foo() int foo;  
            
             expect(() => Parser.semantic("void foo(int c) {} void foo(int d, int c) {}")).to.not.throw(/foo has been previously declared/);
             */
        })
    })
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
            expect(() => Parser.semantic("int fibo(int val) {} int main() { int x; x = 0; while (x != 0) {fibo(x); x = x + 1;} }")).to.not.throw(/foo does not match any function/);
        }),
        it("type mismatch with multiple args", () => {
            expect(() => Parser.semantic("void foo(char x, string y) {} int main() { foo(1, \"y\"); }")).to.throw(/foo does not match any function/);
            expect(() => Parser.semantic("void foo(string x, string y) {} int main() { foo(\"1\", \"y\"); }")).to.not.throw(/foo does not match any function/);
        })
    }),
    describe("Indexing an array variable with a non integer type", () => {
        it("index an array with char", () => {
            expect(() => Parser.semantic("int main() { int a[200]; a['2'] = 2; }")).to.throw('a type does not match')
            expect(() => Parser.semantic("int main() { int a[200]; a[2] = 2;}")).to.not.throw();
        }),
        it("index an array with string", () => {
            expect(() => Parser.semantic("int main() { int a[200]; a[\"2\"] = 2; }")).to.throw('a type does not match')
        }),
        it("index an array with int", () => {
            expect(() => Parser.semantic("int main() { int a[200]; a[2] = 2; }")).to.not.throw();
            
        }),
        it("index an array with another array", () => {
            expect(() => Parser.semantic("int main() { int b[20]; int a[200]; a[b[20]] = 2; }")).to.not.throw();
            expect(() => Parser.semantic("int main() { char b[20]; int a[200]; a[b[20]] = 2; }")).to.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { char c[20]; int b[20]; int a[200]; a[b[c[20]]] = 2; }")).to.throw(/b type does not match/);
        })
    }),
    describe("Indexing an array with an out-of-bounds integer literal", () => {
        it("handles an int const within the bounds", () => {
            expect(() => Parser.semantic("int main() { int a[2]; a[0] = 1; a[1] = 2; a[2] = 3; }")).to.not.throw();
        }),
        it("throws an error for one off", () => {
            expect(() => Parser.semantic("int main() { int a[2]; a[0] = 1; a[1] = 2; a[2] = 3; a[3] = 4;}")).to.throw(/a out of bounds/);
        }),
        it("throws an error for more than one", () => {
            expect(() => Parser.semantic("int main() { char a[10]; char y; y = a[11]; }")).to.throw(/a out of bounds/);
            expect(() => Parser.semantic("int main() { int a[2]; a[100] = 1; }")).to.throw(/a out of bounds/);
            expect(() => Parser.semantic("int main() { int b[20]; int a[2]; a[0] = 2; b[100] = 1; }")).to.throw(/b out of bounds/);
        })
    }),
    describe("Type mismatch in assignments.", () => {
        it("should not throw an error for right types", () => {
            expect(() => Parser.semantic("int main() { int a; char b; string c; a = 1; b = '1'; c = \"123\"; }")).to.not.throw();
        }),
        it("throws an error for int type that is not int expr", () => {
            expect(() => Parser.semantic("int main() { int a; a = '1'; }")).to.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; a = \"1\"; }")).to.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; char b; a = b + 1; }")).to.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; int c[20]; a = 2 + c[0]; }")).to.not.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; a = 2 - 2; }")).to.not.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; a = 2 / 2; }")).to.not.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; a = 2 * 2; }")).to.not.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; int c[2]; a = 2 * c[0]; }")).to.not.throw(/a type does not match/);
        }),
        it("does not throw an error for int type that is int variable", () => {
            expect(() => Parser.semantic("int main() { int a; int b; a = b; }")).to.not.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; int b[20]; a = b[0]; }")).to.not.throw(/a type does not match/);
        }),
        it("throws an error for int type that is not int variable", () => {
            expect(() => Parser.semantic("int main() { char x[20]; char y; y = x[y]; }")).to.throw(/x type does not match/);
            expect(() => Parser.semantic("int main() { int a; char b; a = b;}")).to.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; char b[20]; a = b[0]; }")).to.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a[20]; char b; a = a[b]; }")).to.throw(/a type does not match/);
        }),
        it("tries for other types other than int", () => {
            expect(() => Parser.semantic("int main() { int a; string b; a = b;}")).to.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; void b; a = b;}")).to.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; string b[20]; a = b[0]; }")).to.throw(/a type does not match/);
            expect(() => Parser.semantic("int main() { int a; void b[20]; a = b[0]; }")).to.throw(/a type does not match/);
        })
    }),
    describe("Allow Constant Folding", () => {
        it("should add constant nodes", () => {
            let node;
            let ast;

            ast = Parser.semantic("int main() { int a; a = 1 + a; }", {folding: true}).ast;
            node = ast.children[0].children[0].children[2].children[1].children[0];
            expect(node.children[0].type).to.equal(ParserConstants.ID);
            expect(node.children[1].type).to.equal(ParserConstants.addOp);
            
            ast = Parser.semantic("int main() { int a; a = 1 + 1; }", {folding: true}).ast;
            node = ast.children[0].children[0].children[2].children[1].children[0];
            expect(node.children[1].data).to.equal(2);

            ast = Parser.semantic("int main() { int a; a = 2 - 2; }", {folding: true}).ast;
            node = ast.children[0].children[0].children[2].children[1].children[0];
            expect(node.children[1].data).to.equal(0);
            
            ast = Parser.semantic("int main() { int a; a = 3 / 3; }", {folding: true}).ast;
            node = ast.children[0].children[0].children[2].children[1].children[0];
            expect(node.children[1].data).to.equal(1);

            ast = Parser.semantic("int main() { int a; a = 3 / 0; }", {folding: true}).ast;
            node = ast.children[0].children[0].children[2].children[1].children[0];
            expect(node.children[1].data).to.equal(Infinity);

            ast = Parser.semantic("int main() { int a; a = 4 * 4; }", {folding: true}).ast;
            node = ast.children[0].children[0].children[2].children[1].children[0];
            expect(node.children[1].data).to.equal(16);

            ast = Parser.semantic("int main() { int a; a = (2 + 10 * 15); }", {folding: true}).ast;
            node = ast.children[0].children[0].children[2].children[1].children[0];
        })
    })
})
    
