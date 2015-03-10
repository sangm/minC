require('babel/register');
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');
var concat = require('gulp-concat');

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
gulp.task('lexerTest', function() {
    return gulp.src('minCLexer/test/*Test.js', {read: false})
               .pipe(mocha())
});

gulp.task('watch', function() {
    gulp.watch(['minCParser/**/*.js'], ['parser']);
    gulp.watch(['minCLexer/**/*.js'], ['lexerTest']);
});

gulp.task('default', ['parser']);
