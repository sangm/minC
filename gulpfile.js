require('babel/register');
var gulp = require('gulp');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

gulp.task('parser', function() {
    return gulp.src('minCParser/src/*.js')
               .pipe(babel()).on('error', function(e) { 
                   gutil.log(e); 
                   this.end();
               })
               .pipe(uglify())
               .pipe(gulp.dest('minCParser/dist'));
});
gulp.task('parserTest', ['parser'], function() {
    return gulp.src('minCParser/test/*.js')
               .pipe(babel())
               .pipe(mocha({reporter: 'spec'}, function(e) {
                   gutil.log(e);
                   this.end();
               }));
});
gulp.task('lexerTest', function() {
    return gulp.src('minCLexer/test/*.js')
               .pipe(mocha({reporter: 'spec'}, function(e) {
                   gutil.log(e);
                   this.end();
               }))
});

gulp.task('test', ['parserTest', 'lexerTest']);

gulp.task('watch', function() {
    gulp.watch(['minCParser/**/*.js', 'minCParser/**/*.jison'], ['parserTest']);
    gulp.watch(['minCLexer/**/*.js'], ['lexerTest']);
});

gulp.task('default', ['parser']);
