import colors from 'colors/safe'
import Table from 'cli-table'
import _ from 'lodash'

const blue = colors.blue;
const red = colors.red;

function printTable(symTable) {
    let table = new Table({
        head: ['Symbol', 'Type', 'Scope', 'Attributes']
        , colWidths: [30, 40, 15, 30]
    });
    _.forEach(symTable, function(entry, scope) {
        _.forEach(entry, function(innerScope, key) {
            let nodeType = innerScope.nodeType ? innerScope.nodeType : '';
            table.push([key, innerScope.type, scope, nodeType]);
        })
    });
    console.log(table.toString());
}

function getLine(node) {
    var green = colors.green;
    if (node.terminal) 
        node = node.terminal;
    return green("(" + node.loc.first_line + ',' + node.loc.first_column + ")")
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

export {print, printTable, log, treeToString}
