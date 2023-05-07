// const gulp = require('gulp');
// const sass = require('gulp-sass')(require('sass'));
// const browserSync = require('browser-sync').create();
// var useref = require('gulp-useref');
// var uglify = require('gulp-uglify');
// var gulpIf = require('gulp-if');
// var cssnano = require('gulp-cssnano');
// var runSequence = require('run-sequence');
// gulp.task('sass', function() {
//     return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
//         .pipe(sass())
//         .pipe(gulp.dest('app/css'))
//         .pipe(browserSync.reload({
//             stream: true
//         }))
// })

// gulp.task('browserSync', function() {
//     browserSync.init({
//         server: {
//             baseDir: 'app'
//         },
//     })
// })

// gulp.task('watch', gulp.series('browserSync', 'sass'), function() {
//     gulp.watch('app/scss/**/*.scss', gulp.series('sass'));
//     // Other watchers
//     gulp.watch('app/*.html', browserSync.reload);
//     gulp.watch('app/js/**/*.js', browserSync.reload);
// })

// gulp.task('useref', function() {
//     return gulp.src('app/*.html')
//         .pipe(useref())
//         .pipe(gulpIf('*.js', uglify()))
//         // Minifies only if it's a CSS file
//         .pipe(gulpIf('*.css', cssnano()))
//         .pipe(gulp.dest('dist'))
// });

const gulp = require("gulp");
const { parallel, series } = require("gulp");
const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create(); //https://browsersync.io/docs/gulp#page-top
const nunjucksRender = require("gulp-nunjucks-render");
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");

// /*
// TOP LEVEL FUNCTIONS
//     gulp.task = Define tasks
//     gulp.src = Point to files to use
//     gulp.dest = Points to the folder to output
//     gulp.watch = Watch files and folders for changes
// */

// Optimise Images
function imageMin(cb) {
  gulp
    .src("app/images/*/*/*/*")
    .pipe(imagemin())
    .pipe(gulp.dest("dist/images"));
  cb();
}

// Copy all HTML files to Dist
function copyHTML(cb) {
  gulp.src("app/*.html").pipe(gulp.dest("dist"));
  cb();
}

// Minify HTML
function minifyHTML(cb) {
  gulp
    .src("app/*.html")
    .pipe(gulp.dest("dist"))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("dist"));
  cb();
}

// Scripts
function js(cb) {
  gulp
    .src("app/js/**/*.js")
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(concat("main.js"))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js"));
  cb();
}

// Compile Sass
function css(cb) {
  gulp
    .src("app/scss/**/*.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(
      autoprefixer({
        browserlist: ["last 2 versions"],
        cascade: false,
      })
    )
    .pipe(gulp.dest("dist/css"))
    // Stream changes to all browsers
    .pipe(browserSync.stream());
  cb();
}

// Process Nunjucks
function nunjucks(cb) {
  gulp
    .src("app/pages/*.html")
    .pipe(
      nunjucksRender({
        path: ["app/templates/"], // String or Array
      })
    )
    .pipe(gulp.dest("dist"));
  cb();
}

function nunjucksMinify(cb) {
  gulp
    .src("app/pages/*.html")
    .pipe(
      nunjucksRender({
        path: ["app/templates/"], // String or Array
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("dist"));
  cb();
}

// Watch Files
function watch_files() {
  browserSync.init({
    server: {
      baseDir: "dist/",
    },
  });
  gulp.watch("app/scss/**/*.scss", css);
  gulp.watch("app/js/**/*.js", js).on("change", browserSync.reload);
  gulp.watch("app/pages/*.html", nunjucks).on("change", browserSync.reload);
  gulp.watch("app/templates/*.html", nunjucks).on("change", browserSync.reload);
}

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(nunjucks, css, js, imageMin, watch_files);

// 'gulp build' will build all assets but not run on a local server.
exports.build = parallel(nunjucksMinify, css, js, imageMin);
