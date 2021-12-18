// npm run dev - запуск сборки (в режиме разработки)
// npm run prod - собрать production-версию

const { src, dest, task, watch, series, parallel } = require("gulp");

// Общие модули
const browserSync = require("browser-sync").create(); // Запуск сервера
const newer = require("gulp-newer"); // Сверить файл на наличие изменений
const del = require("del"); // Удаление папки с файлами
const notify = require("gulp-notify"); // Модуль вывода ошибок
const plumber = require("gulp-plumber"); // Модуль перехвата ошибок
const concat = require("gulp-concat"); // Конкатенация файлов (слияние)
const rename = require("gulp-rename"); // Переименование файлов
const prettyData = require("gulp-pretty-data"); // Форматирование XML (SVG)
const cheerio = require("gulp-cheerio"); // Манипулирование HTML и XML

// HTML
const pug = require("gulp-pug");

// CSS
const sass = require("gulp-sass")(require("sass")); // SCSS с SASS-синтаксисом
const sassGlob = require("gulp-sass-glob"); // include SASS в SASS (@import "./file.sass")
const autoprefixerstyles = require("gulp-autoprefixer"); // автопрефиксер
const cleancss = require("gulp-clean-css"); // Чистка CSS

// Tailwind CSS
const postcss = require("gulp-postcss"); // Компиляция tailwind-утилит с tailwind-конфигом
const purgecss = require("gulp-purgecss"); // Удалить неиспользуемый CSS

// JS
const eslint = require("gulp-eslint"); // JS линтер
const rigger = require("gulp-rigger"); // include JS в JS (//= ./file.js)

// IMG
const svgstore = require("gulp-svgstore"); // Создание SVG-спрайта

//////////////////////////////////////////////////////////////////////////////////////////

// Общие таски

function clean() {
	console.log("\n\t", "Cleaning docs folder (docs/) for fresh start.\n");
	return del("./docs/");
}

function cleanImg() {
	console.log("\n\t", "Cleaning images folder (src/img/dest) for fresh start.\n");
	return del("./src/img/dest/");
}

function imagesOptimize() {
	return src(["./src/img/src/**/*", "!./src/img/src/for-sprite/**/*"], { nodir: true }).pipe(newer("./src/img/dest/")).pipe(dest("./src/img/dest/"));
}

function svgSprite() {
	return src(["./src/img/src/for-sprite/**/*.svg"])
		.pipe(svgstore({ inlineSvg: true }))
		.pipe(
			prettyData({
				type: "prettify",
				extensions: {
					xlf: "xml",
					svg: "xml",
				},
			})
		)
		.pipe(
			cheerio({
				run: function ($) {
					$("svg").attr("style", "display:none");

					$("symbol").each(function () {
						if ($(this).find("path").attr("fill") !== undefined) {
							$(this).find("path").attr("fill", "currentColor");
						}

						if ($(this).find("path").attr("stroke") !== undefined) {
							$(this).find("path").attr("stroke", "currentColor");
						}
					});
				},
				parserOptions: { xmlMode: true },
			})
		)
		.pipe(rename("sprite.svg"))
		.pipe(dest("./src/img/dest/"));
}

function copyImg() {
	return src(["./src/img/dest/**/*", "!./src/img/dest/sprite.svg"]).pipe(dest("./docs/img/"));
}

function copyLibs() {
	return src("./src/libs/**/*").pipe(dest("./docs/libs/"));
}

//////////////////////////////////////////////////////////////////////////////////////////

// DEVELOPMENT-таски

function devScripts() {
	return src("./src/js/index.js")
		.pipe(
			plumber({
				errorHandler: notify.onError(function (err) {
					return {
						title: " JS ",
						sound: false,
						message: "\n" + err.message,
					};
				}),
			})
		)
		.pipe(rigger())
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(concat("scripts.min.js"))
		.pipe(dest("./docs/js/"))
		.pipe(browserSync.stream());
}

function devStylesTailwind() {
	const tailwindcss = require("tailwindcss");
	return src("./src/sass/tailwind/*.scss")
		.pipe(sass().on("error", sass.logError))
		.pipe(dest("./src/sass/tailwind/"))
		.pipe(postcss([tailwindcss("./tailwind.config.js"), require("autoprefixer")]))
		.pipe(concat({ path: "tailwind.min.css" }))
		.pipe(dest("./docs/css/"));
}

function devStyles() {
	return src("./src/sass/**/*.sass")
		.pipe(
			plumber({
				errorHandler: notify.onError(function (err) {
					return {
						title: " SASS ",
						sound: false,
						message: "\n" + err.message,
					};
				}),
			})
		)
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(concat("styles.min.css"))
		.pipe(dest("./docs/css/"))
		.pipe(browserSync.stream());
}

function jade() {
	return src("./src/pug/gulp-pages/*.pug")
		.pipe(
			plumber({
				errorHandler: notify.onError(function (err) {
					return {
						title: " JADE ",
						sound: false,
						message: "\n" + err.message,
					};
				}),
			})
		)
		.pipe(pug())
		.pipe(dest("./docs/"));
}

function livePreview(done) {
	browserSync.init({
		server: {
			baseDir: "./docs/",
		},
		port: 9050 || 5000,
	});
	done();
}

function watchFiles() {
	// JS
	watch(["./src/js/**/*.js", "./src/components/**/*.js"], series(devScripts, previewReload));
	// Сжать изображения
	watch("./src/img/src/**/*", imagesOptimize);
	// Подготовка SVG для спрайта
	watch("./src/img/src/for-sprite/**/*", svgSprite);
	// Скопировать изображения если они изменились
	watch("./src/img/dest/**/*", series(copyImg, previewReload));
	// Libs
	watch("./src/libs/**/*", series(copyLibs, previewReload));
	// Tailwind CSS стили
	watch(["./tailwind.config.js", "./src/sass/tailwind/*.scss"], series(devStylesTailwind, previewReload));
	// SASS стили
	watch(["./src/sass/**/*.sass", "./src/components/**/*.sass"], devStyles);
	// JADE
	watch("./src/**/*.pug", series(jade, devStylesTailwind, previewReload));

	console.log("\n\t", "Watching for Changes..\n");
}

function previewReload(done) {
	console.log("\n\t", "Reloading Browser Preview.\n");
	browserSync.reload();
	done();
}

//////////////////////////////////////////////////////////////////////////////////////////

// PRODUCTION-таски

function prodScripts() {
	return src("./src/js/index.js").pipe(rigger()).pipe(concat("scripts.min.js")).pipe(dest("./docs/js/"));
}

function prodStylesTailwind() {
	const tailwindcss = require("tailwindcss");
	return src("./src/sass/tailwind/*.scss")
		.pipe(sass().on("error", sass.logError))
		.pipe(dest("./src/sass/tailwind/"))
		.pipe(postcss([tailwindcss("./tailwind.config.js"), require("autoprefixer")]))
		.pipe(concat({ path: "tailwind.min.css" }))
		.pipe(
			purgecss({
				content: ["./src/**/*.pug", "./docs/js/scripts.min.js"],
				defaultExtractor: (content) => {
					const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
					const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
					return broadMatches.concat(innerMatches);
				},
			})
		)
		.pipe(cleancss({ compatibility: "ie8" }))
		.pipe(dest("./docs/css"));
}

function prodStyles() {
	return src("./src/sass/**.sass")
		.pipe(
			plumber({
				errorHandler: notify.onError(function (err) {
					return {
						title: "Styles",
						sound: false,
						message: err.message,
					};
				}),
			})
		)
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(concat("styles.min.css"))
		.pipe(
			autoprefixerstyles({
				cascade: false,
			})
		)
		.pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
		.pipe(dest("./docs/css/"));
}

function jadeProd() {
	return src("./src/pug/gulp-pages/*.pug")
		.pipe(
			plumber({
				errorHandler: notify.onError(function (err) {
					return {
						title: " JADE ",
						sound: false,
						message: "\n" + err.message,
					};
				}),
			})
		)
		.pipe(pug({ pretty: true }))
		.pipe(dest("./docs/"));
}

//////////////////////////////////////////////////////////////////////////////////////////

exports.default = series(
	clean,
	devScripts,
	imagesOptimize,
	svgSprite,
	copyImg,
	copyLibs,
	parallel(devStylesTailwind, devStyles, jade), // Запустить задачи параллельно
	livePreview,
	watchFiles
);

exports.prod = series(
	clean,
	cleanImg,
	prodScripts,
	imagesOptimize,
	svgSprite,
	copyImg,
	// copyFonts,
	copyLibs,
	parallel(jadeProd, prodStylesTailwind, prodStyles) // Запустить задачи параллельно
);
