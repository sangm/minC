"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var SymbolTable = (function () {
    function SymbolTable(globalScope) {
        _classCallCheck(this, SymbolTable);

        this.table = {};
        this.scopes = [globalScope];
        this.temp = [];
    }

    _createClass(SymbolTable, {
        addTemp: {
            value: function addTemp(symbol, type, nodeType) {
                var temp = {};
                temp.symbol = symbol;
                temp.type = type;
                temp.nodeType = nodeType;
                this.temp.push(temp);
            }
        },
        addTemps: {
            value: function addTemps(scope) {
                var _this = this;

                this.temp.map(function (t) {
                    _this.insert(t.symbol, t.type, t.nodeType, scope);
                });
                this.temp = [];
            }
        },
        insert: {
            value: function insert(symbol, type, nodeType, scope) {
                scope = scope || this.scopes.slice(-1)[0];
                this.table[scope] = this.table[scope] || {};
                this.table[scope][symbol] = { type: type };
                if (nodeType) this.table[scope][symbol].nodeType = nodeType;
            }
        },
        getScope: {
            value: function getScope(scope) {
                if (this.table[scope] == null) {
                    console.warn("Scope " + scope + " does not exist");
                }
                return this.table[scope];
            }
        }
    });

    return SymbolTable;
})();

module.exports = SymbolTable;