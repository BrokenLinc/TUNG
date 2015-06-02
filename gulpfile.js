var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var less = require('gulp-less');
var livereload = require('gulp-livereload');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
 
gulp.task('less', function () {
	return gulp.src('./dev/less/*.less')
		.pipe(plumber())
		.pipe(less())
		.pipe(autoprefixer("last 1 version", "> 0.5%"))
		.pipe(gulp.dest('./dev/css'));
});
 
gulp.task('watch', function () {
	gulp.watch('./dev/less/**/*.less', ['less']);
 
	//refresh only files that change
	return gulp.src('./dev/css/**/*.css')
		.pipe(watch('./dev/css/**/*.css'))
		.pipe(livereload({ start: true }));
});
 
gulp.task('default', ['less', 'watch']);