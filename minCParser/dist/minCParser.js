"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var fs = _interopRequire(require("fs"));

var Parser = require("jison").Parser;

var ParserConstants = _interopRequire(require("../ParserConstants"));

var Node = require("./tree").Node;

// `grammar` can also be a string that uses jison's grammar format
var bnf = fs.readFileSync(__dirname + "/../src/minCParser.jison", "utf8");
module.exports = new Parser(bnf);