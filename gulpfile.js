var gulp = require("gulp");
var clean = require("gulp-clean");
var gutil = require("gulp-util");
var NwBuilder = require("node-webkit-builder");

gulp.task("clean", function() {
	return gulp.src(['build/*', 'dist/*'], {read:false}).pipe(clean());
});

gulp.task("build:scripts", ["clean"], function() {
	return gulp.src("scripts/**/*.js")
		.pipe(gulp.dest("build/scripts"));
});

gulp.task("build:modules", ["clean"], function() {
	return gulp.src([
		"node_modules/fs-extra/**/*"
	])
	.pipe(gulp.dest("build/node_modules/fs-extra/"));
});

gulp.task("build:components", ["clean"], function() {
	return gulp.src("components/**/*")
		.pipe(gulp.dest("build/components"));
});

gulp.task("build:styles", ["clean"], function() {
	return gulp.src("styles/*.css")
		.pipe(gulp.dest("build/styles"));
});

gulp.task("build:images", ["clean"], function() {
	return gulp.src("styles/images/**/*")
		.pipe(gulp.dest("build/styles/images/"));
});

gulp.task("build:views", ["clean"], function() {
	return gulp.src("views/**/*.html")
		.pipe(gulp.dest("build/views"));
});

gulp.task("build:app", ["clean"], function() {
	return gulp.src([
		"index.html",
		"package.json"
	]).pipe(gulp.dest("build"));
})

gulp.task("dist", ["build:scripts", "build:modules", "build:components", "build:styles", "build:images", "build:views", "build:app"], function() {
	var nw = new NwBuilder({
        version: '0.12.2',
        files: [ './build/**/*'],
		buildDir: "./dist",
        platforms: ['win32','osx64'] // change this to 'win' for/on windows
    });

	nw.on('log', function (msg) {
        gutil.log('node-webkit-builder', msg);
    });

	return nw.build().catch(function (err) {
        gutil.log('node-webkit-builder', err);
    });
});

gulp.task("default", ["dist"]);