import ParserConstants from './ParserConstants'

class ASM {
    static globalVariable(id, size, val) {
        return { 
            type: ParserConstants.globalScope,
            id: id,
            size: size,
            val: val
        }
    }
    
    static arith(instruction, a, b, c) {
        /* most use 3 check anyway */
        let base = { type: ParserConstants.expression, instruction: instruction, a: a }
        if (b != null) {
            base['b'] = b;
        }
        if (c != null) {
            base['c'] = c;
        }
        return base;
    }
    
    static store(register, base, offset) {
        return {
            type: ParserConstants.STORE,
            register: register,
            base: base,
            offset: offset
        }
    }

    static load(register, base, offset) {
        return {
            type: ParserConstants.LOAD,
            register: register,
            base: base,
            offset: offset
        }
    }
    
    static syscall() {
        return {
            type: ParserConstants.SYSCALL
        }
    }
    
    static label(lab) {
        return {
            type: ParserConstants.LABEL,
            label: lab
        }
    }
    
    static jump(label) {
        return {
            type: ParserConstants.JUMP,
            label: label
        }
    }
    
    static generate(asm) {
        let assembly = [],
            line;
        assembly.push(`.data`)
        assembly.push(`.text`)
        assembly.push(`.globl main`)
        assembly.push(`main:`)
        
        assembly = assembly.concat(asm.map(node => {
            switch(node.type) {
            case ParserConstants.STORE:
                return `sw ${node.register}, ${node.offset}(${node.base})`
                break;
            case ParserConstants.LOAD:
                return `lw ${node.register}, ${node.offset}(${node.base})`
                break;
            case ParserConstants.SYSCALL:
                return `syscall`
                break;
            case ParserConstants.LABEL:
                return `${node.label}:`
                break;
            case ParserConstants.JUMP:
                return `j ${node.label}`
                break;
            default:
                return `${node.instruction}, ${node.a}, ${node.b}, ${node.c}`
                break;
            }
        }))

        return assembly.join('\n')
    }
}

export default ASM;
