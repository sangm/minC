class TerminalNode {
    constructor(type, data, loc) {
       this.terminal = {type: type, data: data, loc: loc} 
    }
}
class NonterminalNode {
    constructor(type, children, loc) {
        this.children = children || [];
        if (this.children.constructor !== Array) 
            this.children = [this.children];
        this.type = type;
    }
    
    addChild(child) {
        this.children.push(child);
    }
}

class Node {
    static printNode(node, level = 0) {

    }
    static getChildren(root, level) {

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

export {TerminalNode, NonterminalNode, Node} 
