import colors from 'colors/safe'

const blue = colors.blue;
const red = colors.red;

function getLine(node) {
    var green = colors.green;
    if (node.terminal) 
        node = node.terminal;
    return green("(" + node.loc.first_line + ',' + node.loc.first_column + ")")
}

class TerminalNode {
    constructor(type, data, loc) {
        if (type == null) {
            type = "needs to be defined in parserConstants";
        }
       this.terminal = {type: type, data: data, loc: loc} 
    }
    
    get type() {
        return this.terminal.type;
    }
    get data() {
        return this.terminal.data;
    }
}
class NonterminalNode {
    constructor(type, children, loc) {
        if (type == null) {
            type = "needs to be defined in parserConstants";
        }
        this.children = children || [];
        if (this.children.constructor !== Array) 
            this.children = [this.children];
        this.type = type;
    }
    
    addChild(child) {
        this.children.push(child);
    }
    
    getChildren() {
        return this.children;
    }
}
function print(ast, level = 0) {
    var string = Array(level+1).join(blue("\u2022 "));
    if (ast.terminal) {
        console.log(string + ast.terminal.type, ast.terminal.data + ' ' + getLine(ast));
    }
    else {
        console.log(string + ast.type);
        var children = ast.getChildren();
        children.forEach(function(child) {
            print(child, level + 1);
        })
    }
} 


/*
   printNode(level = 0) {
   let treeString = '\t'.repeat(level) + this._data;
   if (this._children.length === 0) return treeString;
   this._children.map(child => {
   treeString += '\n' + child.printNode(level+1);
   });
   return treeString;
 */

export {TerminalNode, NonterminalNode, print}
