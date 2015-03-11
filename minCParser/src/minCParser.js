'use strict';

import fs from 'fs'
import {Parser} from 'jison'
import ParserConstants from '../ParserConstants'
import {Node} from './tree'

// `grammar` can also be a string that uses jison's grammar format
let bnf = fs.readFileSync(__dirname + "/../src/minCParser.jison", "utf8");
export default new Parser(bnf);
