var gulp = require('gulp');
var rename = require('gulp-rename');
var cache = require('gulp-cache');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-csso');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var notify = require("gulp-notify");
var zip = require('gulp-zip');
var standard = require('gulp-standard');

notify.logLevel(0); // Supress console output

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});

var bsreload = function() {
    browserSync.reload();
};

gulp.task('standardjs', function(){
  return gulp.src(['dev/scripts/*.js'])
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
});

gulp.task('javascript', function(){
    return gulp.src('dev/scripts/*.js')
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('scripts'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(notify({ title: "Javascript", message: "Javascript pre-processing completed.", onLast: true }))
});

gulp.task('css', function(){
    return gulp.src('dev/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('css'))
        .pipe(minifyCSS())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(notify({ title: "CSS", message: "CSS pre-processing completed.", onLast: true }))
});

gulp.task('images', function(){
    gulp.src('dev/images/*.*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('images/'))
        .pipe(notify({ title: "Images", message: "Image optimization completed.", onLast: true }))
});

gulp.task('zip', function() {
    gulp.src(['css/*', 'scripts/*', 'images/*', '*.html'], {base:'./'})
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('./'))
        .pipe(notify({ title: "Zip", message: "Distribution archive created.", onLast: true }))
    require('child_process').exec('start "" ""');
});

gulp.task('default', ['browser-sync', 'watch']);

gulp.task('watch', function() {
    gulp.watch("dev/scss/*.scss", ['css']);
    gulp.watch("dev/scripts/*.js", ['javascript']);
    gulp.watch("dev/images/*.*", ['images']);
    gulp.watch("*.html", [bsreload]);
});
