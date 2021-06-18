const { src, dest, task, watch, series, parallel } = require("gulp");

// Общие модули
const browserSync = require("browser-sync").create(); // Запуск сервера
const newer = require("gulp-newer"); // Сверить файл на наличие изменений
const del = require("del"); // Удаление папки с файлами
const notify = require("gulp-notify"); // Модуль вывода ошибок
const plumber = require("gulp-plumber"); // Модуль перехвата ошибок
const concat = require("gulp-concat"); // Конкатенация файлов (слияние)
const logSymbols = require("log-symbols"); // Вывод иконок в консоль
const rename = require("gulp-rename"); // Переименование файлов
const prettyData = require("gulp-pretty-data"); // Форматирование XML (SVG)
const cheerio = require("gulp-cheerio"); // Манипулирование HTML и XML

// HTML
const fileinclude = require("gulp-file-include"); // include файлов в HTML (@@include('./file.svg') !!! ВАЖНО ОДИНАРНЫЕ КАВЫЧКИ)
const deletecomments = require("gulp-decomment"); // Удалить комментарии в HTML

// CSS
const sass = require("gulp-sass"); // SCSS с SASS-синтаксисом
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
const imagemin = require("gulp-imagemin"); // Сжатие изображений
const svgo = require("gulp-svgo"); // Сжатие SVG
const svgstore = require("gulp-svgstore"); // Создание SVG-спрайта

// Общие таски

function imagesoptimize() {
	return src(["./src/img/src/**/*", "!./src/img/src/for-sprite/**/*"], { nodir: true })
		.pipe(newer("./src/img/dest/"))
		.pipe(imagemin([imagemin.optipng({ optimizationLevel: 3 }), imagemin.mozjpeg({ progressive: true })]))
		.pipe(dest("./src/img/dest/"));
}

// SVGO: Настройки и их последовательность соответствует компрессору https://jakearchibald.github.io/svgomg/
function svgsprite() {
	return src(["./src/img/src/for-sprite/**/*.svg"])
		.pipe(
			svgo({
				removeDoctype: true,
				removeXMLProcInst: true,
				removeComments: true,
				removeMetadata: true,
				removeXMLNS: false,
				removeEditorsNSData: true,
				cleanupAttrs: true,
				inlineStyles: true,
				minifyStyles: true,
				convertStyleToAttrs: true,
				cleanupIDs: true,
				removeRasterImages: true,
				removeUselessDefs: true,
				cleanupListOfValues: true,
				cleanupNumericValues: true,
				convertColors: true,
				removeUnknownsAndDefaults: true,
				removeNonInheritableGroupAttrs: true,
				removeUselessStrokeAndFill: true,
				removeViewBox: true,
				cleanupEnableBackground: true,
				removeHiddenElems: true,
				removeEmptyText: true,
				convertShapeToPath: true,
				moveElemsAttrsToGroup: true,
				moveGroupAttrsToElems: true,
				collapseGroups: true,
				convertEllipseToCircle: true,
				convertTransform: true,
				removeEmptyAttrs: true,
				removeEmptyContainers: true,
				mergePaths: true,
				removeUnusedNS: true,
				reusePaths: true,
				sortAttrs: true,
				sortDefsChildren: true,
				removeTitle: true,
				removeDes: true,
				removeDimensions: true,
				removeStyleElement: true,
				removeScriptElement: true,
				convertPathData: true,
			})
		)
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
					$("[fill]").attr("fill", "currentColor");
					$("[stroke]").attr("stroke", "currentColor");
				},
				parserOptions: { xmlMode: true },
			})
		)
		.pipe(rename("sprite.svg"))
		.pipe(dest("./src/img/dest/"));
}

function copyfonts() {
	return src("./src/fonts/**/*").pipe(dest("./docs/fonts/"));
}
function copyimg() {
	return src("./src/img/dest/**/*").pipe(dest("./docs/img/"));
}
function copylibs() {
	return src("./src/libs/**/*").pipe(dest("./docs/libs/"));
}

// DEVELOPMENT-таски

function livePreview(done) {
	browserSync.init({
		server: {
			baseDir: "./docs/",
		},
		port: 9050 || 5000,
	});
	done();
}

function previewReload(done) {
	console.log("\n\t" + logSymbols.info, "Reloading Browser Preview.\n");
	browserSync.reload();
	done();
}

function devHTML() {
	return src("./src/html/pages/*.html")
		.pipe(
			plumber({
				errorHandler: notify.onError(function (err) {
					return {
						title: "JS",
						sound: false,
						message: err.message,
					};
				}),
			})
		)
		.pipe(
			fileinclude({
				prefix: "@@",
				basepath: "@root", // Путь от корня папки
				indent: true, // Сохранить отступы
			})
		)
		.pipe(dest("./docs/"));
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
		.pipe(dest("./docs/css/"))
		.pipe(browserSync.stream());
}

function devScripts() {
	return src("./src/js/index.js")
		.pipe(
			plumber({
				errorHandler: notify.onError(function (err) {
					return {
						title: "JS",
						sound: false,
						message: err.message,
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

function watchFiles() {
	// HTML
	watch("./src/**/*.html", series(devHTML, devStylesTailwind, previewReload));
	// SASS стили
	watch("./src/sass/**/*.sass", devStyles);
	// Tailwind CSS стили
	watch(["./tailwind.config.js", "./src/sass/tailwind/*.scss"], series(devStylesTailwind, previewReload));
	// JS
	watch("./src/**/*.js", series(devScripts, previewReload));
	// Fonts
	watch("./src/fonts/**/*", series(copyfonts, previewReload));
	// Libs
	watch("./src/libs/**/*", series(copylibs, previewReload));
	// Сжать изображения
	watch("./src/img/src/**/*", imagesoptimize);
	// Подготовка SVG для спрайта
	watch("./src/img/src/for-sprite/**/*", svgsprite);
	// Скопировать изображения если они изменились
	watch("./src/img/dest/**/*", copyimg);

	console.log("\n\t" + logSymbols.info, "Watching for Changes..\n");
}

function devClean() {
	console.log("\n\t" + logSymbols.info, "Cleaning dist folder for fresh start.\n");
	return del("./docs/");
}

// PRODUCTION-таски

function prodHTML() {
	return src("./src/html/pages/*.html")
		.pipe(
			plumber({
				errorHandler: notify.onError(function (err) {
					return {
						title: "JS",
						sound: false,
						message: err.message,
					};
				}),
			})
		)
		.pipe(
			fileinclude({
				prefix: "@@",
				basepath: "@root", // Путь от корня папки
				indent: true, // Сохранить отступы
			})
		)
		.pipe(deletecomments()) // Удалить все комментарии из HTML
		.pipe(dest("./docs/"));
}

function prodStylesTailwind() {
	return src("./docs/css/tailwind.min.css")
		.pipe(
			purgecss({
				content: ["./src/**/*.{html,js}", "./src/html/service/for-tailwind.html"],
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

function prodScripts() {
	return src("./src/js/index.js").pipe(rigger()).pipe(concat("scripts.min.js")).pipe(dest("./docs/js/"));
}

exports.default = series(
	devClean,
	imagesoptimize,
	svgsprite,
	copyimg,
	copyfonts,
	copylibs,
	parallel(devStylesTailwind, devStyles, devScripts, devHTML), // Запустить задачи параллельно
	livePreview,
	watchFiles
);

exports.prod = series(
	imagesoptimize,
	svgsprite,
	copyimg,
	copyfonts,
	copylibs,
	parallel(prodStylesTailwind, prodStyles, prodScripts, prodHTML) // Запустить задачи параллельно
);