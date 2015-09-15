'use strict';

var gulp				=	require('gulp'),
	gutil 				=	require('gulp-util'),
	filenames 		=	require("gulp-filenames"),
	dedupe 				=	require('gulp-dedupe'),
	concat				=	require('gulp-concat'),
	less		 			=	require('gulp-less'),
	replace				=	require('gulp-replace'),
	uglify				=	require('gulp-uglify'),
	minifyCss			=	require('gulp-minify-css'),
	livereload		=	require('gulp-livereload'),
	rimraf			 	=	require('rimraf'),
	http		 		 	=	require('http'),
	argv		 		 	=	require('yargs').argv,
	opn			 		 	=	require('opn'),
	clivereload	 	=	require('connect-livereload'),
	connect		   	=	require('connect'),
	modRewrite	 	=	require('connect-modrewrite'),
	serveStatic	 	=	require('serve-static'),
	serveIndex	 	=	require('serve-index'),
	jsonServer	 	=	require('json-server'),
	serverData	 	=	require('./server.json'),

	merge 				= require("merge-stream"),
	plumber 			= require("gulp-plumber"),
	htmlmin 			= require("gulp-htmlmin"),
	templateCache = require("gulp-angular-templatecache");


// check for the environment for serve
// and define the folder to serve.
var production = false,
	environment = './build',
	port = 9007,
	lrport = 35907,
	color = gutil.colors;

if( argv.production ) {
	environment = './build';
	production = true;
}

// Returns an Express server
var server = jsonServer.create();

// Set default middlewares (logger, static, cors and no-cache)
server.use(jsonServer.defaults);

// Returns an Express router
var router = jsonServer.router('server.json');
server.use(router);

server.listen(3007);


var CSS_DEPS = [
];

var JS_DEPS = [
	'bower_components/lodash/lodash.js',
	'bower_components/classy.js/src/classy.js',
	'bower_components/angular/angular.js'
];


gulp.task('clean', function (cb) {
	rimraf('build', cb);
});

gulp.task('vendor', ['clean'], function (cb) {
	gulp.src(JS_DEPS)
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest('./build/js'))
		.on('end', cb);
});

gulp.task('example', ['clean'], function() {
  gulp.src("./example/*.js")
    .pipe(gulp.dest("./build/js"));
});

gulp.task('scripts', ['clean'], function (cb) {
  gulp.src("./example/index.html")
    .pipe(gulp.dest("./build/"));

	var js = gulp.src([
		'src/js/**/*.js',

		'src/*.js',
		'src/config/**/*.js',
		'src/helpers/**/*.js',
		'src/services/**/*.js'
	]);

  var tpl = gulp.src("app/**/*.template.html")
    .pipe(plumber())
    .pipe(htmlmin())
    .pipe(templateCache({
      module: "angular.classy.rest.tpl",
      standalone: true
    }));

  merge(js, tpl)
    .pipe(concat("angular.classy.rest.js"))
    .pipe(gulp.dest("./build/js"))
		.on('end', cb);
});

gulp.task('connect', function () {
	if( production ) {
		gutil.log(color.red('Production environment'));
		var app = connect()
			.use(modRewrite([
        '!\\.\\w+$ /index.html [L]'
      ]))
			.use(serveStatic(environment))
			.use(serveIndex('./'));
	} else {
		gutil.log(color.red('Development environment'));
		var app = connect()
			.use(modRewrite([
        '!\\.\\w+$ /index.html [L]'
      ]))
			// .use(clivereload({ port: lrport }))
			.use(serveStatic(environment))
			.use(serveIndex('./'));
	}

	http.createServer(app)
		.listen(port)
		.on('listening', function() {
			gutil.log('Started connect web server on http://localhost:'+port+'.');
		});
});

gulp.task('serve', ['connect'], function () {
	// in production we don't use the livereload
	if( production ) {
		return;
	}

	var config = {port: lrport};

	livereload.listen(lrport);
	// opn('http://localhost:'+port);

	gulp.watch([
		'gulpfile.js',
		'*.html',
		'example/**/*',
		'src/**/*'
	], ['build']).on('change', function(e) {
		livereload.changed(e, lrport);
	}); 

	// gulp.watch('assets/styles/**/*.less', ['styles'])
	// 	.on('change', function(e) {
	// 		livereload.changed(e, lrport);
	// 	}); 
});

gulp.task('build', [
	'clean', 
	'example',
	// 'fonts', 
	// 'styles', 
	// 'images', 
	'vendor',
	'scripts'
]);

gulp.task('default', ['build', 'serve']);