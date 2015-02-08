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
        })
    }),
    describe('recognizes integer constants', function() {
        it('should not allow leading zeros', function() {
            minCLexer.setInput('0900 100 20000 30000 10000');
            assert.equal('Minimal C does not allow leading 0s', minCLexer.lex());
            assert.deepEqual({INTCONST: 100}, minCLexer.lex());
            assert.deepEqual({INTCONST: 20000}, minCLexer.lex());
            assert.deepEqual({INTCONST: 30000}, minCLexer.lex());
            assert.deepEqual({INTCONST: 10000}, minCLexer.lex());
        }),
        it('should allow 0 as an integer', function() {
            minCLexer.setInput('0');
            assert.deepEqual({INTCONST: 0}, minCLexer.lex());
        }),
        it('should allow single numbers', function() {
            minCLexer.setInput('1 2 3 4 5 6 7');
            assert.deepEqual({INTCONST: 1}, minCLexer.lex());
            assert.deepEqual({INTCONST: 2}, minCLexer.lex());
            assert.deepEqual({INTCONST: 3}, minCLexer.lex());
            assert.deepEqual({INTCONST: 4}, minCLexer.lex());
            assert.deepEqual({INTCONST: 5}, minCLexer.lex());
            assert.deepEqual({INTCONST: 6}, minCLexer.lex());
            assert.deepEqual({INTCONST: 7}, minCLexer.lex());

        })
    }),
    describe('recognizes character constants', function() {
        it('captures the value within the quotes', function() {
            minCLexer.setInput("'a' 'A' '1' '@' '!' '_'");
            assert.deepEqual({KWD_CHAR: "a"}, minCLexer.lex());
            assert.deepEqual({KWD_CHAR: "A"}, minCLexer.lex());
            assert.deepEqual({KWD_CHAR: "1"}, minCLexer.lex());
            assert.deepEqual({KWD_CHAR: "@"}, minCLexer.lex());
            /* assert.deepEqual({KWD_CHAR: "!"}, minCLexer.lex()); */
            /* assert.deepEqual({KWD_CHAR: "_"}, minCLexer.lex()); */
        }),
        it('handles unclosing quote', function() {
            minCLexer.setInput("'a");
            assert.equal("Unclosed quote on character Line: 1 Column: 1", minCLexer.lex());
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
    }),
    describe('recognizes operators and special symbols', function() {
        it('should return predefined values for reserved operators', function() {
            var reserved = ['+', '-', '*', '/', '<', '>', '<=', '>=',
            '==', '!=', '=', '[', ']', '{', '}', '(', ')', ',', ';'];
            var reservedSymbols = reserved.join('');
            minCLexer.setInput(reservedSymbols);
            /* operators */
            assert.equal("OPER_ADD", minCLexer.lex());
            assert.equal("OPER_SUB", minCLexer.lex());
            assert.equal("OPER_MUL", minCLexer.lex());
            assert.equal("OPER_DIV", minCLexer.lex());
            assert.equal("OPER_LT", minCLexer.lex());
            assert.equal("OPER_GT", minCLexer.lex());
            assert.equal("OPER_LTE", minCLexer.lex());
            assert.equal("OPER_GTE", minCLexer.lex());
            assert.equal("OPER_EQ", minCLexer.lex());
            assert.equal("OPER_NEQ", minCLexer.lex());
            assert.equal("OPER_ASGN", minCLexer.lex());
            
            /* brackets & parens */
            assert.equal("LSQ_BRKT", minCLexer.lex());
            assert.equal("RSQ_BRKT", minCLexer.lex());
            assert.equal("LCRLY_BRKT", minCLexer.lex());
            assert.equal("RCRLY_BRKT", minCLexer.lex());
            assert.equal("LPAREN", minCLexer.lex());
            assert.equal("RPAREN", minCLexer.lex());

            /* punctuation */
            assert.equal("COMMA", minCLexer.lex());
            assert.equal("SEMICLN", minCLexer.lex());
        })
    }),
    describe('recognizes comment blocks', function() {
        it('should not generate tokens for comments', function() {
            /* 1 is the return value when lexing is complete */
            minCLexer.setInput("/* test comment block */");
            assert.equal(1, minCLexer.lex());
        }),
        it('should generate error if comemnt block is not closed properly', function() {
            minCLexer.setInput("/* test comment block unclosed ");
            assert.equal("Unterminated comment Line: 1 Column: 31", minCLexer.lex());
        }),
        it('should handle the comment block even if there are astericks within', function() {
            minCLexer.setInput("/* test comment" +
                               " * with astericks" +
                               " * closed properly" + 
                               "  **/");
            assert.equal(1, minCLexer.lex());
                
        })
    }),
    describe('whitespace should be ignored', function() {
        it('should return 1 when given a string of empty spaces', function() {
            /* 1 is the return value when lexing is complete */
            minCLexer.setInput('              ');
            assert.equal(1, minCLexer.lex());
        })
    })
});
