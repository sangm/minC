import {expect} from 'chai'
import Parser from '../src/minCParser'
import ParserConstants from '../src/ParserConstants'
import {NonterminalNode, TerminalNode} from '../src/tree'
import ASM from '../src/asm.js'
import CodeGenerator from '../src/code-gen.js'
import {extractNode, print, printTable, log} from '../src/util'



describe("Code Generation", () => {
    let cgen;
    beforeEach(() => {
        cgen = new CodeGenerator();
    }), 
    it('should not allow null ast', () => {
        expect(cgen.generate(null)).to.be.undefined;
    }),
    it('recgonize global variables', () => {
        let {ast, table} = Parser.Parse("int x; int y;");
        let asm = cgen.generate(ast, table)
        let x = ASM.globalVariable('x', '.word', 0)
        let y = ASM.globalVariable('y', '.word', 0)
        expect(asm[0]).to.deep.equal(x);
        expect(asm[1]).to.deep.equal(y);
    }),
    describe("File I/O", () =>{
        it('should recognize output as a function without being defined', () => {
            let {ast, table} = Parser.semantic('int main() {output(1);}')
            let funcCall = ast.children[0].children[0].children[2].children[1].children[0].children[0]
            print(funcCall)
            let asm = cgen.generate(funcCall, table);
            console.log(ASM.generate(asm))
        })
    }),
    describe('Conditional', () => {
        it('generate labels with branch instruction', () => {
            let {ast, table} = Parser.Parse("int main() { if (1 == 1) { x = 1; } else { x = 2; }}")
        })
    }),
    describe('Storing Variables', () => {
        it('should store into register', () => {
            let {ast, table }  = Parser.Parse("int main() { int x; int y; x = 2; y = 4; }")
            // test for multiple functions scope
            let asm = cgen.generate(ast, table);
            let a = ASM.arithInstruction('li', '$t0', 2)
            let b = ASM.arithInstruction('li', '$t1', 4)
            
            expect(asm[0]).to.deep.equal(a);
            expect(asm[1]).to.deep.equal(b);
            expect(asm.length).to.equal(2);
        })
        
        
    }),
    describe('Simple Arithmetic Expressions', () => {
        it('add', () => {
            let x = new TerminalNode(ParserConstants.intConst, 2);
            let y = new TerminalNode(ParserConstants.intConst, 4);
            let expr = new NonterminalNode(ParserConstants.addOp, [x,y]);
            let asm = cgen.generate(expr)
            
            let a = ASM.store('$a1', '$sp', 0),
                b = ASM.arith('addiu', '$sp', '$sp', -4),
                c = ASM.arith('add', '$a1', "$0", 2),
                d = ASM.arith('add', '$a1', "$0", 4),
                e = ASM.load('$t0', '$sp', 4),
                f = ASM.arith('add', '$a1', '$t0', '$a1'),
                g = ASM.arith('addiu', '$sp', '$sp', 4);
            expect(asm.length).to.equal(11);

            expect(asm[0]).to.deep.equal(a);
            expect(asm[1]).to.deep.equal(b);

            expect(asm[2]).to.deep.equal(c);

            expect(asm[3]).to.deep.equal(a);
            expect(asm[4]).to.deep.equal(b);

            expect(asm[5]).to.deep.equal(d);

            expect(asm[6]).to.deep.equal(e);
            expect(asm[7]).to.deep.equal(g);

            expect(asm[8]).to.deep.equal(f);

            expect(asm[9]).to.deep.equal(e);
            expect(asm[10]).to.deep.equal(g);
        }),
        it('sub', () => {
            let x = new TerminalNode(ParserConstants.intConst, 10);
            let y = new TerminalNode(ParserConstants.intConst, 5);
            let expr = new NonterminalNode(ParserConstants.subOp, [x,y]);
            let asm = cgen.generate(expr)
            
            let a = ASM.store('$a1', '$sp', 0),
                b = ASM.arith('addiu', '$sp', '$sp', -4),
                c = ASM.arith('add', '$a1', "$0", 10),
                d = ASM.arith('add', '$a1', "$0", 5),
                e = ASM.load('$t0', '$sp', 4),
                f = ASM.arith('sub', '$a1', '$t0', '$a1'),
                g = ASM.arith('addiu', '$sp', '$sp', 4);
            expect(asm.length).to.equal(11);

            expect(asm[0]).to.deep.equal(a);
            expect(asm[1]).to.deep.equal(b);

            expect(asm[2]).to.deep.equal(c);

            expect(asm[3]).to.deep.equal(a);
            expect(asm[4]).to.deep.equal(b);

            expect(asm[5]).to.deep.equal(d);

            expect(asm[6]).to.deep.equal(e);
            expect(asm[7]).to.deep.equal(g);

            expect(asm[8]).to.deep.equal(f);

            expect(asm[9]).to.deep.equal(e);
            expect(asm[10]).to.deep.equal(g);

        }),
        it('mul', () => {
            let x = new TerminalNode(ParserConstants.intConst, 10);
            let y = new TerminalNode(ParserConstants.intConst, 5);
            let expr = new NonterminalNode(ParserConstants.mulOp, [x,y]);
            let asm = cgen.generate(expr)
            let a = ASM.store('$a1', '$sp', 0),
                b = ASM.arith('addiu', '$sp', '$sp', -4),
                c = ASM.arith('add', '$a1', "$0", 10),
                d = ASM.arith('add', '$a1', "$0", 5),
                e = ASM.load('$t0', '$sp', 4),
                f = ASM.arith('mul', '$a1', '$t0', '$a1'),
                g = ASM.arith('addiu', '$sp', '$sp', 4);
            expect(asm.length).to.equal(11);

            expect(asm[0]).to.deep.equal(a);
            expect(asm[1]).to.deep.equal(b);

            expect(asm[2]).to.deep.equal(c);

            expect(asm[3]).to.deep.equal(a);
            expect(asm[4]).to.deep.equal(b);

            expect(asm[5]).to.deep.equal(d);

            expect(asm[6]).to.deep.equal(e);
            expect(asm[7]).to.deep.equal(g);

            expect(asm[8]).to.deep.equal(f);

            expect(asm[9]).to.deep.equal(e);
            expect(asm[10]).to.deep.equal(g);
        }),
        it('div', () => {
            let x = new TerminalNode(ParserConstants.intConst, 10);
            let y = new TerminalNode(ParserConstants.intConst, 5);
            let expr = new NonterminalNode(ParserConstants.divOp, [x,y]);
            let asm = cgen.generate(expr)

            let a = ASM.store('$a1', '$sp', 0),
                b = ASM.arith('addiu', '$sp', '$sp', -4),
                c = ASM.arith('add', '$a1', "$0", 10),
                d = ASM.arith('add', '$a1', "$0", 5),
                e = ASM.load('$t0', '$sp', 4),
                f = ASM.arith('div', '$a1', '$t0', '$a1'),
                g = ASM.arith('addiu', '$sp', '$sp', 4);
            expect(asm.length).to.equal(11);

            expect(asm[0]).to.deep.equal(a);
            expect(asm[1]).to.deep.equal(b);

            expect(asm[2]).to.deep.equal(c);

            expect(asm[3]).to.deep.equal(a);
            expect(asm[4]).to.deep.equal(b);

            expect(asm[5]).to.deep.equal(d);

            expect(asm[6]).to.deep.equal(e);
            expect(asm[7]).to.deep.equal(g);

            expect(asm[8]).to.deep.equal(f);

            expect(asm[9]).to.deep.equal(e);
            expect(asm[10]).to.deep.equal(g);
        }),
        it('with variables', () => {
            let {ast, table} = Parser.Parse("int main() { int x; int y; y = 4; x = y + 2; }")
            let asm = cgen.generate(ast, table)

        })
    })
})
    
