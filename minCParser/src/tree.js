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
    getChildren() {
        return [];
    }

    get length() {
        return 0;
    }

    get loc() {
        return this.terminal.loc;
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
        this.loc = loc;
    }
    
    addChild(child) {
        this.children.push(child);
    }
    
    getChildren() {
        return this.children;
    }

    get length() {
        return this.children.length;
    }
}

class Tree {
    
}

export {TerminalNode, NonterminalNode}
