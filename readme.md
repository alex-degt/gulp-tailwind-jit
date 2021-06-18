# Описание gulp-сборки

**Starter Gulp 4 + Tailwind CSS (JIT)**

Запустить для дева - npm run dev

Собрать для прода - сначала компилим dev (npm run dev), останавливаем, потом собираем из него прод (npm run prod)

О стилях:

1. Всё что можно сделать на TailwindCSS - делается на нём,
2. Всё что нельзя - делаем силами CSS, подключаем два файла стилей (первый файл tailwind.min.css так как он содержит normalize.css)

В прод версию tailwind-файла стилей попадут только те классы, которые есть во всех HTML-файлах.
Если вставляешь HTML куски через JS с tailwind-классами - продублируй этот HTML в файл src/html/service/for-tailwind.html

src/components - законченный компонент (html + css + js)

## 1. Запуск сборки

Папка **src** - исходные файлы.

Папка **docs** - скомпилированная вёрстка.

Запуск сборки:

1. Выполнить команду **npm i** для установки всех пакетов
2. Выполнить:

- **npm run dev** - режим разработки, старт сервера
- **npm run prod** - пересобрать всё без старта сервера

## 2. JS

**Скрипты**

- линтер,
- глобальное подключение файла в файл,
- минификация (опционально),
- конкатенация (опционально).

## 3. HTML

**Используется фреймворк TailwindCSS:**

~~минификация HTML~~ (отключено)

## 4. CSS

**Используется препроцессор SCSS**

- глобальное подключение файла в файл,
- SASS синтаксис,
- автопрефиксер,
- минификация, (для prod)
- конкатенация файлов.

## 5. IMG

**JPG, PNG**

- исходные изображения находятся в **[src/img/src/]**,
- PNG, JPG - сжимаем,
- обработанные изображения помещаются в **[src/img/dest/]**,
- все изображения из **[src/img/dest/]** копируются в **[docs/img/]**

**SVG**

- всё что внутри **[src/img/src/for-sprite]** - будет собрано в SVG-инлайн спрайт
- очищаем SVG с помощью SVGO
- собираем в спрайт
- форматируем
- меняем все **fill** и **stroke** на **currentColor**
- подключаем на страницу

### Алгоритм работы сборки

**Последовательно**

1. очищаем папку docs
2. сжимаем картинки
3. копируем все изображения в docs
4. Копирум папки libs || fonts в docs

**Параллельно**

- операции с css
- операции с html
- копирование папки libs в docs
- копирование папки fonts в docs

### Нюансы используемых модулей

**gulp-file-include**

- Что делает: подключает один HTML файл в другой
- Синтаксис: @@include('./file.svg')
- Важно использовать одинарные кавычки
- basepath: "@root" - путь от корня проекта
- Если используется форматировщик HTML в самом редакторе (к примеру Prettier) - последовательное подключение нескольких файлов при форматировании приводит к "слипанию". Решение - добавить комментарий prettier-ignore

```
  <!-- prettier-ignore -->
  @@include('./src/file-1.html')
  @@include('./src/file-2.html')
  @@include('./src/file-3.html')
```