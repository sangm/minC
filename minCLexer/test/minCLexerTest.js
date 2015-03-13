var assert = require('assert');
var minCLexer = require('../minCLexer.js');
var LexerConstants = require('../LexerConstants.js');

function getTokens(lexer) {
    var results = [];
    var result;
    var temp;
    while (true) {
        result = lexer.lex();
        if (result === 'EOF') 
            break;
        else if (result.toString && 
                 (result.toString().match('Minimal C') ||
                  result.toString().match('Unclosed')  ||
                  result.toString().match('Unterminated'))) {
            results.push(result);
        }
        else {
            temp = {}
            temp[result] = lexer.yytext
            results.push(temp);
        }
        
    }
    return results;
}

describe('minimal C lexer', function() {
    describe('recognizes identifers', function() {
        it('must begin with an uppercase or lowercase letter', function() {
            var lex = minCLexer.setInput('abc Abc abc123 ABC123');
            var tokens = getTokens(lex);
            assert.deepEqual(tokens[0], {ID: 'abc'});
            assert.deepEqual(tokens[1], {ID: 'Abc'});
            assert.deepEqual(tokens[2], {ID: 'abc123'});
            assert.deepEqual(tokens[3], {ID: 'ABC123'});
        })
    }),
    describe('recognizes integer constants', function() {
        it('should not allow leading zeros', function() {
            var lex = minCLexer.setInput('0900 100 20000 30000 10000');
            var tokens = getTokens(lex)
            assert.equal(tokens[0], 'Minimal C does not allow leading 0s (1,4)');
            assert.deepEqual(tokens[1], {INTCONST: 100});
            assert.deepEqual(tokens[2], {INTCONST: 20000});
            assert.deepEqual(tokens[3], {INTCONST: 30000});
            assert.deepEqual(tokens[4], {INTCONST: 10000});
        }),
        it('should allow 0 as an integer', function() {
            var lex = minCLexer.setInput('0');
            var tokens = getTokens(lex);
            assert.deepEqual(tokens[0], {INTCONST: 0});
        }),
        it('should allow single numbers', function() {
            var lex = minCLexer.setInput('1 2 3 4 5 6 7');
            var tokens = getTokens(lex);
            assert.deepEqual(tokens[0], {INTCONST: 1});
            assert.deepEqual(tokens[1], {INTCONST: 2});
            assert.deepEqual(tokens[2], {INTCONST: 3});
            assert.deepEqual(tokens[3], {INTCONST: 4});
            assert.deepEqual(tokens[4], {INTCONST: 5});
            assert.deepEqual(tokens[5], {INTCONST: 6});
            assert.deepEqual(tokens[6], {INTCONST: 7});

        })
    }),
    describe('recognizes character constants', function() {
        it('captures the value within the quotes', function() {
            var lex = minCLexer.setInput("'a' 'A' '1' '@' '!' '_'");
            var tokens = getTokens(lex);
            assert.deepEqual(tokens[0], {CHARCONST: "a"});
            assert.deepEqual(tokens[1], {CHARCONST: "A"});
            assert.deepEqual(tokens[2], {CHARCONST: "1"});
            assert.deepEqual(tokens[3], {CHARCONST: "@"});
            /* assert.deepEqual(minCLexer.lex(), {KWD_CHAR: "!"}); */
            /* assert.deepEqual(minCLexer.lex(), {KWD_CHAR: "_"}); */
        }),
        it('should be invalid character if the string is longer than 1', function() {
            var lex = minCLexer.setInput("'ab'");
            var tokens = getTokens(lex);
            assert.equal('Unclosed quote on character (1,4)', tokens[0]);
        }),
        it('handles unclosing quote', function() {
            var lex = minCLexer.setInput("'a");
            var tokens = getTokens(lex);
            assert.equal("Unclosed quote on character (1,1)", tokens[0]);
        }),
        it('handles escaped characters', function() {
            var lex = minCLexer.setInput("'\t' '\\\\' '\"' '\n'");
            var tokens = getTokens(lex);
            assert.deepEqual(tokens[0], {CHARCONST: '\t'});
            assert.deepEqual(tokens[1], {CHARCONST: '\\'});
            assert.deepEqual(tokens[2], {CHARCONST: '\"'});
            assert.deepEqual(tokens[3], {CHARCONST: '\n'});
        })
    }),
    describe('recognizes reserved words', function() {
        it('should return predefined values for reserved words', function() {
            var reserved = ['if', 'else', 'while', 'int', 'string',
                            'char', 'return', 'void'];
            // concate reserved into one long string
            var reservedWords = reserved.join(' ');
            var lex = minCLexer.setInput(reservedWords);
            var tokens = getTokens(lex);
            assert.deepEqual(tokens[0], {KWD_IF: 'if'});
            assert.deepEqual(tokens[1], {KWD_ELSE: 'else'});
            assert.deepEqual(tokens[2], {KWD_WHILE: 'while'});
            assert.deepEqual(tokens[3], {KWD_INT: 'int'});
            assert.deepEqual(tokens[4], {KWD_STRING: 'string'});
            assert.deepEqual(tokens[5], {KWD_CHAR: 'char'});
            assert.deepEqual(tokens[6], {KWD_RETURN: 'return'});
            assert.deepEqual(tokens[7], {KWD_VOID: 'void'});
        })
    }),
    describe('recognizes string constants', function() {
        it('should get values within quotes', function() {
            var lex = minCLexer.setInput('"abcabc"');
            var tokens = getTokens(lex);
            assert.deepEqual(tokens[0], {STRCONST: "abcabc"});
        }),
        it('should handle tab character', function() {
            var lex = minCLexer.setInput('"abc\tabc"');
            var tokens = getTokens(lex);
            assert.deepEqual(tokens[0], {STRCONST: "abc\tabc"});
        }),
        it('should handle escaped quote', function() {
            var lex = minCLexer.setInput('"abc\\"def"');
            var tokens = getTokens(lex);
            assert.deepEqual(tokens[0], {STRCONST: "abc\"def"});
        })
        it('should handle escape characters', function() {
            var lex = minCLexer.setInput('"abc\n123"');
            var tokens = getTokens(lex);
            assert.deepEqual(tokens[0], {STRCONST: "abc\n123"});
        }),
        it('should detect unterminated string', function() {
            var lex = minCLexer.setInput('"abc\\"');
            assert.equal('Unterminated string (1,6)', lex.lex());
        }),
        it('should match the longest string', function() {
            var lex = minCLexer.setInput("integer");
            var tokens = getTokens(lex);
            assert.deepEqual({ID: "integer"}, tokens[0]);
        }),
        it('should store escape characters correctly', function() {
            var lex = minCLexer.setInput('"\\"abc\n123"');
            var tokens = getTokens(lex);
            assert.equal(tokens[0].STRCONST.length, 8);
        }),
        it('should disregard rest of the string', function() {
            var lex = minCLexer.setInput('"123');
            assert.equal(lex.lex(), "Unterminated string (1,4)");
            assert.equal('EOF', lex.lex());
            lex = minCLexer.setInput('a = "12345123');
            var tokens = getTokens(lex);
            assert.equal("Unterminated string (1,13)", tokens[2])
        })
    })
    describe('recognizes operators and special symbols', function() {
        it('should return predefined values for reserved operators', function() {
            var reserved = ['+', '-', '*', '/', '<', '>', '<=', '>=',
            '==', '!=', '=', '[', ']', '{', '}', '(', ')', ',', ';'];
            var reservedSymbols = reserved.join(' ');
            var lex = minCLexer.setInput(reservedSymbols);
            var tokens = getTokens(lex);
            /* operators */
            assert.deepEqual(tokens[0], {OPER_ADD:  '+'});
            assert.deepEqual(tokens[1], {OPER_SUB:  '-'});
            assert.deepEqual(tokens[2], {OPER_MUL:  '*'});
            assert.deepEqual(tokens[3], {OPER_DIV:  '/'});
            assert.deepEqual(tokens[4], {OPER_LT:   '<'});
            assert.deepEqual(tokens[5], {OPER_GT:   '>'});
            assert.deepEqual(tokens[6], {OPER_LTE: '<='});
            assert.deepEqual(tokens[7], {OPER_GTE: '>='});
            assert.deepEqual(tokens[8], {OPER_EQ:  '=='});
            assert.deepEqual(tokens[9], {OPER_NEQ: '!='});
            assert.deepEqual(tokens[10], {OPER_ASGN: '='});
            
            /* brackets & parens */
            assert.deepEqual(tokens[11], {LSQ_BRKT: '['});
            assert.deepEqual(tokens[12], {RSQ_BRKT: ']'});
            assert.deepEqual(tokens[13], {LCRLY_BRKT: '{'});
            assert.deepEqual(tokens[14], {RCRLY_BRKT: '}'});
            assert.deepEqual(tokens[15], {LPAREN: '('});
            assert.deepEqual(tokens[16], {RPAREN: ')'});

            /* punctuation */
            assert.deepEqual(tokens[17], {COMMA: ','});
            assert.deepEqual(tokens[18], {SEMICLN: ';'});
        })
    }),
    describe('recognizes comment blocks', function() {
        it('should not generate tokens for comments', function() {
            /* 1 is the return value when lexing is complete */
            var lex = minCLexer.setInput("/* test comment block */");
            assert.equal('EOF', lex.lex());
        }),
        it('should generate error if comemnt block is not closed properly', function() {
            var lex = minCLexer.setInput("/* test comment block unclosed ");
            assert.equal("Unterminated comment (1,31)", lex.lex());
        }),
        it('should handle the comment block even if tere are astericks within', function() {
            var lex = minCLexer.setInput("/* test comment" +
                               " * with astericks" +
                               " * closed properly" + 
                               "  **/");
            var tokens = getTokens(lex);
            assert.equal(1, lex.lex());
        }),
        it('should not mistake /* for divide, multiply', function() {
            var lex = minCLexer.setInput("/*");
            assert.equal("Unterminated comment (1,2)", lex.lex());
        })
    }),
    describe('whitespace should be ignored', function() {
        it('should return 1 when given a string of empty spaces', function() {
            /* 1 is the return value when lexing is complete */
            var lex = minCLexer.setInput('              ');
            assert.equal('EOF', lex.lex());
        })
    })
});
