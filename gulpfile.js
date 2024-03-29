var gulp = require('gulp');
var pug = require('gulp-pug');
var less = require('gulp-less');
var minifyCSS = require('gulp-csso');

gulp.task('html', function(){
    return gulp.src('client/templates/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('build/html'))
});

gulp.task('css', function(){
    return gulp.src('client/templates/*.less')
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(gulp.dest('build/css'))
});

gulp.task('watch', function(){
    gulp.watch("client/templates/*.less", ['css']);
    gulp.watch("*.html", ['html']);
});

gulp.task('default', [ 'html', 'css' ]);

gulp.task('dummy', [ 'html', 'default' ], function(){

});