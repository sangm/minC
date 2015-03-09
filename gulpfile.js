var gulp = require('gulp');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');

gulp.task('parser', function() {
    return gulp.src('minCParser/src/*.js')
               .pipe(babel())
               .on('error', function(err) {
                   console.log(err.message);
               })
               .pipe(gulp.dest('minCParser/dist'))
});
gulp.task('parserTest', function() {
    return gulp.src('minCParser/test/*Test.js')
               .pipe(mocha({reporter: 'nyan'}))
               .on('error', function(err) {
                   console.log(err.message);
               })
});
gulp.task('lexerTest', function() {
    return gulp.src('minCLexer/test/*Test.js', {read: false})
               .pipe(mocha())
});

gulp.task('watch', function() {
    gulp.watch(['minCParser/src/**/*.js'], ['parser', 'parserTest']);
    gulp.watch(['minCLexer/**/*.js', 'grammar.js'], ['lexerTest']);
});

gulp.task('default', ['parser']);
