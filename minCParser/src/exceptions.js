import {print, getLine, getNode} from './util'
import ParserConstants from './ParserConstants'

class BaseError extends Error {
    constructor(node, name, message) {
        this.name = name;
        if (!node.data) {
            let id = getNode(node, ParserConstants.ID);
            if (Array.isArray(id)) 
                node.data = id.map(n => getNode(n, ParserConstants.ID).data)
            else
                node.data = id ? id.data : node.type;
        }
        message = `${node.data} ${message} ${getLine(node)}`;
        this.message = message || `${name} Thrown`; 
    }
}

class ScopeError extends BaseError {
    constructor(node) {
        super(node, "ScopeError", "is not declared in scope")
    }
}

class MultipleDeclarationError extends BaseError {
    constructor(node) {
        super(node, "MultipleDeclarationError", "has already been declared")
    }
}

class FunctionMismatchError extends BaseError {
    constructor(node) {
        super(node, "FunctionMismatchError", "does not match any function")
    }
}

class TypeMismatchError extends BaseError {
    constructor(node) {
        super(node, "TypeMismatchError", "type does not match")
    }
}

class OutOfBounds extends BaseError {
    constructor(node) {
        super(node, "OutOfBoundsError", "out of bounds")
    }
}

export {ScopeError, MultipleDeclarationError, FunctionMismatchError, TypeMismatchError, OutOfBounds}
