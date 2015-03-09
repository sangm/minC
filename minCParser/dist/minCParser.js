"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Parser = require("jison").Parser;

var grammar = _interopRequire(require("../../grammar.js"));

// a grammar in JSON
grammar = {
    lex: {
        rules: [["\\s+", "/* skip whitespace */"], ["[a-f0-9]+", "return 'HEX';"]]
    },

    bnf: {
        hex_strings: ["hex_strings HEX", "HEX"]
    }
};

// `grammar` can also be a string that uses jison's grammar format
var parser = new Parser(grammar);

module.exports = new Parser(grammar);