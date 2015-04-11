import colors from 'colors/safe'
import Table from 'cli-table'
import _ from 'lodash'
import ParserConstants from './ParserConstants'

const blue = colors.blue;
const red = colors.red;

const equalTable = {};
equalTable[ParserConstants.intConst] = 'int';
equalTable[ParserConstants.charConst] = 'char';
equalTable[ParserConstants.strConst] = 'string';

function extractTypes(node, table) {
    if (node.type === ParserConstants.typeSpecifier)
        return [node.data];
    if (node.type in equalTable)
        return [equalTable[node.type]];
    let types = [];
    let ids = getNode(node, ParserConstants.ID);
    if (ids) {
        if (!Array.isArray(ids)) ids = [ids];
        types = _.flatten(ids.map(id => {
            let decls = table.getLocalNode(id);
            let types = decls.map(decl => {
                let type = getNode(decl.type, ParserConstants.typeSpecifier);
                return type.data;
            })
            return types;
        }));
    }
    return types;
}

function getType(node) {
    // if it has charConst, intConst, strConst
    if (node.type === ParserConstants.intConst || node.type === ParserConstants.strConst ||
        node.type === ParserConstants.charConst) {
       return node; 
    }
    if (node.terminal)
        return false;
    let result = getNode(node, ParserConstants.intConst) ||
                 getNode(node, ParserConstants.strConst) ||
                 getNode(node, ParserConstants.charConst);
    if (!result) {
        result = getNode(node, ParserConstants.typeSpecifier);
        if (!result)
            console.warn('getType returns null')
    }
    return result;
}

function functionEquality(a, b) {
    // a.id === b.id && a.[formalDeclList].type === b.[formalDeclList].type 
    if (a == null || b == null) {
        throw new Error("Function Equality received null nodes");
    }
    let aID = getNode(a, ParserConstants.ID);
    let bID = getNode(b, ParserConstants.ID);
    if (aID.data !== bID.data)
        return false;
    let filterFunction = (node, type) => { return getNode(node, type).data; }
    let aFormalDeclList = getNode(a, ParserConstants.formalDeclList),
        bFormalDeclList = getNode(b, ParserConstants.formalDeclList),
        aTypes, 
        bTypes;

    if (aFormalDeclList) {
        aTypes = aFormalDeclList.children.map(formalDecl => filterFunction(formalDecl, ParserConstants.typeSpecifier));
    }
    if (bFormalDeclList) {
        bTypes = bFormalDeclList.children.map(formalDecl => filterFunction(formalDecl, ParserConstants.typeSpecifier));
    }
    return _.isEqual(aTypes, bTypes);
}

function arrayEquality(a, b) {

}

function printTable(symTable) {
    let table = new Table({
        head: ['Symbol', 'Type', 'Scope', 'Attributes']
        , colWidths: [30, 40, 15, 30]
    });
    _.forEach(symTable, function(entry, scope) {
        _.forEach(entry, function(innerScope, key) {
            if (Array.isArray(innerScope)) {
                _.forEach(innerScope, function(sub) {
                    let nodeType = sub.nodeType ? sub.nodeType : '';
                    table.push([key, sub.type, scope, nodeType]);
                })
            }
            else {
                let nodeType = innerScope.nodeType ? innerScope.nodeType : '';
                table.push([key, innerScope.type, scope, nodeType]);
            }
        })
    });
    console.log(table.toString());
}

function getLine(node) {
    if (node == null) {
        return "node was null";
    }
    if (!node.loc) {
        console.log(node);
        return "location isn't defined for node"
    }
    if (node.terminal) 
        node = node.terminal;
    return `(${node.loc.first_line},${node.loc.first_column})`
}

function print(ast, level = 0) {
    if (ast == null)  {
        console.log("ast is undefined");
        return;
    }
    var string = Array(level+1).join(blue("\u2022 "));
    if (ast.terminal) {
        var green = colors.green;
        console.log(string + ast.terminal.type, ast.terminal.data + ' ' + green(getLine (ast)));
    }
    else {
        console.log(string + ast.type);
        var children = ast.getChildren();
        children.forEach(function(child) {
            print(child, level + 1);
        })
    }
} 

function treeToString(ast, level = 0) {
    let result;
    let string = Array(level+1).join(blue("\u2022 "));

    if (ast.terminal) {
        return string + ast.terminal.type + ' ' + ast.terminal.data + ' ' + getLine(ast) + '\n';
    } 
    else {
        result = string + ast.type + '\n';
        let children = ast.getChildren();
        for (let child of children) {
            result += treeToString(child, level + 1);
        }
    }
    return result;
}

function log(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function extractNode(ast, type, n = 0, count = 0) {
    /* Goes through ast and returns the nth sub tree of type */
    if (type == undefined) 
        throw "Type was undefined";
    let children = ast.getChildren();
    while (children.length !== 0) {
        let queue = [];
        for (let child of children) {
            if (child.type === type) {
                if (count === n)
                    return child;
                count += 1;
            }
            else {
                queue.push(...child.getChildren());
            }
        }
        children = queue;
    }
    return null;
}

function getID(node) {
   if (node == null) return;
    
}

function getNode(node, type) {
    if (node == null) {
        return false;
    }
    if (node.type === type)
        return node;
    if (!node.children) {
        return false;
    }
    let children = _.flatten(node.children.map(c => {
        if (c.type === ParserConstants.arrayDecl) {
            let result = c.children.filter(c => c.type === type || c.type === ParserConstants.arrayDecl);
            let b = result.map(n => getNode(n, type));
            let f = result.map(n => {
                return getNode(n, type)
            });
            return f;
        }
        else
            if (c.type === type) return c;
    }).filter(c => c != null));
    if (children.length === 1) {
        return children[0];
    }
    else if (children.length >= 1) {
        return children;
    }
    return false;
}

function typeEquality(a, b) {
    let equalTable = {};
    equalTable[ParserConstants.intConst] = 'int';
    equalTable[ParserConstants.charConst] = 'char';
    equalTable[ParserConstants.strConst] = 'string';
    if (a.type in equalTable)
        return equalTable[a.type] === b.data;
    if (b.type in equalTable)
        return equalTable[b.type] === a.data;
    if (a in equalTable)
        return equalTable[a] === b;
    else
        return equalTable[b] === a;
}

function compareNodes(funcDecl, funcCallExpr) {
    if (funcDecl.type !== ParserConstants.funcDecl && funcCallExpr.type !== ParserConstants.funcCallExpr) // Try swapping the values if types do not match
        [funcDecl, funcCallExpr] = [funcCallExpr, funcDecl];
    if (funcDecl.type !== ParserConstants.funcDecl || funcCallExpr.type !== ParserConstants.funcCallExpr)
        throw new Error("Function takes funcDecl and funcCallExpr");
    let formalDeclList = getNode(funcDecl, ParserConstants.formalDeclList);
    let argList = getNode(funcCallExpr, ParserConstants.argList);

    if (formalDeclList && argList) {
        if (argList.length !== formalDeclList.length)
            return false;
        // check type here
        let result = _.zip(argList.children, formalDeclList.children)
                      .map(pair => {
                          let [arg, formalDecl] = pair;
                          let argType = arg.type;
                          let declType = getNode(formalDecl, ParserConstants.typeSpecifier).data;
                          return typeEquality(declType, argType);
                      }) 
                      .filter(result => result === false);
        return result.length === 0;
    }
    else if (argList.length === 0 && !formalDeclList) { /* no arguments given to both */
        return true;
    }
    return false;
}

export {print, printTable, log, treeToString, extractNode, getLine, compareNodes, getNode, typeEquality, functionEquality, getType, extractTypes}
