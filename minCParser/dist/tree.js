"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

require("babel/register");

var colors = _interopRequire(require("colors/safe"));

var blue = colors.blue;
var red = colors.red;

function getLine(node) {
    var green = colors.green;
    if (node.terminal) node = node.terminal;
    return green("(" + node.loc.first_line + "," + node.loc.first_column + ")");
}

var TerminalNode = function TerminalNode(type, data, loc) {
    _classCallCheck(this, TerminalNode);

    if (type == null) {
        type = "needs to be defined in parserConstants";
    }
    this.terminal = { type: type, data: data, loc: loc };
};

var NonterminalNode = (function () {
    function NonterminalNode(type, children, loc) {
        _classCallCheck(this, NonterminalNode);

        if (type == null) {
            type = "needs to be defined in parserConstants";
        }
        this.children = children || [];
        if (this.children.constructor !== Array) this.children = [this.children];
        this.type = type;
    }

    _createClass(NonterminalNode, {
        addChild: {
            value: function addChild(child) {
                this.children.push(child);
            }
        },
        getChildren: {
            value: function getChildren() {
                return this.children;
            }
        }
    });

    return NonterminalNode;
})();

function print(ast) {
    var level = arguments[1] === undefined ? 0 : arguments[1];

    var string = blue("• ").repeat(level);
    if (ast.terminal) {
        console.log(string + ast.terminal.type, ast.terminal.data + " " + getLine(ast));
    } else {
        console.log(string + ast.type);
        var children = ast.getChildren();
        children.forEach(function (child) {
            print(child, level + 1);
        });
    }
}

/*
   printNode(level = 0) {
   let treeString = '\t'.repeat(level) + this._data;
   if (this._children.length === 0) return treeString;
   this._children.map(child => {
   treeString += '\n' + child.printNode(level+1);
   });
   return treeString;
 */

exports.TerminalNode = TerminalNode;
exports.NonterminalNode = NonterminalNode;
exports.print = print;
Object.defineProperty(exports, "__esModule", {
    value: true
});