var assert = require('assert');
var minCLexer = require('../minCLexer.js');

describe('minimal C lexer', function() {
    describe('recognizes identifers', function() {
        it('must begin with an uppercase or lowercase letter', function() {
            minCLexer.setInput('abc Abc abc123 ABC123');
            assert.deepEqual({ID: 'abc'}, minCLexer.lex());
            assert.deepEqual({ID: 'Abc'}, minCLexer.lex());
            assert.deepEqual({ID: 'abc123'}, minCLexer.lex());
            assert.deepEqual({ID: 'ABC123'}, minCLexer.lex());
            assert.equal('EOF', minCLexer.lex()); // done scanning
        }),
        it('should skip whitespace', function() {
            minCLexer.setInput('    x');
            assert.deepEqual({ID: 'x'}, minCLexer.lex());   
        })
    }),
    describe('recognizes reserved words', function() {
        it('should return predefined values for reserved words', function() {
            var reserved = ['if', 'else', 'while', 'int', 'string',
                            'char', 'return', 'void'];
            // concate reserved into one long string
            var reservedWords = reserved.join('');
            minCLexer.setInput(reservedWords);
            assert.equal('KWD_IF', minCLexer.lex());
            assert.equal("KWD_ELSE", minCLexer.lex());
            assert.equal("KWD_WHILE", minCLexer.lex());
            assert.equal("KWD_INT", minCLexer.lex());
            assert.equal("KWD_STRING", minCLexer.lex());
            assert.equal("KWD_CHAR", minCLexer.lex());
            assert.equal("KWD_RETURN", minCLexer.lex());
            assert.equal("KWD_VOID", minCLexer.lex());
        })
    })
});
