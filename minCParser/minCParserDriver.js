var fs = require('fs');
var minCParser = require('./dist/minCParser.js');
var print = require('./dist/tree.js').print;

function getLine(node) {
    var green = colors.green;
    if (node.terminal) 
        node = node.terminal;
    return green("(" + node.loc.first_line + ',' + node.loc.first_column + ")")
}

function printAst(ast, level) {
    var string = blue("\u2022 ").repeat(level);
    if (ast.terminal) {
        console.log(string + ast.terminal.type, ast.terminal.data + ' ' + getLine(ast));
    }
    else {
        console.log(string + ast.type);
        var children = ast.getChildren();
        children.forEach(function(child) {
            printAst(child, level + 1);
        })
    }
}

if (process.argv.length <= 2) {
    console.log(blue("Usage: node minCParser.js filename"));
}
else {
    fs.readFile(process.argv[2], 'utf8', function(err, data) {
        if (err)
            console.log(red("Could not fild the file %s"), process.argv[2])
        else {
            var ast = minCParser.parse(data);
            print(ast);
        }
    })
}
