class SymbolTable {
    constructor(globalScope) {
        this.table = { }
        this.scopes = [globalScope]
        this.temp = [];
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
