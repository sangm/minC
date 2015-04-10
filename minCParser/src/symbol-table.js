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
        scope = scope || ParserConstants.globalScope;
        this.table[scope] = this.table[scope] || { }
        if (this.table[scope][symbol]) {
            let scopeSymbol = this.table[scope][symbol];
        }
        this.table[scope][symbol] = this.constructSymbol(symbol, type, nodeType);
    }
    
    constructSymbol(symbol, type, nodeType) {
        let node;
        if (nodeType) {
            node = type;
            type = this.destructNode(type);
        }
        let symbolObj = {type: type}
        if (nodeType) {
            symbolObj["nodeType"] = nodeType;
            symbolObj["node"] = node;
        }
        return symbolObj;
    }

    getScope(scope) {
        if (this.table[scope] == null) {
            return false;
        }
        return this.table[scope];
    }
    
    getLocalNode(node) {
        let id = getNode(node, ParserConstants.ID);
        if (!Array.isArray(id)) {/* poor decision on my part, will refactor getNode to always return an array when I have time */
            id = [id];
        }
        let result = id.map(n => this.temp.filter(t => t.symbol === n.data))
        return _.flatten(result);
    }

    searchLocalScope(node) {
        let results = this.temp.map(t => {
            let localNode = t.type;
            let localId = getNode(localNode, ParserConstants.ID);
            let nodeId = getNode(node, ParserConstants.ID);
            if (!Array.isArray(nodeId)) {
                nodeId = [nodeId];
            }
            nodeId = nodeId.filter(n => localId !== n && localId.data === n.data);
            return nodeId;
        })
        return _.flatten(results);
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
            let returnObj = {};
            if (results.length === 0) {
                return this.searchGlobalScope(id);
            }
            else if (results.length === 1) {
                if (node.type === ParserConstants.arrayDecl) {
                    var returnObj = {};
                    let result = results[0].type;
                    let resultType = getNode(result, ParserConstants.typeSpecifier);
                    let nodeType = getType(node);
                    returnObj['scope'] = ParserConstants.localScope;
                    returnObj['node'] = results[0];
                    if (nodeType.type !== ParserConstants.intConst) {
                        returnObj['error'] = TypeMismatchError;
                    }
                    return returnObj;
                }
                return {scope: ParserConstants.localScope, node: results[0] };
            }
            else { /* only way this happens is if you have sub type expressions such as a[b[20]] */
                let nodes = results.map(sym => {
                    let [node] = this.temp.filter(t => t.symbol === sym.data)
                    let type = getNode(node.type, ParserConstants.typeSpecifier);
                    return type;
                }).reduce((prev, current) => prev.data === current.data);
                if (!nodes) {
                    returnObj['error'] = TypeMismatchError;
                    return returnObj;
                }
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
