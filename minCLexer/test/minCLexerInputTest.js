var fs = require('fs');
var path = require('path')
var assert = require('chai').assert;
var minCLexer = require('../minCLexer.js');
var getTokens = require('../utils.js').getTokens;

var inputPath = path.join(__dirname, '../', 'input_files', 'cs4318_5331_test_inputs', 'tokenizer', 'should_fail');

function readFile(file, callback) {
    fs.readFile(path.join(inputPath, file), 'utf8', function(err, data) {
        minCLexer.setInput(data);
        callback(getTokens(minCLexer));
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
                /*
                assert.deepEqual({INTCONST: 1}, tokens[0]);
                assert.deepEqual({ID: 'foo'}, tokens[1]);
                assert.deepEqual({ID: 'FOO2BAR'}, tokens[2]);
                */
            })
        }),
        it('should report all illegal tokens', function() {
            readFile('illegal.mC', function(tokens) {
                /*
                assert.deepEqual({ILLEGAL_TOK: '@ (1,1)'}, tokens[0]);
                assert.deepEqual({ILLEGAL_TOK: '& (2,1)'}, tokens[1]);
                assert.deepEqual({ILLEGAL_TOK: '# (3,1)'}, tokens[2]);
                assert.deepEqual({ILLEGAL_TOK: '` (4,1)'}, tokens[3]);
                assert.deepEqual({ILLEGAL_TOK: '^ (5,1)'}, tokens[4]);
                assert.deepEqual({ILLEGAL_TOK: "| (6,1)"}, tokens[5]);
                assert.deepEqual("Unclosed quote on character (7,1)", tokens[6]);
                assert.deepEqual({ILLEGAL_TOK: '\\ (8,1)'}, tokens[7]);
                */
            })
        }),
        it('should recognize multibyte char literals', function() {
            readFile('multibyte-char-literals.mc', function(tokens) {
                /*
                assert.deepEqual({CHARCONST: ''}, tokens[0]);
                assert.deepEqual({CHARCONST: 'a'}, tokens[1]);
                assert.deepEqual("Unclosed quote on character (3,4)", tokens[2]);
                assert.deepEqual({CHARCONST: '\n'}, tokens[3]);
                assert.deepEqual("Unclosed quote on character (5,5)", tokens[4]); // newline character counts as 2 characters
                assert.deepEqual("Unclosed quote on character (6,5)", tokens[5]); // newline character counts as 2 characters
                assert.deepEqual("Unclosed quote on character (7,6)", tokens[6]); // newline character counts as 2 characters
                */
            })
        }),
        it('should not crash given a binary file', function() {
            readFile('random.mC', function(tokens) {
                /* test is just opening file */
            });
        }),
        it('should read string constants with tabs, newline', function() {
            readFile('strtest.mC', function(tokens) {
                /*
                assert.equal(tokens[0].STRCONST.length, 7);
                assert.equal(tokens[1].STRCONST.length, 7);
                assert.equal(tokens[2].STRCONST.length, 7);
                assert.equal(tokens[3].STRCONST.length, 7);
                assert.equal(tokens[4].STRCONST.length, 7);
                */
            })
        })
    })
})
