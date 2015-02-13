var fs = require('fs');
var path = require('path')
var assert = require('chai').assert;
var minCLexer = require('../minCLexer.js');

var inputPath = path.join(__dirname, '../', 'input_files', 'cs4318_5331_test_inputs', 'tokenizer', 'should_fail');

var combineTokens = function(lexer, string) {
    var tokens = [];
    lexer.setInput(string);
    var result = lexer.lex();
    while (result !== 1) {
        tokens.push(result);
        result = lexer.lex();
    }
    return tokens;
};

function readFile(file, callback) {
    fs.readFile(path.join(inputPath, file), function(err, data) {
        var result = combineTokens(minCLexer, data.toString());
        callback(result);
    })
}

describe('minC lexer working with files', function() {
    describe('makes sure minCLexer works with input files gathered from repository', function() {
        it('should ignore all the contents of this file', function() {
            readFile('comment.mC', function(tokens) {
                assert.include(tokens[0], 'Unterminated comment', 'comment.mC should have unterminated comment');
            })
        }),
        it('should get separate tokens regardless of whitespace', function() {
            readFile('idtest.mC', function(tokens) {
                assert.deepEqual({INTCONST: 1}, tokens[0]);
                assert.deepEqual({ID: 'foo'}, tokens[1]);
                assert.deepEqual({ID: 'FOO2BAR'}, tokens[2]);
            })
        }),
        it('should report all illegal tokens', function() {
            readFile('illegal.mC', function(tokens) {
                assert.deepEqual({ILLEGAL_TOK: '@ (1,1)'}, tokens[0]);
                assert.deepEqual({ILLEGAL_TOK: '& (2,1)'}, tokens[1]);
            })
        }),
        it('should recognize multibyte char literals', function() {
            readFile('multibyte-char-literals.mc', function(tokens) {
                assert.deepEqual({CHARCONST: ''}, tokens[0]);
                assert.deepEqual({CHARCONST: 'a'}, tokens[1]);
            })
        })
    })
})
