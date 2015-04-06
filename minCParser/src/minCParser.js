'use strict';

import fs from 'fs'
import {Parser} from 'jison'
import ParserConstants from './ParserConstants'
import appRoot from 'app-root-path'
import minCLexer from  '../../minCLexer/minCLexer'
import {Node} from './tree'
import Table from './symbol-table'


// `grammar` can also be a string that uses jison's grammar format
let bnf = fs.readFileSync(__dirname + "/../src/minCParser.jison", "utf8");
let minCParser = new Parser(bnf);
minCParser.lexer = minCLexer;
minCParser.semantic = function(code, ...rest) {
    let optionsObj = {};
    optionsObj['semantic'] = true;
    rest.filter(arg => typeof arg === 'object')
        .map(arg => Object.assign(optionsObj, arg));
    minCParser.yy = optionsObj;
    minCParser.parse(code);
}

export default minCParser;
