var fs = require('fs');
var minCParser = require('./dist/minCParser.js');
var print = require('./dist/tree.js').print;

function getLine(node) {
    var green = colors.green;
    if (node.terminal) 
        node = node.terminal;
    return green("(" + node.loc.first_line + ',' + node.loc.first_column + ")")
}

if (process.argv.length <= 2) {
    console.log(blue("Usage: node minCParser.js filename"));
}
else {
    fs.readFile(process.argv[2], 'utf8', function(err, data) {
        if (err)
            console.log(red("Could not fild the file %s"), process.argv[2])
        else {
            var parser = minCParser.parse(data);
            var ast = parser.ast;
            var table = parser.table;
            print(ast);
            console.log(table);
        }
    })
}
