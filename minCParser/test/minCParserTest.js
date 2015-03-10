import fs from 'fs'
import path from 'path'
import {expect} from 'chai'
import minCParser from '../dist/minCParser'

let inputPath = path.join(__dirname, 'input_files');

let readFile = (file, callback) => {
    fs.readFile(path.join(inputPath, file), (err, data) => {
        if (err) 
            throw err;
        callback(data.toString());
    })
}
describe('minimal C parser', () => {
    describe('literal string input', () => {
        it('should recognize variables as described by declList -> decl-> typeSpecificer ID', () => {
            expect(minCParser.parse('int x;')).to.be.true;
            expect(minCParser.parse('char x;')).to.be.true;
            expect(minCParser.parse('void x;')).to.be.true;
            expect(minCParser.parse('string x;')).to.be.true;
        }),
        it('should recognize initializing arrays as described by declList -> decl -> typeSpecifier [INTCONST]', () => {
            expect(minCParser.parse("int x [5];")).to.be.true;
            expect(minCParser.parse("char x [5];")).to.be.true;
            expect(minCParser.parse("void x[5];")).to.be.true;
        }),
        describe('functions as described by declList -> funcDecl -> typeSpecifier () funBody', () => {
            it('should recognize function without localDeclList or statementList', () => {
                expect(minCParser.parse("void f () {}")).to.be.true;
            }),
            it('function with localDeclist and without statementList', () => {
                expect(minCParser.parse("void f () { int x; }")).to.be.true;
            }),
            it('function without localDeclList and with statementList (compoundStmt)', () => {
                expect(minCParser.parse("void foo () { {} }")).to.be.true;
            })
        })
    }),
    describe('file input', () => {
        it('should recognize variables in a file', (done) => {
            readFile('pass/variables.mC', contents => {
                expect(minCParser.parse(contents)).to.be.true;
                done();
            })
        }),
        it('should recognize function body', (done) => {
            readFile('pass/function.mC', contents => {
                expect(minCParser.parse(contents)).to.be.true;
                done();
            })
        })
    })
});

