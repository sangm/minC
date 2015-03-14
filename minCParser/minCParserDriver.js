var colors = require('colors/safe');
var fs = require('fs');
var minCParser = require('./dist/minCParser.js');
var print = require('./dist/tree.js').print;
var Table = require('cli-table');
var _ = require('lodash');

// instantiate
var table = new Table({
    head: ['Symbol', 'Type', 'Scope']
  , colWidths: [30, 30, 40]
});

// table is an Array, so you can `push`, `unshift`, `splice` and friends

function log(obj) {
    console.log(JSON.stringify(obj, null, 2));
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
            var symTable = parser.table.table;
            _.forEach(symTable, function(entry, scope) {
                _.forEach(entry, function(innerScope, key) {
                    var nodeType = innerScope.nodeType ? innerScope.nodeType + ' ' : '';
                    table.push([key, nodeType + innerScope.type, scope]);
                })
            });
            console.log(colors.magenta(data));
            console.log(table.toString());
            print(ast);
            
        }
    })
}
