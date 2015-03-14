'use strict';

import fs from 'fs'
import {Parser} from 'jison'
import ParserConstants from './ParserConstants'
import appRoot from 'app-root-path'
import minCLexer from  '../../minCLexer/minCLexer'
import {Node} from './tree'


// `grammar` can also be a string that uses jison's grammar format
let bnf = fs.readFileSync(__dirname + "/../src/minCParser.jison", "utf8");
let minCParser = new Parser(bnf);
minCParser.lexer = minCLexer;

export default minCParser;
