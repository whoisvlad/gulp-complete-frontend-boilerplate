const gulp = require('gulp')
const sass = require('gulp-sass')
const browsersync = require('browser-sync')
const plumber = require("gulp-plumber");
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const include = require('gulp-file-include');

sass.compiler = require('node-sass');

// Paths for tasks
const paths = {
	styles: {
		srcMain: 'src/styles/main.scss',
		srcAll: 'src/styles/**/*.scss',
		dest: 'public/styles/'
	},
	scripts: {
		srcAll: 'src/scripts/**/*.js',
		dest: 'public/scripts/'
	},
	assets: {
		srcAll: 'src/assets/**/*.*',
		imagesSrc: 'src/assets/images/**/*.*',
		imagesDest: 'public/assets/images/',
		fontsSrc: 'src/assets/fonts/**/*.*',
		fontsDest: 'public/assets/fonts/'
	},
	html: {
		srcAll: 'src/**/*.html',
		views: 'src/views/**/*.html',
		dest: 'public/'
	}
}


// Tasks
// BrowserSync
function browserSync(done) {
	browsersync.init({
		server: {
			baseDir: "./public",
		},
		port: 5000,
		injectChanges: true,
		stream:true,
		notify: false
	});
	done();
}
// BrowserSync Reload
function browserSyncReload(done) {
	browsersync.reload();
	done();
}




// Styles
function stylesFunc() {
	return gulp
		.src(paths.styles.srcMain)
		.pipe(plumber())
		.pipe(sass({
			outputStyle: 'expanded'
		}))
		.pipe(autoprefixer({
			cascade: true
		}))
		.pipe(cleanCSS({
		    level: 2
		}))
		.pipe(rename('main.bundle.css'))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browsersync.stream())
}





// Scripts
function scriptsFunc() {
	return gulp
		.src(paths.scripts.srcAll)
		.pipe(plumber())
		.pipe(concat('main.bundle.js'))
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.scripts.dest))
}




// Assets
// Images tasks
function imagesFunc() {
	return gulp
		.src(paths.assets.imagesSrc)
		.pipe(plumber())
		.pipe(imagemin([
			imagemin.mozjpeg({quality: 75, progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
		]))
		.pipe(gulp.dest(paths.assets.imagesDest))
}
// Fonts task
function fontsFunc() {
	return gulp
		.src(paths.assets.fontsSrc)
		.pipe(plumber())
		.pipe(gulp.dest(paths.assets.fontsDest))
}


// HTML task
function htmlFunc() {
	return gulp
		.src(paths.html.srcAll)
		.pipe(plumber())
		.pipe(gulp.dest(paths.html.dest))
}

// Include html - testing
function includeHtmlFunc() {
	return gulp
		.src(paths.html.views)
		.pipe(plumber())
		.pipe(include({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(gulp.dest(paths.html.dest))
		.pipe(browsersync.stream())
}




// Clean Public
function cleanPublic() {
	return gulp
		.src([
			'public/*'
		])
		.pipe(plumber())
		.pipe(clean())
}



// Watch files
function watchFiles() {
	// styles
	gulp.watch(paths.styles.srcAll, stylesFunc)
	// scripts
	gulp.watch(paths.scripts.srcAll, gulp.series(scriptsFunc, browserSyncReload))
	// images
	gulp.watch(paths.assets.imagesSrc, gulp.series(imagesFunc, browserSyncReload))
	// fonts
	gulp.watch(paths.assets.fontsSrc, gulp.series(fontsFunc, browserSyncReload))
	// html
	// gulp.watch(paths.html.srcAll, gulp.series(htmlFunc, browserSyncReload))
	gulp.watch(paths.html.srcAll, gulp.series(includeHtmlFunc))
}




// Complex tasks
const cleanBeforeBuild = gulp.series(cleanPublic);
const build = gulp.parallel(stylesFunc, scriptsFunc, imagesFunc, fontsFunc, includeHtmlFunc)
// const build = gulp.parallel(stylesFunc, scriptsFunc, imagesFunc, fontsFunc, htmlFunc)
const watch = gulp.parallel(stylesFunc, scriptsFunc, imagesFunc, fontsFunc, includeHtmlFunc, watchFiles, browserSync)
// const watch = gulp.parallel(stylesFunc, scriptsFunc, imagesFunc, fontsFunc, htmlFunc, watchFiles, browserSync)
const includeHtml = gulp.series(includeHtmlFunc)


// Export tasks
exports.include = includeHtml
exports.clean = cleanBeforeBuild
exports.build = build
exports.default = watch