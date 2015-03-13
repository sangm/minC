require('babel/register');
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');
var concat = require('gulp-concat');
var nodeInspector = require('gulp-node-inspector');

gulp.task('parser', function(cb) {
    gulp.src('minCParser/src/*.js')
               .pipe(babel())
               .on('error', function(err) {
                   console.log(err.message);
               })
               .pipe(gulp.dest('minCParser/dist'));
    cb();
});
gulp.task('parserTest', ['parser'], function() {
    return gulp.src('minCParser/test/*Test.js')
               .pipe(babel())
               .pipe(mocha({ 
                   reporter: 'spec' 
               }))
               .on('error', function(err) {
                   console.trace(err);
               })
});
gulp.task('astTest', ['parser'], function () {
    var handleError = function(err) {
        console.log(err.stack);
    }
    return gulp.src('minCParser/test/astTest.js')
               .pipe(babel())
               .on('error', handleError)
               .pipe(mocha({ reporter: 'spec'}))
               .on('error', handleError)
});
gulp.task('lexerTest', function() {
    return gulp.src('minCLexer/test/*Test.js', {read: false})
               .pipe(mocha())
});

gulp.task('debug', function() {
    gulp.src('minCParser/src/minCParser.js')
        .pipe(nodeInspector());
})

gulp.task('watch', function() {
    gulp.watch(['minCParser/**/*.js', 'minCParser/**/*.jison'], ['parser', 'astTest']);
//    gulp.watch(['minCParser/**/*.js', 'minCParser/**/*.jison'], ['parser', 'parserTest']);
    gulp.watch(['minCLexer/**/*.js'], ['lexerTest']);
});

gulp.task('default', ['parser']);