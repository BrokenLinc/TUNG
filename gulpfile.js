var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var less = require('gulp-less');
var livereload = require('gulp-livereload');
var minifyCss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var watch = require('gulp-watch');
 
gulp.task('less', function () {
	return gulp.src('./src/less/*.less')
		.pipe(plumber())
		.pipe(less())
		.pipe(autoprefixer("last 1 version", "> 0.5%"))
		.pipe(gulp.dest('./src/css'));
});
 
gulp.task('watch', function () {
	gulp.watch('./src/less/**/*.less', ['less']);
 
	//refresh only files that change
	return gulp.src('./src/css/**/*.css')
		.pipe(watch('./src/css/**/*.css'))
		.pipe(livereload({ start: true }));
});

gulp.task('usemin', function () {
	return gulp.src('./src/index.html')
		.pipe(usemin({
	        inlinejs: [uglify()],
	        inlinecss: [minifyCss(), 'concat']
		}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('dist', ['less', 'usemin']);
gulp.task('default', ['less', 'watch']);