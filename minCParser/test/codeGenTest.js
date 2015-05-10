import {expect} from 'chai'
import Parser from '../src/minCParser'
import ParserConstants from '../src/ParserConstants'
import {NonterminalNode, TerminalNode} from '../src/tree'
import ASM from '../src/asm.js'
import CodeGenerator from '../src/code-gen.js'
import {extractNode, print, printTable, log} from '../src/util'

let trim = (string) => {
    return string.split('\n')
                 .map(s => s.trim())
                 .filter(s => s.length !== 0)
}

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
    it('should prepare for funcDecl', () => {
        let {ast, table} = Parser.semantic(`
            int main() { }    
        `);
        let asm = cgen.generate(ast, table);
        let result = ASM.generate(asm),
            expected = `
            .data
            .text
            .globl main
            jal main
            add $v0, $0, 10
            syscall
            main:
            add $fp, $0, $sp
            sw $ra, 0($sp)
            addiu $sp, $sp, -4
            lw $ra, 4($sp)
            addiu $sp, $sp, 4
            lw $fp, 0($sp)
            jr $ra
        `;
        expect(trim(result)).to.deep.equal(trim(expected))
    })
    describe("File I/O", () =>{
        it('should print values from variable', () => {
            let {ast, table} = Parser.semantic('void foo(int x, int y) {output(y);} int main() {foo(2, 4);}')
            let asm = cgen.generate(ast, table);
            let result = ASM.generate(asm);
            let expected = `
                .data
                .text
                .globl main
                jal main
                add $v0, $0, 10
                syscall
                foo:
                add $fp, $0, $sp
                sw $ra, 0($sp)
                addiu $sp, $sp, -4
                lw $a0, 8($fp)
                add $v0, $0, 1
                syscall
                lw $ra, 4($sp)
                addiu $sp, $sp, 16
                lw $fp, 0($sp)
                jr $ra
                main:
                add $fp, $0, $sp
                sw $ra, 0($sp)
                addiu $sp, $sp, -4
                sw $fp, 0($sp)
                addiu $sp, $sp, -4
                add $a1, $0, 4
                sw $a1, 0($sp)
                addiu $sp, $sp, -4
                add $a1, $0, 2
                sw $a1, 0($sp)
                addiu $sp, $sp, -4
                jal foo
                lw $ra, 4($sp)
                addiu $sp, $sp, 4
                lw $fp, 0($sp)
                jr $ra
            `
            expect(trim(result)).to.deep.equal(trim(expected))
        }),
        it('should recognize output as a function without being defined', () => {
            let {ast, table} = Parser.semantic('int main() {output(8);}')
            let asm = cgen.generate(ast, table);
            let result = ASM.generate(asm);
            let expected = `
            .data
            .text
            .globl main
            jal main
            add $v0, $0, 10
            syscall
            main:
            add $fp, $0, $sp
            sw $ra, 0($sp)
            addiu $sp, $sp, -4
            add $a0, $0, 8
            add $v0, $0, 1
            syscall
            lw $ra, 4($sp)
            addiu $sp, $sp, 4
            lw $fp, 0($sp)
            jr $ra
            `
            expect(trim(result)).to.deep.equal(trim(expected))
        })
    }),
    describe("Loops", () => {
        it('loop with variable', () => {
            let {ast, table} = Parser.semantic(`
                int main() {
                    int x;
                    x = 10;
                    while (x > 0) {
                        output(x);
                        x = x - 1;
                    }
                }                              
            `)
            let asm = cgen.generate(ast, table);
            let result = ASM.generate(asm);
            let expected = `
            .data
            .text
            .globl main
            jal main
            add $v0, $0, 10
            syscall
            main:
            add $fp, $0, $sp
            sw $ra, 0($sp)
            addiu $sp, $sp, -4
            add $a1, $0, 10
            sw $a1, 4($fp)
            ll0:
            lw $a1, 4($fp)
            sw $a1, 0($sp)
            addiu $sp, $sp, -4
            add $a1, $0, 0
            lw $t0, 4($sp)
            addiu $sp, $sp, 4
            bgt $t0, $a1, ll1
            j ll2
            ll1:
            lw $a0, 4($fp)
            add $v0, $0, 1
            syscall
            lw $a1, 4($fp)
            sw $a1, 0($sp)
            addiu $sp, $sp, -4
            add $a1, $0, 1
            lw $t0, 4($sp)
            addiu $sp, $sp, 4
            sub $a1, $t0, $a1
            sw $a1, 4($fp)
            j ll0
            ll2:
            lw $ra, 4($sp)
            addiu $sp, $sp, 4
            lw $fp, 0($sp)
            jr $ra
            `;
            expect(trim(result)).to.deep.equal(trim(expected))
        }),
        it('basic loop', () => {
            let {ast, table} = Parser.semantic("int main() { while (4 == 1) { output(3); }}")
            let asm = cgen.generate(ast, table);
            let result = ASM.generate(asm);
            let expected = `
            .data
            .text
            .globl main
            jal main
            add $v0, $0, 10
            syscall
            main:
            add $fp, $0, $sp
            sw $ra, 0($sp)
            addiu $sp, $sp, -4
            ll0:
            add $a1, $0, 4
            sw $a1, 0($sp)
            addiu $sp, $sp, -4
            add $a1, $0, 1
            lw $t0, 4($sp)
            addiu $sp, $sp, 4
            beq $t0, $a1, ll1
            j ll2
            ll1:
            add $a0, $0, 3
            add $v0, $0, 1
            syscall
            j ll0
            ll2:
            lw $ra, 4($sp)
            addiu $sp, $sp, 4
            lw $fp, 0($sp)
            jr $ra
            `
            expect(trim(result)).to.deep.equal(trim(expected))
        })
    })
    describe('Conditional', () => {
        it('if', () => {
            let {ast, table} = Parser.semantic("int main() { if (1 == 2) { output(10); } else { output(20); }}")
            let asm = cgen.generate(ast, table);
            let result = ASM.generate(asm);
            let expected = `
            .data
            .text
            .globl main
            jal main
            add $v0, $0, 10
            syscall
            main:
            add $fp, $0, $sp
            sw $ra, 0($sp)
            addiu $sp, $sp, -4
            add $a1, $0, 1
            sw $a1, 0($sp)
            addiu $sp, $sp, -4
            add $a1, $0, 2
            lw $t0, 4($sp)
            addiu $sp, $sp, 4
            beq $t0, $a1, ll0
            ll1:
            add $a0, $0, 20
            add $v0, $0, 1
            syscall
            j ll2
            ll0:
            add $a0, $0, 10
            add $v0, $0, 1
            syscall
            ll2:
            lw $ra, 4($sp)
            addiu $sp, $sp, 4
            lw $fp, 0($sp)
            jr $ra
            `
            expect(trim(result)).to.deep.equal(trim(expected))
        }),
        it('should store into register const + const', () => {
            let {ast, table} = Parser.semantic(`
                int main() {
                    int x;
                    int y;
                    y = 4;
                    x = 2 + 4;
                    output(x);
                }                               
            `)
            let asm = cgen.generate(ast, table);
            let result = ASM.generate(asm);
            let expected = `
            .data
            .text
            .globl main
            jal main
            add $v0, $0, 10
            syscall

            main:
            add $fp, $0, $sp
            sw $ra, 0($sp)
            addiu $sp, $sp, -4

            add $a1, $0, 4 
            sw $a1, 4($fp)

            add $a1, $0, 2  

            sw $a1, 0($sp)
            addiu $sp, $sp, -4
            add $a1, $0, 4
            lw $t0, 4($sp)
            addiu $sp, $sp, 4
            add $a1, $t0, $a1 
            sw $a1, 8($fp)

            lw $a0, 8($fp)
            add $v0, $0, 1
            syscall

            lw $ra, 4($sp)
            addiu $sp, $sp, 4
            lw $fp, 0($sp)
            jr $ra
            `
            expect(trim(result)).to.deep.equal(trim(expected))
        })
    }),
    describe('Storing Variables', () => {
        it('should store into register const + int', () => {
            let {ast, table} = Parser.semantic(`
                int main() {
                    int x;
                    int y;
                    int z; 
                    y = 4;

                    x = 2 + y;
                    output(x);
                }                               
            `)
            let asm = cgen.generate(ast, table);
            let result = ASM.generate(asm);
            let expected = `
            .data
            .text
            .globl main
            jal main
            add $v0, $0, 10
            syscall

            main:
            add $fp, $0, $sp
            sw $ra, 0($sp)
            addiu $sp, $sp, -4

            add $a1, $0, 4 
            sw $a1, 4($fp)

            add $a1, $0, 2  

            sw $a1, 0($sp)
            addiu $sp, $sp, -4
            lw $a1, 4($fp)

            lw $t0, 4($sp)
            addiu $sp, $sp, 4
            add $a1, $t0, $a1 
            sw $a1, 8($fp)

            lw $a0, 8($fp)
            add $v0, $0, 1
            syscall

            lw $ra, 4($sp)
            addiu $sp, $sp, 4
            lw $fp, 0($sp)
            jr $ra
            `
            expect(trim(result)).to.deep.equal(trim(expected))
        })
    }),
    describe('Simple Arithmetic Expressions', () => {
        it('add/sub/mul/div', () => {
            let x = new TerminalNode(ParserConstants.intConst, 2),
                y = new TerminalNode(ParserConstants.intConst, 4),
                expr = new NonterminalNode(ParserConstants.addOp, [x,y]),
                asm = cgen.generate(expr);

            let a = ASM.store('$a1', '$sp', 0),
                b = ASM.arith('addiu', '$sp', '$sp', -4),
                c = ASM.arith('add', '$a1', "$0", 2),
                d = ASM.arith('add', '$a1', "$0", 4),
                e = ASM.load('$t0', '$sp', 4),
                f = ASM.arith('add', '$a1', '$t0', '$a1'),
                g = ASM.arith('addiu', '$sp', '$sp', 4),
                h = ASM.load('$a1', '$sp', 0);
            expect(asm.length).to.equal(7);

            expect(asm[0]).to.deep.equal(c);
            expect(asm[1]).to.deep.equal(a);
            expect(asm[2]).to.deep.equal(b);
            expect(asm[3]).to.deep.equal(d);
            expect(asm[4]).to.deep.equal(e);
            expect(asm[5]).to.deep.equal(g);
            expect(asm[6]).to.deep.equal(f);

            x = new TerminalNode(ParserConstants.intConst, 10);
            y = new TerminalNode(ParserConstants.intConst, 5);
            expr = new NonterminalNode(ParserConstants.subOp, [x,y]);
            cgen = new CodeGenerator();
            asm = cgen.generate(expr);
            f = ASM.arith('sub', '$a1', '$t0', '$a1');
            expect(asm[6]).to.deep.equal(f);

            x = new TerminalNode(ParserConstants.intConst, 10);
            y = new TerminalNode(ParserConstants.intConst, 5);
            expr = new NonterminalNode(ParserConstants.mulOp, [x,y]);
            cgen = new CodeGenerator();
            asm = cgen.generate(expr)
            f = ASM.arith('mul', '$a1', '$t0', '$a1'),
            expect(asm[6]).to.deep.equal(f);

            x = new TerminalNode(ParserConstants.intConst, 10);
            y = new TerminalNode(ParserConstants.intConst, 5);
            expr = new NonterminalNode(ParserConstants.divOp, [x,y]);
            cgen = new CodeGenerator();
            asm = cgen.generate(expr);
            f = ASM.arith('div', '$a1', '$t0', '$a1');
            expect(asm[6]).to.deep.equal(f);
        })
        it('with variables', () => {
            let {ast, table} = Parser.Parse("int main() { int x; int y; y = 4; x = y + 2; }")
            let asm = cgen.generate(ast, table)

        })
    })
})
    
