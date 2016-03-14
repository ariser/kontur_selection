var gulp           = require('gulp'),
    runSequence    = require('run-sequence'),
    gulpFilter     = require('gulp-filter'),
    mainBowerFiles = require('main-bower-files'),
    rename         = require('gulp-rename'),
    plumber        = require('gulp-plumber'),
    del            = require('del'),
    useref         = require('gulp-useref'),
    rev            = require('gulp-rev'),
    revReplace     = require('gulp-rev-replace'),

    debug          = require('gulp-debug'),

    sass           = require('gulp-ruby-sass'),
    coffee         = require('gulp-coffee'),
    prefix         = require('gulp-autoprefixer'),
    sourcemaps     = require('gulp-sourcemaps'),
    cssnano        = require('gulp-cssnano'),
    uglifyJS       = require('gulp-uglify'),
    htmlmin        = require('gulp-htmlmin'),
    imageMin       = require('gulp-imagemin');

var config = {
	autoprefixer: {
		browsers: ['> 1%', 'last 2 versions', 'Android > 4', 'Explorer >= 8', 'Firefox ESR', 'Opera 12.1']
	},
	imageMin    : {
		progressive: true,
		interlaced : true
	},
	htmlmin     : {
		collapseWhitespace  : true,
		conservativeCollapse: true
	},
	uglifyJS    : {},
	paths       : {
		bower: 'bower_components',
		app  : {
			root   : 'app',
			views  : 'app/views',
			assets : 'app/assets',
			scripts: 'app/assets/scripts',
			styles : 'app/assets/styles',
			images : 'app/assets/images',
			fonts  : 'app/assets/fonts'
		},
		build: {
			root  : 'public',
			views : 'public',
			assets: 'public/assets',
			js    : 'public/assets/js',
			css   : 'public/assets/css',
			images: 'public/assets/img',
			fonts : 'public/assets/fonts'
		}
	}
};

gulp.task('bower', function () {

	var jsFilter = gulpFilter('**/*.js');
	var cssFilter = gulpFilter('**/*.css');
	var imageFilter = gulpFilter(['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif']);
	var fontFilter = gulpFilter(['**/*.otf', '**/*.eot', '**/*.svg', '**/*.ttf', '**/*.woff', '**/*.woff2']);

	var jsDir = config.paths.build.js + '/vendor';

	return gulp.src(mainBowerFiles())

		// JS
		.pipe(jsFilter)
		.pipe(gulp.dest(jsDir))
		.pipe(jsFilter.restore())

		// CSS
		.pipe(cssFilter)
		.pipe(gulp.dest(config.paths.build.css))
		.pipe(cssFilter.restore())

		// IMAGES
		.pipe(imageFilter)
		.pipe(imageMin(config.imageMin))
		.pipe(gulp.dest(config.paths.build.images))
		.pipe(imageFilter.restore())

		// FONTS
		.pipe(fontFilter)
		.pipe(gulp.dest(config.paths.build.fonts))
		.pipe(fontFilter.restore());
});

gulp.task('styles:clean', function (next) {
	del(config.paths.build.css + '/**', next);
});
gulp.task('styles', ['css', 'sass']);
gulp.task('sass', function () {
	return sass(config.paths.app.styles, {
		sourcemap: true,
		compass  : true
	})
		.pipe(prefix(config.autoprefixer))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(config.paths.build.css));
});
gulp.task('css', function () {
	return gulp.src([
			config.paths.app.styles + '/**/*.css',
			config.paths.app.styles + '/**/*.map'
		])
		.pipe(gulp.dest(config.paths.build.css));
});
gulp.task('styles:min', ['styles'], function () {
	return gulp.src([config.paths.build.css + '/**/*.css', '!' + config.paths.build.css + '/**/*.min.css'])
		.pipe(plumber())
		.pipe(cssnano())
		.pipe(gulp.dest(config.paths.build.css));
});

gulp.task('scripts:clean', function (next) {
	del(config.paths.build.js + '/**', next);
});
gulp.task('scripts', function () {

	var jsFilter = gulpFilter('**/*.js');
	var coffeeFilter = gulpFilter('**/*.coffee');

	return gulp.src(config.paths.app.scripts + '/**/*')

		// PROCESS VANILLA JS
		.pipe(jsFilter)
		.pipe(gulp.dest(config.paths.build.js))
		.pipe(jsFilter.restore())

		// PROCESS COFFEE SCRIPT
		.pipe(coffeeFilter)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(coffee())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(config.paths.build.js))
		.pipe(coffeeFilter.restore());
});
gulp.task('scripts:min', ['scripts'], function () {
	// selectivizr contains a js hook that causes complete erasing its content by uglifier
	// so we just don't uglify it
	var selectivizrFilter = gulpFilter('!**/selectivizr.js');

	return gulp.src([config.paths.build.js + '/**/*.js', '!' + config.paths.build.js + '/**/*.min.js'])
		.pipe(plumber())
		.pipe(selectivizrFilter)
		.pipe(uglifyJS(config.uglifyJS))
		.pipe(selectivizrFilter.restore())
		.pipe(gulp.dest(config.paths.build.js));
});

gulp.task('images:clean', function (next) {
	del(config.paths.build.images + '/**', next);
});
gulp.task('images', function () {
	return gulp.src(config.paths.app.images + '/**/*')
		.pipe(imageMin(config.imageMin))
		.pipe(gulp.dest(config.paths.build.images));
});

gulp.task('fonts:clean', function (next) {
	del(config.paths.build.fonts + '/**', next);
});
gulp.task('fonts', function () {
	return gulp.src(config.paths.app.fonts + '/**/*')
		.pipe(gulp.dest(config.paths.build.fonts));
});

gulp.task('views:clean', function (next) {
	del(config.paths.build.views + '/**', next);
});
gulp.task('views:dev', function () {
	return gulp.src(config.paths.app.views + '/**/*.html')
		.pipe(gulp.dest(config.paths.build.views));
});
gulp.task('views:production', function () {
	var assets = useref.assets({
		searchPath: config.paths.build.root
	});

	var jsFilter = gulpFilter('**/*.js');
	var cssFilter = gulpFilter('**/*.css');
	var htmlFilter = gulpFilter('**/*.html');

	return gulp.src(config.paths.app.views + '/**/*.html')
		.pipe(assets)

		.pipe(jsFilter)
		.pipe(uglifyJS(config.uglifyJS))
		.pipe(gulp.dest(config.paths.build.root))
		.pipe(jsFilter.restore())

		.pipe(cssFilter)
		.pipe(cssnano())
		.pipe(gulp.dest(config.paths.build.root))
		.pipe(cssFilter.restore())

		.pipe(assets.restore())
		.pipe(useref())

		.pipe(htmlFilter) // don't copy assets to the views dest
		.pipe(gulp.dest(config.paths.build.views))
		.pipe(htmlFilter.restore());
});
gulp.task('views:min', function () {
	return gulp.src(config.paths.build.views + '/**/*.html')
		.pipe(htmlmin(config.htmlmin))
		.pipe(gulp.dest(config.paths.build.views));
});

gulp.task('revision:clean', function (next) {
	del(config.paths.build.assets + '/rev-manifest.json', next);
});
gulp.task('revision', ['revision:assets', 'revision:views']);
gulp.task('revision:assets', function () {
	return gulp.src([
			config.paths.build.assets + '/**/*.css',
			config.paths.build.assets + '/**/*.js',
			'!' + config.paths.build.js + '/vendor/**/*'
		])
		.pipe(rev())
		.pipe(gulp.dest(config.paths.build.assets))
		.pipe(rev.manifest())
		.pipe(gulp.dest(config.paths.build.assets));
});
gulp.task('revision:views', ['revision:assets'], function () {
	var manifest = gulp.src(config.paths.build.assets + '/rev-manifest.json');

	return gulp.src(config.paths.build.views + '/**/*.html')
		.pipe(revReplace({
			manifest: manifest
		}))
		.pipe(gulp.dest(config.paths.build.views));
});


gulp.task('watch', function () {
	gulp.watch(config.paths.app.styles + '/**/*', ['styles']);
	gulp.watch(config.paths.app.scripts + '/**/*', ['scripts']);
	gulp.watch(config.paths.app.views + '/**/*', ['views:dev']);
});

gulp.task('clean', ['styles:clean', 'scripts:clean', 'images:clean', 'fonts:clean', 'views:clean', 'revision:clean']);

gulp.task('build:dev', function (next) {
	runSequence(
		'clean', // clean assets dir
		['bower', 'images', 'fonts'], // make all the assets available for compass
		['styles', 'scripts', 'views:dev'], // compile css and js and move views to the build folder
		next
	);
});

gulp.task('build:production', function (next) {
	runSequence(
		'clean', // clean assets dir
		['bower', 'images', 'fonts'], // make all the assets available for compass
		['styles', 'styles:min', 'scripts', 'scripts:min'], // compile & minify css and js
		['views:production'], // combine assets and rewrite references in views, move views to the build folder
		['views:min'], // minify templates code
		['revision'], // revision assets and kill cache for renewed ones
		next
	);
});

gulp.task('publish', ['build:production']);
gulp.task('build', ['build:dev']);
gulp.task('default', ['build', 'watch']);