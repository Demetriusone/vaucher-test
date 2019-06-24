var syntax        = 'sass'; // Syntax: sass or scss;

var gulp          	  = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		browserSync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require("gulp-notify"),
		nunjucksRender = require('gulp-nunjucks-render'),
		rsync         = require('gulp-rsync'),
		babel =   require("gulp-babel"),
		pug = require('gulp-pug'),
		plumber       = require('gulp-plumber');



gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'build'
		},
		notify: false,
	})
});
gulp.task('styles', function() {
	return gulp.src('app/'+syntax+'/**/*.'+syntax+'')
	.pipe(plumber({
    errorHandler: notify.onError(err => ({
        title: 'ERROR SASS Сompilation',
        message: err.message
    }))
}))
	.pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
    .pipe(gulp.dest('build/css')) // Выгружаем результата в папку app/css
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('build/css'))
	.pipe(browserSync.stream())
});
gulp.task('nunjucks', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('app/pages/**/*.+(html|nunjucks)')
  // Renders template with nunjucks
  .pipe(nunjucksRender({
      path: ['app/templates']
    }))
  // output files in app folder
  .pipe(gulp.dest('app'))
  .pipe(gulp.dest('build'))
});

gulp.task('js', function() {
	return gulp.src([
		'app/js/common.js', // Always at the end
		])
	.pipe(babel())
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('build/js'))
	.pipe(browserSync.reload({ stream: true }))
});
gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});
gulp.task('watch', ['styles', 'js', 'browser-sync'], function() {
	gulp.watch('app/'+syntax+'/**/*.'+syntax+'', ['styles']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch(['app/pages/**/*.+(html|nunjucks)'],['nunjucks']);
	gulp.watch('app/*.html', browserSync.reload)
});
gulp.task('default', ['watch']);
