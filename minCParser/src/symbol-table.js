import _ from 'lodash'
import ParserConstants from './ParserConstants'
import {print, log} from './util'


class SymbolTable {
    constructor(globalScope) {
        this.table = { }
        this.scopes = [globalScope]
        this.temp = [];
    }

    destructTerminal(terminal) {
        if (terminal.type === ParserConstants.typeSpecifier)
            return `${terminal.data} `;
        else if (terminal.type === ParserConstants.ID)
            return `${terminal.data}`;
        else if (terminal.type === ParserConstants.arrayDecl) 
            return `${terminal.children[0].data} ${terminal.children[1].data}[]`
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
        // need to grab typespecifier and id
        let type = '';
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
        this.temp.map(t => {
            this.insert(t.symbol, t.type, t.nodeType, scope);
        });
        this.temp = [];
    } 

    insert(symbol, type, nodeType, scope) {
        // type == actual ast node, deep clone node
        if (nodeType === ParserConstants.funcDecl) {
            type = this.destructNode(type);
        }
        
        scope = scope || this.scopes.slice(-1)[0];
        this.table[scope] = this.table[scope] || { }
        this.table[scope][symbol] = {type: type};
        if (nodeType)
            this.table[scope][symbol]["nodeType"] = nodeType;
    }
    getScope(scope) {
        if (this.table[scope] == null) {
            console.warn("Scope " + scope + " does not exist");
        }
        return this.table[scope];
    }
}
export default SymbolTable;
