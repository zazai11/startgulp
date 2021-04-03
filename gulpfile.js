const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass'); // устоновленые через npm плагин, отвечающий за преобрзавонаие scss/sass в css
const concat = require('gulp-concat'); // установлено, объединяет и переименовывает файлы
const autoprefixer = require('gulp-autoprefixer'); // делает нерабочие css св-ва рабочими (в некоторых браузерах)
const uglify = require('gulp-uglify'); // сжимает js файлы
const browserSync = require('browser-sync').create(); // обновление стр при изменениях
const imagemin = require('gulp-imagemin'); //сжимает кратинки
const del = require('del'); // удаляет директорию

function cleanDist() {
    return del('dist')
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        notify: false, // при обновлении страницы в правом верхнем углу не будет оповещения
    })
}

function styles() {
    return src('app/scss/style.scss') //преобразует scss/sass в css
        .pipe(scss({
            outputStyle: 'compressed' //сжимает css в css.min(режим сжатия можно менять (expandet))
        }))
        .pipe(concat('style.min.css')) // переименовывает файл
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'], // делает нерабочие css Свойства в отсталых бразуерах в рабочие
            grid: true,
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream()) //страница будет перезагружаться при изменениях (если можно без перезагрузки то не будет)
}

function scripts() {
    return src([ //суда добовляются все скрипты
            'node_modules/jquery/dist/jquery.js',
            'app/js/main.js'
        ])
        .pipe(concat('main.min.js')) //объединяет все js файлы в 1
        .pipe(uglify()) //сжимает весь объединённый код
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function images() {
    return src('app/images/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function build(params) {
    return src([
            'app/**/*.html',
            'app/css/style.min.css',
            'app/js/main.min.js',
        ], { base: 'app' }) //что бы выкидывалось не 3 файла, а то как они хранились в app
        .pipe(dest('dist'))
}



function watching() {
    watch(['app/scss/**/*.scss'], styles); // смотрит за всеми файлами и их измененями, и если чё-то изменяется включает func(style)
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts); // ! - значит что за этим файлом не нужно следить
    watch(['app/**/*.html']).on('change', browserSync.reload);
}



exports.styles = styles; //запуск функции
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build); // запускает эти процессы по очереди

exports.default = parallel(styles, scripts, browsersync, watching)