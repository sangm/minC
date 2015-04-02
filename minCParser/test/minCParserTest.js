import fs from 'fs'
import path from 'path'
import {expect} from 'chai'
import minCParser from '../dist/minCParser'
import {treeToString} from '../src/util.js'

let inputPath = path.join(__dirname, 'input_files');

let getFiles = (folder) => {
    return fs.readdirSync(path.join(inputPath,folder));
}
let readFile = (file, callback) => {
    fs.readFile(path.join(inputPath, file), (err, data) => {
        if (err) 
            throw err;
        callback(data.toString());
    })
}
let readFiles = (folder, callback) => {
    let files = getFiles(folder);
    return files.map(file => {
        return fs.readFileSync(path.join(inputPath, folder, file)).toString();
    });
}

describe('minimal C parser', () => {
    describe('literal string input', () => {
        it('should recognize variables as described by declList -> decl-> typeSpecificer ID', () => {
            expect(() => minCParser.parse('int x = 5')).to.throw('Parse error');
            expect(() => minCParser.parse('int x;')).to.not.throw('Parse error');
            expect(() => minCParser.parse('int x;')).to.not.throw('Parse error');
            expect(() => minCParser.parse('char x;')).to.not.throw('Parse error');
            expect(() => minCParser.parse('void x;')).to.not.throw('Parse error');
            expect(() => minCParser.parse('string x;')).to.not.throw('Parse error');
        }),
        it('should recognize initializing arrays as described by declList -> decl -> typeSpecifier [INTCONST]', () => {
            expect(() => minCParser.parse("int x [5];")).to.not.throw('Parse error');
            expect(() => minCParser.parse("char x [5];")).to.not.throw('Parse error');
            expect(() => minCParser.parse("void x[5];")).to.not.throw('Parse error');
        }),
        it('handles comments', () => {
            expect(() => minCParser.parse("/*123123*/")).to.not.throw('Parse error');
        }), 
        it("handles parentehsis", () => {
            expect(() => minCParser.parse("int main() { x = (2 + 2); }")).to.not.throw('Parse error');
        })

        describe('functions as described by declList -> funcDecl -> typeSpecifier () funBody', () => {
            it('should recognize function without localDeclList or statementList', () => {
                expect(() => minCParser.parse("void f () {}")).to.not.throw('Parse error');
            }),
            it('function with localDeclist and without statementList', () => {
                expect(() => minCParser.parse("void f () { int x; }")).to.not.throw('Parse error');
            }),
            it('function without localDeclList and with statementList (compoundStmt)', () => {
                expect(() => minCParser.parse("void foo () { {{ x = 2 + 2; }} {} }")).to.not.throw('Parse error');
            }),
            it('function without localDeclList and with statementList (assignStmt)', () => {
                expect(() => minCParser.parse("void foo () { x[2] = 5;}")).to.to.not.throw('Parse error');
            }),
            it('function without localDeclList and with statementList (condStmt)', () => {
                expect(() => minCParser.parse("void foo () { if(x == 2) x = 5; }")).to.not.throw('Parse error');
            }),
            it('function without localDeclList and with statementList (loopStmt)', () => {
                expect(() => minCParser.parse("void foo () { while(x == 2) x = 5; }")).to.not.throw('Parse error');
            }),
            it('function without localDeclList and with statementList (returnStmt)', () => {
                expect(() => minCParser.parse("void foo () { return; }")).to.not.throw('Parse error');
                expect(() => minCParser.parse("void foo () { return 2; }")).to.not.throw('Parse error');
            }),
            it('function with both localDeclList and statementList', () => {
                expect(() => minCParser.parse("void foo () { int x; x = 5; while(x == 2) x = 5; }")).to.not.throw('Parse error');
            }),
            it('function can take argList', () => {
                expect(() => minCPaser.parse("char foobarFoo(int x, int y, void y[]) {}")).to.not.throw('Parse error');
            })
        })
    }),
    describe('file input', () => {
        it('should recognize variables in a file', (done) => {
            readFile('pass/variables.mC', contents => {
                expect(() => minCParser.parse(contents)).to.not.throw('Parse error');
                done();
            })
        }),
        it('should recognize function body', (done) => {
            readFile('pass/function.mC', contents => {
                expect(() => minCParser.parse(contents)).to.not.throw('Parse error');
                done();
            })
        }),
        it('pass all the test files given in class', (done) => {
            done();
        }),
        it('fail all the test files given in class', () => {
        })
    })
});

