import ParserConstants from './ParserConstants'
import ASM from './asm.js'
import {extractNode, print, printTable, log} from './util'
import format from 'string-template'

const SIZES = {
    "int": ".word"
}

const REGISTERS = {
    accumulator: "$a1",
    0: "$0",  
    1: "$at",
    2: "$v0", 
    3: "$v1",
    4: "$a0", 
    5: "$a1", 
    6: "$a2", 
    7: "$a3",
    8: "$t0", 
    9: "$t1", 
    10: "$t2", 
    11: "$t3",
    12: "$t4", 
    13: "$t5", 
    14: "$t6", 
    15: "$t7",
    16: "$s0", 
    17: "$s1",
    18: "$s2",
    19: "$s3",
    20: "$s4",
    21: "$s5", 
    22: "$s6",
    23: "$s7",
    24: "$t8", 
    25: "$t9", 
    26: "$k0", 
    27: "$k1", 
    28: "$gp",
    29: "$sp",
    30: "$fp",
    31: "$ra"
}

let INSTRUCTIONS = {
    "li": "li",
    "sw": "sw",
    "lw": "lw"
}
INSTRUCTIONS[ParserConstants.addOp] = "add"
INSTRUCTIONS[ParserConstants.subOp] = "sub"
INSTRUCTIONS[ParserConstants.divOp] = "div"
INSTRUCTIONS[ParserConstants.mulOp] = "mul"

INSTRUCTIONS[ParserConstants.eqOp] = "beq"
INSTRUCTIONS[ParserConstants.neqOp] = "bne"
INSTRUCTIONS[ParserConstants.gteOp] = "bge"
INSTRUCTIONS[ParserConstants.gtOp] = "bgt"
INSTRUCTIONS[ParserConstants.lteOp] = "ble"
INSTRUCTIONS[ParserConstants.ltOp] = "blt"


const GLOBAL_VARIABLES_INIT = 0;
const addExpr = [
    ParserConstants.addOp, 
    ParserConstants.subOp,
    ParserConstants.divOp, 
    ParserConstants.mulOp
];
const BRANCH_PREDICATES = [
    ParserConstants.eqOp,
    ParserConstants.neqOp,
    ParserConstants.gteOp,
    ParserConstants.gtOp,
    ParserConstants.ltOp,
    ParserConstants.lteOp,
]


class CodeGenerator {

    constructor() {
        this.labelCounter = 0;
        this.nodes = [];
        this.register = 7;
        this.offsetCounter = 0;
        this.accu = REGISTERS["accumulator"];
        this.currentScope = ParserConstants.globalScope;
    }
    
    emit(type, ...rest) {
        let id, size, val,
            dest, base, offset,
            instr, register, a, b,
            label;
        switch(type) {
        case ParserConstants.globalScope:
            [id, size, val] = rest;
            this.nodes.push(ASM.globalVariable(id, size, val));
            break;
        case ParserConstants.LOAD:
            [dest, base, offset] = rest;
            this.nodes.push(ASM.load(dest, base, offset))
            break;
        case ParserConstants.STORE:
            [dest, base, offset] = rest;
            this.nodes.push(ASM.store(dest, base, offset))
            break;
        case ParserConstants.SYSCALL:
            this.nodes.push(ASM.syscall());
            break;
        case ParserConstants.LABEL:
            [label] = rest;
            this.nodes.push(ASM.label(label))
            break;
        case ParserConstants.JUMP:
            [label] = rest;
            this.nodes.push(ASM.jump(label))
            break;
        default:
            [instr, register, a, b] = rest;
            this.nodes.push(ASM.arith(instr, register, a, b))
        }
    }
    
    nextLabel() {
        let label = `ll${this.labelCounter}`;
        this.labelCounter += 1;
        return label;
    }
    
    nextReg() {
        if (this.registers > 15)
            console.log("ran out of temp registers");
        return REGISTERS[this.register+=1]
    }
    
    nextOffset(type) {
        // get size
        let offset = this.offsetCounter;
        if (type === "int") {
            this.offsetCounter += 4;
        }
        return offset;
        
    }
    
    globalVariables(ast) {
        // look for global variables and add to asm
        let declList = extractNode(ast, ParserConstants.declList);
        if (!declList) {
            return; 
        }
        let decls = declList.getChildren();
        for (let decl of decls) {
            /* finding global variables */
            if (decl.type === ParserConstants.varDecl) {
                let type = extractNode(decl, ParserConstants.typeSpecifier);
                let id = extractNode(decl, ParserConstants.ID);
                this.emit(ParserConstants.globalScope, id.data, SIZES[type.data], GLOBAL_VARIABLES_INIT)
            }
        }
    }
    
    offset(node, table) {
        // look up symbol table and find the offset for a variable 
        let scope = table.getScope(this.currentScope),
            entry = scope[node.data],
            offset;
        if (entry) {
            if (entry["offset"] == null) {
                entry["offset"] = this.nextOffset(entry.type);
            }
            return entry["offset"];
        }
        console.log("Could not find node in symbol table..");
    }

    generate(ast, table) {
        if (!ast) {
            return;
        }
        this.globalVariables(ast);

        // save $a0 as its used as the accumulator
        this.generateCode(ast, table);
        this.emit(ParserConstants.expression, 'add', '$v0', '$0', 10);
        this.emit(ParserConstants.SYSCALL);
        return this.nodes;
    }
    
    generateCode(ast, table) {
        if (ast == null)
            return;

        let type = ast.type;

        if (addExpr.findIndex(e => e === type) !== -1) {
            let e1 = ast.children[0],
                e2 = ast.children[1];
            this.generateCode(e1, table);
            this.push(this.accu);
            this.generateCode(e2, table);
            this.pop();
            this.accumulator(type);
            return;
        }
        else if (type === ParserConstants.loopStmt) {
            /* while (e1 pred e2) e3 */
            let loopStmt = extractNode(ast, ParserConstants.kwdWhile),
                predicate = loopStmt.children[0],
                e1 = predicate.children[0],
                e2 = predicate.children[1],
                e3 = loopStmt.children[1],
                beginLoop = this.nextLabel(),
                enterLoop = this.nextLabel(),
                endLoop = this.nextLabel();

            this.emit(ParserConstants.LABEL, beginLoop);
            this.generateCode(e1, table);
            this.push(this.accu);
            this.generateCode(e2, table);
            this.pop();
            this.emit(ParserConstants.condStmt, 
                      INSTRUCTIONS[predicate.type],
                      '$t0',
                      this.accu,
                      enterLoop);
            this.emit(ParserConstants.JUMP, endLoop);
            this.emit(ParserConstants.LABEL, enterLoop);
            this.generateCode(e3, table)
            this.emit(ParserConstants.JUMP, beginLoop);
            this.emit(ParserConstants.LABEL, endLoop);
            return; 
        }
        else if (type === ParserConstants.condStmt) {
            /* if (e1 pred e2) e3 else e4 */
            
            let ifStmt = extractNode(ast, ParserConstants.kwdIf),
                elseStmt = extractNode(ast, ParserConstants.kwdElse),
                predicate = ifStmt.children[0],
                e1 = predicate.children[0],
                e2 = predicate.children[1],
                e3 = ifStmt.children[1],
                e4 = elseStmt ? elseStmt.children[0] : null,
                trueBranch = this.nextLabel(),
                falseBranch = this.nextLabel(),
                endBranch = this.nextLabel();

            this.generateCode(e1, table);
            this.push(this.accu);
            this.generateCode(e2, table);
            this.pop();

            this.emit(ParserConstants.condStmt, 
                      INSTRUCTIONS[predicate.type],
                      '$t0',
                      this.accu,
                      trueBranch)
            this.emit(ParserConstants.LABEL, falseBranch);
            this.generateCode(e4);
            this.emit(ParserConstants.JUMP, endBranch);
            this.emit(ParserConstants.LABEL, trueBranch);
            this.generateCode(e3);
            this.emit(ParserConstants.LABEL, endBranch);
            return;
        }
        else if (type === ParserConstants.funcCallExpr) {
            let id = extractNode(ast, ParserConstants.ID),
                arg;
            if (id.data === ParserConstants.printFunc) {
                // printing integer is li $v0, 1; syscall
                arg = extractNode(ast, ParserConstants.intConst)
                this.emit(ParserConstants.expression, 'add', '$a0', '$0', arg.data)
                this.emit(ParserConstants.expression, "add", '$v0', '$0', 1)
                this.emit(ParserConstants.SYSCALL)
            }
            return; 
        }
        else if (type === ParserConstants.intConst) {
            this.emit(ParserConstants.expression, "add", this.accu, '$0', ast.data)
            return;
        }
        let children = ast.getChildren();
        for (let child of children) {
            this.generateCode(child, table);
        }
    }

    push(node) {
        this.emit(ParserConstants.STORE, this.accu, '$sp', 0)
        this.emit(ParserConstants.expression, 'addiu', '$sp', '$sp', -4)
    }
    
    pop(node) {
        if (node === this.accu) {
            this.emit(ParserConstants.LOAD, this.accu, '$sp', 0)
        }
        else {
            this.emit(ParserConstants.LOAD, '$t0', '$sp', 4)
            this.emit(ParserConstants.expression, 'addiu', '$sp', '$sp', 4)
        }
        
    }
    
    accumulator(type) {
        this.emit(ParserConstants.expression, INSTRUCTIONS[type], this.accu, '$t0', this.accu)
    }
}

export default CodeGenerator;

