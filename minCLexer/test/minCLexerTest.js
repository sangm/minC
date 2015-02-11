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
            assert.deepEqual({CHARCONST: "a"}, minCLexer.lex());
            assert.deepEqual({CHARCONST: "A"}, minCLexer.lex());
            assert.deepEqual({CHARCONST: "1"}, minCLexer.lex());
            assert.deepEqual({CHARCONST: "@"}, minCLexer.lex());
            /* assert.deepEqual({KWD_CHAR: "!"}, minCLexer.lex()); */
            /* assert.deepEqual({KWD_CHAR: "_"}, minCLexer.lex()); */
        }),
        it('handles unclosing quote', function() {
            minCLexer.setInput("'a");
            assert.equal("Unclosed quote on character (1,1)", minCLexer.lex());
        })
    }),
    describe('recognizes reserved words', function() {
        it('should return predefined values for reserved words', function() {
            var reserved = ['if', 'else', 'while', 'int', 'string',
                            'char', 'return', 'void'];
            // concate reserved into one long string
            var reservedWords = reserved.join('');
            minCLexer.setInput(reservedWords);
            assert.deepEqual({KWD_IF: 'if'}, minCLexer.lex());
            assert.deepEqual({KWD_ELSE: 'else'}, minCLexer.lex());
            assert.deepEqual({KWD_WHILE: 'while'}, minCLexer.lex());
            assert.deepEqual({KWD_INT: 'int'}, minCLexer.lex());
            assert.deepEqual({KWD_STRING: 'string'}, minCLexer.lex());
            assert.deepEqual({KWD_CHAR: 'char'}, minCLexer.lex());
            assert.deepEqual({KWD_RETURN: 'return'}, minCLexer.lex());
            assert.deepEqual({KWD_VOID: 'void'}, minCLexer.lex());
        })
    }),
    describe('recognizes string constants', function() {
        it('should get values within quotes', function() {
            minCLexer.setInput('"abcabc"');
            assert.deepEqual({STRCONST: "abcabc"}, minCLexer.lex());
        }),
        it('should handle tab character', function() {
            minCLexer.setInput('"abc\tabc"');
            assert.deepEqual({STRCONST: "abc\tabc"}, minCLexer.lex());
        }),
        it('should handle escaped quote', function() {
            minCLexer.setInput('"abc\\"def"');
            assert.deepEqual({STRCONST: "abc\"def"}, minCLexer.lex());
        })
        it('should handle escape characters', function() {
            minCLexer.setInput('"abc\n123"');
            assert.deepEqual({STRCONST: "abc\n123"}, minCLexer.lex());
        }),
        it('should detect unterminated string', function() {
            minCLexer.setInput('"abc\\"');
            assert.equal('Unterminated string (1,1)', minCLexer.lex());
        })
    })
    describe('recognizes operators and special symbols', function() {
        it('should return predefined values for reserved operators', function() {
            var reserved = ['+', '-', '*', '/', '<', '>', '<=', '>=',
            '==', '!=', '=', '[', ']', '{', '}', '(', ')', ',', ';'];
            var reservedSymbols = reserved.join('');
            minCLexer.setInput(reservedSymbols);
            /* operators */
            assert.deepEqual({OPER_ADD:  '+'}, minCLexer.lex());
            assert.deepEqual({OPER_SUB:  '-'}, minCLexer.lex());
            assert.deepEqual({OPER_MUL:  '*'}, minCLexer.lex());
            assert.deepEqual({OPER_DIV:  '/'}, minCLexer.lex());
            assert.deepEqual({OPER_LT:   '<'}, minCLexer.lex());
            assert.deepEqual({OPER_GT:   '>'}, minCLexer.lex());
            assert.deepEqual({OPER_LTE: '<='}, minCLexer.lex());
            assert.deepEqual({OPER_GTE: '>='}, minCLexer.lex());
            assert.deepEqual({OPER_EQ:  '=='}, minCLexer.lex());
            assert.deepEqual({OPER_NEQ: '!='}, minCLexer.lex());
            assert.deepEqual({OPER_ASGN: '='}, minCLexer.lex());
            
            /* brackets & parens */
            assert.deepEqual({LSQ_BRKT: '['}, minCLexer.lex());
            assert.deepEqual({RSQ_BRKT: ']'}, minCLexer.lex());
            assert.deepEqual({LCRLY_BRKT: '{'}, minCLexer.lex());
            assert.deepEqual({RCRLY_BRKT: '}'}, minCLexer.lex());
            assert.deepEqual({LPAREN: '('}, minCLexer.lex());
            assert.deepEqual({RPAREN: ')'}, minCLexer.lex());

            /* punctuation */
            assert.deepEqual({COMMA: ','}, minCLexer.lex());
            assert.deepEqual({SEMICLN: ';'}, minCLexer.lex());
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
            assert.equal("Unterminated comment (1,31)", minCLexer.lex());
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
