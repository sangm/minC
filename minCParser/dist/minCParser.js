"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var fs = _interopRequire(require("fs"));

var Parser = require("jison").Parser;

var ParserConstants = _interopRequire(require("./ParserConstants"));

var appRoot = _interopRequire(require("app-root-path"));

var minCLexer = _interopRequire(require("../../minCLexer/minCLexer"));

var Node = require("./tree").Node;

var Table = _interopRequire(require("./symbol-table"));

// `grammar` can also be a string that uses jison's grammar format
var bnf = fs.readFileSync(__dirname + "/../src/minCParser.jison", "utf8");
var minCParser = new Parser(bnf);
minCParser.lexer = minCLexer;

module.exports = minCParser;