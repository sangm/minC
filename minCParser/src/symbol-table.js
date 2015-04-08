import _ from 'lodash'
import ParserConstants from './ParserConstants'
import {print, log, getNode, typeEquality} from './util'
import { TypeMismatchError, FunctionMismatchError } from './exceptions.js'


function getType(node) {
    // if it has charConst, intConst, strConst
    let result = getNode(node, ParserConstants.intConst) ||
                 getNode(node, ParserConstants.strConst) ||
                 getNode(node, ParserConstants.charConst);
    if (!result) {
        console.warn("getType returned null");
    }
    return result;
}

function idEquality(a, b) {
    if (a === b) return false;
    if (a.type !== ParserConstants.ID)
        a = getNode(a, ParserConstants.ID);
    if (b.type !== ParserConstants.ID)
        b = getNode(b, ParserConstants.ID);
    return a.id === b.id;
}

class SymbolTable {
    constructor(globalScope) {
        this.table = { }
        this._functionCalls = [];
        this.temp = [];
    }

    destructArray(arrayDecl) {
        if (arrayDecl.type === ParserConstants.arrayDecl) {
            let constant = arrayDecl.children[2] ? arrayDecl.children[2].data : '';
            return `${arrayDecl.children[0].data} ${arrayDecl.children[1].data}[${constant}]`
        }
    }

    destructTerminal(terminal) {
        if (terminal.type === ParserConstants.typeSpecifier)
            return `${terminal.data} `;
        else if (terminal.type === ParserConstants.ID)
            return `${terminal.data}`;
        else if (terminal.type === ParserConstants.arrayDecl) 
            return this.destructArray(terminal);
        else 
            return "Not a terminal";
    }

    destructDeclList(formalDeclList) {
        let delimitter = ', ';
        let result = '';
        formalDeclList.children.map(formalDecl => {
            formalDecl.children.map(terminal => result += this.destructTerminal(terminal));
            result += delimitter;
        });
        return result.slice(0, -delimitter.length);
    }

    destructNode(node) {
        if (!node.type) {
            return `cannot destruct node ${node}`;
        }
        let type = '';
        if (node.type === ParserConstants.funcDecl) {
            node.children.map(child => {
                if (child.terminal) {
                    type += this.destructTerminal(child.terminal);
                }
                else if (child.type === ParserConstants.formalDeclList) {
                    type += '('
                    type += this.destructDeclList(child);
                    type += ')'
                }
            });
        }
        else if (node.type === ParserConstants.arrayDecl) {
            type += this.destructTerminal(node);
        }
        return type;
    }
    
    addTemp(symbol, type, nodeType) {
        var temp = {};
        temp.symbol = symbol;
        temp.type = type;
        temp.nodeType = nodeType;
        this.temp.push(temp);
    }
    
    addTemps(scope) {
        this.temp.map(t => this.insert(t.symbol, t.type, t.nodeType, scope));
        this.temp = [];
    } 

    insert(symbol, type, nodeType, scope) {
        // type == actual ast node, deep clone node
        let node = null;
        if (nodeType) {
            node = type;
            type = this.destructNode(type);
        }
        scope = scope || ParserConstants.globalScope;
        this.table[scope] = this.table[scope] || { }
        this.table[scope][symbol] = {type: type};
        if (nodeType) {
            this.table[scope][symbol]["nodeType"] = nodeType;
            this.table[scope][symbol]["node"] = node;
        }
        
    }

    getScope(scope) {
        if (this.table[scope] == null) {
            return false;
        }
        return this.table[scope];
    }

    searchLocalScope(node) {
        let global = this.getScope(ParserConstants.globalScope);
        let results = this.temp.filter(t => {
            let localNode = t.type;
            let localId = localNode !== ParserConstants.ID ? getNode(localNode, ParserConstants.ID) : localNode;
            let nodeId = node.type !== ParserConstants.ID ? getNode(node, ParserConstants.ID) : node
            return localId !== nodeId && localId.data === nodeId.data;
        });
        return results;
        
    }
    
    searchGlobalScope(node) {
        let global = this.getScope(ParserConstants.globalScope);
        if (global[node.data])
            return {scope: ParserConstants.globalScope, node: global[node.data]};
        else
            return false;
    }

    lookup(node, scope) {
        if (!node.type) {
            return "lookup was called without node";
        }
        scope = scope || ParserConstants.globalScope;
        let global = this.getScope(ParserConstants.globalScope);
        let id = node.data == null ? getNode(node, ParserConstants.ID) : node;
        if (scope === ParserConstants.globalScope) {
            return this.searchGlobalScope(id);
        }
        else {
            let results = this.searchLocalScope(node);
            if (results.length === 0) {
                return this.searchGlobalScope(id);
            }
            else if (results.length === 1) {
                if (node.type === ParserConstants.arrayDecl) {
                    let result = results[0].type;
                    let resultType = getNode(result, ParserConstants.typeSpecifier);
                    let nodeType = getType(node);
                    return {error: TypeMismatchError, scope:ParserConstants.localScope, node: results[0]};
                }
                return {scope: ParserConstants.localScope, node: results[0] };
            }
            else { /* this shouldn't happen... but you know.. programs. */
                console.warn('Multiple values were found in local scope');
                return results;
            }
        }
        return false;
    }

    get functionCalls() {
        return this._functionCalls;
    }
    
    addFunctionCall(func) {
        this._functionCalls.push(func);
    }
}
export default SymbolTable;
