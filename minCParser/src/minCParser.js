'use strict';

import fs from 'fs'
import {Parser} from 'jison'
import ParserConstants from './ParserConstants'
import appRoot from 'app-root-path'
import minCLexer from  '../../minCLexer/minCLexer'
import {Node} from './tree'
import SymbolTable from './symbol-table'
import _ from 'lodash'


// `grammar` can also be a string that uses jison's grammar format
let bnf = fs.readFileSync(__dirname + "/../src/minCParser.jison", "utf8");
let minCParser = new Parser(bnf);


minCParser.lexer = minCLexer;

minCParser.Parse = function (code) {
    let symbolTable = new SymbolTable(ParserConstants.globalScope);
    
    _.assign(minCParser.yy, {symbolTable: symbolTable});
    _.assign(minCParser.yy.symbolTable, {overloading: minCParser.yy.overloading})
    return minCParser.parse(code);
}

minCParser.semantic = function(code, ...rest) {
    let optionsObj = {}
    optionsObj['semantic'] = true;
    rest.filter(arg => typeof arg === 'object')
        .map(arg => _.assign(optionsObj, arg));
    _.assign(minCParser.yy, optionsObj)
    return minCParser.Parse(code);
}

export default minCParser;
