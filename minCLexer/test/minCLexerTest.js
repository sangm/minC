var assert = require('assert');
var minCLexer = require('../minCLexer.js');

describe('minimal C lexer', function() {
    describe('recognizes identifers', function() {
        it('must begin with an uppercase or lowercase letter', function() {
            minCLexer.setInput('abc Abc abc123 ABC123');
            assert.deepEqual(minCLexer.lex(), {ID: 'abc'});
            assert.deepEqual(minCLexer.lex(), {ID: 'Abc'});
            assert.deepEqual(minCLexer.lex(), {ID: 'abc123'});
            assert.deepEqual(minCLexer.lex(), {ID: 'ABC123'});
        })
    }),
    describe('recognizes integer constants', function() {
        it('should not allow leading zeros', function() {
            minCLexer.setInput('0900 100 20000 30000 10000');
            assert.equal(minCLexer.lex(), 'Minimal C does not allow leading 0s (1,4)');
            assert.deepEqual(minCLexer.lex(), {INTCONST: 100});
            assert.deepEqual(minCLexer.lex(), {INTCONST: 20000});
            assert.deepEqual(minCLexer.lex(), {INTCONST: 30000});
            assert.deepEqual(minCLexer.lex(), {INTCONST: 10000});
        }),
        it('should allow 0 as an integer', function() {
            minCLexer.setInput('0');
            assert.deepEqual(minCLexer.lex(), {INTCONST: 0});
        }),
        it('should allow single numbers', function() {
            minCLexer.setInput('1 2 3 4 5 6 7');
            assert.deepEqual(minCLexer.lex(), {INTCONST: 1});
            assert.deepEqual(minCLexer.lex(), {INTCONST: 2});
            assert.deepEqual(minCLexer.lex(), {INTCONST: 3});
            assert.deepEqual(minCLexer.lex(), {INTCONST: 4});
            assert.deepEqual(minCLexer.lex(), {INTCONST: 5});
            assert.deepEqual(minCLexer.lex(), {INTCONST: 6});
            assert.deepEqual(minCLexer.lex(), {INTCONST: 7});

        })
    }),
    describe('recognizes character constants', function() {
        it('captures the value within the quotes', function() {
            minCLexer.setInput("'a' 'A' '1' '@' '!' '_'");
            assert.deepEqual(minCLexer.lex(), {CHARCONST: "a"});
            assert.deepEqual(minCLexer.lex(), {CHARCONST: "A"});
            assert.deepEqual(minCLexer.lex(), {CHARCONST: "1"});
            assert.deepEqual(minCLexer.lex(), {CHARCONST: "@"});
            /* assert.deepEqual(minCLexer.lex(), {KWD_CHAR: "!"}); */
            /* assert.deepEqual(minCLexer.lex(), {KWD_CHAR: "_"}); */
        }),
        it('should be invalid character if the string is longer than 1', function() {
            minCLexer.setInput("'ab'");
            assert.equal('Unclosed quote on character (1,4)', minCLexer.lex());
        }),
        it('handles unclosing quote', function() {
            minCLexer.setInput("'a");
            assert.equal("Unclosed quote on character (1,1)", minCLexer.lex());
        }),
        it('handles escaped characters', function() {
            minCLexer.setInput("'\t' '\\\\' '\"' '\n'");
            assert.deepEqual(minCLexer.lex(), {CHARCONST: '\t'});
            assert.deepEqual(minCLexer.lex(), {CHARCONST: '\\'});
            assert.deepEqual(minCLexer.lex(), {CHARCONST: '\"'});
            assert.deepEqual(minCLexer.lex(), {CHARCONST: '\n'});
        })
    }),
    describe('recognizes reserved words', function() {
        it('should return predefined values for reserved words', function() {
            var reserved = ['if', 'else', 'while', 'int', 'string',
                            'char', 'return', 'void'];
            // concate reserved into one long string
            var reservedWords = reserved.join(' ');
            minCLexer.setInput(reservedWords);
            assert.deepEqual(minCLexer.lex(), {KWD_IF: 'if'});
            assert.deepEqual(minCLexer.lex(), {KWD_ELSE: 'else'});
            assert.deepEqual(minCLexer.lex(), {KWD_WHILE: 'while'});
            assert.deepEqual(minCLexer.lex(), {KWD_INT: 'int'});
            assert.deepEqual(minCLexer.lex(), {KWD_STRING: 'string'});
            assert.deepEqual(minCLexer.lex(), {KWD_CHAR: 'char'});
            assert.deepEqual(minCLexer.lex(), {KWD_RETURN: 'return'});
            assert.deepEqual(minCLexer.lex(), {KWD_VOID: 'void'});
        })
    }),
    describe('recognizes string constants', function() {
        it('should get values within quotes', function() {
            minCLexer.setInput('"abcabc"');
            assert.deepEqual(minCLexer.lex(), {STRCONST: "abcabc"});
        }),
        it('should handle tab character', function() {
            minCLexer.setInput('"abc\tabc"');
            assert.deepEqual(minCLexer.lex(), {STRCONST: "abc\tabc"});
        }),
        it('should handle escaped quote', function() {
            minCLexer.setInput('"abc\\"def"');
            assert.deepEqual(minCLexer.lex(), {STRCONST: "abc\"def"});
        })
        it('should handle escape characters', function() {
            minCLexer.setInput('"abc\n123"');
            assert.deepEqual(minCLexer.lex(), {STRCONST: "abc\n123"});
        }),
        it('should detect unterminated string', function() {
            minCLexer.setInput('"abc\\"');
            assert.equal('Unterminated string (1,1)', minCLexer.lex());
        }),
        it('should match the longest string', function() {
            minCLexer.setInput("integer");
            assert.deepEqual({ID: "integer"}, minCLexer.lex());
        }),
        it('should store escape characters correctly', function() {
            minCLexer.setInput("\"abc\n123\"");
            assert.equal(minCLexer.lex().STRCONST.length, 7);
        }),
        it('should disregard rest of the string', function() {
            minCLexer.setInput('"123');
            assert.equal(minCLexer.lex(), "Unterminated string (1,1)");
            assert.equal(minCLexer.lex(), 1);
        })
    })
    describe('recognizes operators and special symbols', function() {
        it('should return predefined values for reserved operators', function() {
            var reserved = ['+', '-', '*', '/', '<', '>', '<=', '>=',
            '==', '!=', '=', '[', ']', '{', '}', '(', ')', ',', ';'];
            var reservedSymbols = reserved.join(' ');
            minCLexer.setInput(reservedSymbols);
            /* operators */
            assert.deepEqual(minCLexer.lex(), {OPER_ADD:  '+'});
            assert.deepEqual(minCLexer.lex(), {OPER_SUB:  '-'});
            assert.deepEqual(minCLexer.lex(), {OPER_MUL:  '*'});
            assert.deepEqual(minCLexer.lex(), {OPER_DIV:  '/'});
            assert.deepEqual(minCLexer.lex(), {OPER_LT:   '<'});
            assert.deepEqual(minCLexer.lex(), {OPER_GT:   '>'});
            assert.deepEqual(minCLexer.lex(), {OPER_LTE: '<='});
            assert.deepEqual(minCLexer.lex(), {OPER_GTE: '>='});
            assert.deepEqual(minCLexer.lex(), {OPER_EQ:  '=='});
            assert.deepEqual(minCLexer.lex(), {OPER_NEQ: '!='});
            assert.deepEqual(minCLexer.lex(), {OPER_ASGN: '='});
            
            /* brackets & parens */
            assert.deepEqual(minCLexer.lex(), {LSQ_BRKT: '['});
            assert.deepEqual(minCLexer.lex(), {RSQ_BRKT: ']'});
            assert.deepEqual(minCLexer.lex(), {LCRLY_BRKT: '{'});
            assert.deepEqual(minCLexer.lex(), {RCRLY_BRKT: '}'});
            assert.deepEqual(minCLexer.lex(), {LPAREN: '('});
            assert.deepEqual(minCLexer.lex(), {RPAREN: ')'});

            /* punctuation */
            assert.deepEqual(minCLexer.lex(), {COMMA: ','});
            assert.deepEqual(minCLexer.lex(), {SEMICLN: ';'});
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
        it('should handle the comment block even if tere are astericks within', function() {
            minCLexer.setInput("/* test comment" +
                               " * with astericks" +
                               " * closed properly" + 
                               "  **/");
            assert.equal(1, minCLexer.lex());
        }),
        it('should not mistake /* for divide, multiply', function() {
            minCLexer.setInput("/*");
            assert.equal("Unterminated comment (1,2)", minCLexer.lex());
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
