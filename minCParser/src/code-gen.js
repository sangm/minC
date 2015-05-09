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


const GLOBAL_VARIABLES_INIT = 0;
const addExpr = [ParserConstants.addOp, ParserConstants.subOp, ParserConstants.divOp, ParserConstants.mulOp];

class CodeGenerator {

    constructor() {
        this.nodes = [];
        this.register = 7;
        this.offsetCounter = 0;
        this.accu = REGISTERS["accumulator"];
        this.currentScope = ParserConstants.globalScope;
    }
    
    emit(type, ...rest) {
        let id, size, val,
            dest, base, offset,
            instr, register, a, b;
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
        default:
            [instr, register, a, b] = rest;
            this.nodes.push(ASM.arith(instr, register, a, b))
        }
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
        this.push(this.accu);
        this.generateCode(ast, table);
        this.pop();
        return this.nodes;
    }
    
    generateCode(ast, table) {
        if (ast == null)
            return;
        let type = ast.type;
        if (type === ParserConstants.funcDecl) {
            let id = extractNode(ast, ParserConstants.ID);
            this.currentScope = id.data;
        }
        if (addExpr.findIndex(e => e === type) !== -1) {
            return this.expr(ast, table);
        }
        else if (type === ParserConstants.assignStmt) {
            /*
            let leftChild = ast.children[0];
            let rightChild = ast.children[1];
            let a = this.base(leftChild);
            let b = this.offset(leftChild, table);
            let register = this.expr(rightChild, table);
            */
            return;
        }

        let children = ast.getChildren();
        for (let child of children) {
            this.generateCode(child, table);
        }
    }
    
    push(node) {
        if (node === this.accu) {
            this.emit(ParserConstants.STORE, this.accu, '$sp', 0)
        }
        else {
            this.emit(ParserConstants.EXPRESSION, 'addiu', '$sp', '$sp', -4)
            this.emit(ParserConstants.EXPRESSION, 'add', this.accu, '$0', node.data)
        }
    }
    
    pop(node) {
        this.emit(ParserConstants.LOAD, '$t0', '$sp', 4)
        this.emit(ParserConstants.EXPRESSION, 'addiu', '$sp', '$sp', 4)
    }

    accumulator(type) {
        this.emit(ParserConstants.EXPRESSION, INSTRUCTIONS[type], this.accu, '$t0', this.accu)
    }
    
    expr(node, table) {
        let type = node.type,
            register,
            a,
            b;
        switch(type) {
        case ParserConstants.intConst:
            /* Push onto stop */
            this.push(node);
            break;
        case ParserConstants.ID:
            a = this.base(node);
            b = this.offset(node, table);
            break;
        default:
            let leftChild = node.children[0];
            let rightChild = node.children[1];
            a = this.expr(leftChild, table);
            this.push(this.accu);
            b = this.expr(rightChild, table);
            this.pop();
            this.accumulator(type);
            break;
        }
        return register;
    }
    
    assign(node, table) {
        
    }
}

export default CodeGenerator;

