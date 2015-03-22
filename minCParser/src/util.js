import colors from 'colors/safe'
import Table from 'cli-table'
import _ from 'lodash'

const blue = colors.blue;
const red = colors.red;

function printTable(symTable) {
    let table = new Table({
        head: ['Symbol', 'Type', 'Scope']
        , colWidths: [30, 30, 40]
    });
    _.forEach(symTable, function(entry, scope) {
        _.forEach(entry, function(innerScope, key) {
            var nodeType = innerScope.nodeType ? innerScope.nodeType + ' ' : '';
            table.push([key, nodeType + innerScope.type, scope]);
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

function log(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

export {print, printTable, log}
