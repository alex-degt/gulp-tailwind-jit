# Gulp 4 + Tailwind CSS (JIT) Starter Kit

1. Установить все пакеты:
```
npm i
```
2. Запуск сборки (в режиме разработки):
```
npm run dev
```
3. Собрать production-версию:
```
npm run prod
```

## О сборке

### 1. JS

- глобальное подключение файла в файл (путь от текущего файла)
```
//= ../components/component/component.js
```
- линтер (ES Lint),
- конкатенация.

## 2. HTML

- фреймворк Tailwind CSS (JIT),
- глобальное подключение файла в файл (путь от корня проекта)
```
@@include('./src/html/sections/header.html')
```
- удаление комментариев (только для production-версии билда).

## 3. CSS

- глобальное подключение файла в файл (путь от текущего файла),
```
@import "./base/_fonts"
```
- SCSS (SASS синтаксис),
- конкатенация,
- автопрефиксер (только для production-версии билда),
- минификация + чистка (только для production-версии билда).

## 4. JPG, PNG

- сжимаем все изображения в папке **src/img/src/** кроме **src/img/src/for-sprite**,
- перемещаем после сжатия в **src/img/dest/**.

## 5. SVG

- всё что внутри **src/img/src/for-sprite** - будет собрано в SVG-инлайн спрайт,
- очищаем SVG с помощью SVGO (настройки и их последовательность соответствует компрессору https://jakearchibald.github.io/svgomg/),
- собираем в спрайт,
- форматируем,
- меняем все **fill** и **stroke** на **currentColor**,
- сохраняем файл **src/img/dest/sprite.svg**,
- подключаем его на страницу (на этапе сборки).

## Нюансы используемых модулей

**gulp-file-include**

- Что делает: подключает один HTML файл в другой
- Синтаксис: @@include('./file.svg')
- Важно использовать одинарные кавычки
- basepath: "@root" - путь от корня проекта
- При форматированиии HTML в самом редакторе плагином (к примеру - Prettier) возможно "слипание" строк:

До форматирования:
```
 @@include('./src/file-1.html')
 @@include('./src/file-2.html')
 @@include('./src/file-3.html')
```
После форматирования:
```
 @@include('./src/file-1.html')@@include('./src/file-2.html')@@include('./src/file-3.html')
```

**Решение проблемы** - запретить редактору (в случае с Prettier) форматировать кусок кода, который находится сразу после комментария.
```
  <!-- prettier-ignore -->
  @@include('./src/file-1.html')
  @@include('./src/file-2.html')
  @@include('./src/file-3.html')
```
