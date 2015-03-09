'use strict';

import {Parser} from 'jison'
import grammar from '../../grammar.js'

// a grammar in JSON
grammar = {
    "lex": {
        "rules": [
           ["\\s+", "/* skip whitespace */"],
           ["[a-f0-9]+", "return 'HEX';"]
        ]
    },

    "bnf": {
        "hex_strings" :[ "hex_strings HEX",
                         "HEX" ]
    }
};

// `grammar` can also be a string that uses jison's grammar format
var parser = new Parser(grammar);

export default new Parser(grammar);
