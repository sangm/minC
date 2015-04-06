import _ from 'lodash'
import ParserConstants from './ParserConstants'
import {print, log} from './util'


class SymbolTable {
    constructor(globalScope) {
        this.table = { }
        this.scopes = [globalScope]
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
        scope = scope || this.scopes.slice(-1)[0];
        this.table[scope] = this.table[scope] || { }
        this.table[scope][symbol] = {type: type};
        if (nodeType) {
            this.table[scope][symbol]["nodeType"] = nodeType;
            this.table[scope][symbol]["node"] = node;
        }
        
    }
    getScope(scope) {
        if (this.table[scope] == null) {
            console.warn("Scope " + scope + " does not exist");
        }
        return this.table[scope];
    }
    lookup(node, scope) {
        scope = scope || this.scopes.slice(-1)[0];
        console.log(this.temp);
        return false;
        
    }
}
export default SymbolTable;
