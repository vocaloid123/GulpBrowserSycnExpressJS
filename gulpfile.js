var gulp = require('gulp');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var browserSync = require('browser-sync');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var minifycss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer')
var nodemon = require('gulp-nodemon');

// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 500;

browserSync.init({
  proxy: 'http://localhost:9001',
  port: 4000,
  open: true
});
// CSS task
var sassFunction = function () {
  gulp.src(['app/source/scss/config.scss'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(rename('style.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('app/dist/css/'))
    .pipe(browserSync.reload({stream:true}))
}

var scripts = function() {
  return gulp.src('./app/source/scripts/*.js')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(babel())
    .pipe(gulp.dest('./app/dist/js/'))
    .pipe(browserSync.reload({stream:true}))
}
var nodemon = function () {
    return gulp.task('nodemon', function (cb) {
    var called = false;
    return nodemon({
      script: 'app.js',
      watch: ['app.js']
    })
      .on('start', function onStart() {
        if (!called) { cb(); }
        called = true;
      })
      .on('restart', function onRestart() {
        setTimeout(function reload() {
          browserSync.reload({
            stream: false
          });
        }, BROWSER_SYNC_RELOAD_DELAY);
      });
  });
}

function watchFiles() {
  gulp.watch("./app/source/scss/*.scss", sassFunction);
  gulp.watch("./app/*.html").on('change', browserSync.reload);
  gulp.watch("./app/source/scripts/*.js",scripts);
}

const watch = gulp.parallel(watchFiles, browserSync);
exports.watch = watch;