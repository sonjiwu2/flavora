# Архитектура Flavora

Статический сайт без сборки: семантический HTML, собственный CSS и JavaScript в ES-модулях.
Открывается любым статическим сервером из корня репозитория и на GitHub Pages по адресу
проекта `/flavora/`.

## Запуск и проверки

| Команда                                   | Что делает                                                           |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `npm run serve -- --port 5510`            | Локальный сервер по адресу `http://127.0.0.1:5510/flavora/`          |
| `npm run shot -- --route recipes --out …` | Снимок страницы в браузере, ошибки Console и сети, проверка overflow |
| `npm run lint`                            | ESLint и Stylelint                                                   |
| `npm run format:check`                    | Проверка форматирования Prettier                                     |
| `npm run test:unit`                       | Модульные тесты чистых функций (`node --test`)                       |

Сервер намеренно отдаёт сайт только под префиксом `/flavora/`, чтобы ссылки от корня домена
ломались локально так же, как на GitHub Pages.

## Маршруты

Используется hash-роутинг: он не требует серверных правил и переживает обновление страницы.

| Адрес                  | Экран                                    |
| ---------------------- | ---------------------------------------- |
| `#/recipes`            | Каталог (адрес по умолчанию)             |
| `#/recipe/<recipe-id>` | Страница рецепта                         |
| `#/favorites`          | Избранное                                |
| `#/menu`               | Меню на неделю (`?week=YYYY-MM-DD`)      |
| любой другой           | Понятное состояние «страница не найдена» |

Ссылки строятся через `buildHref(path, query)` из `scripts/core/router.js`. Пути к файлам —
только относительные (`styles/…`, `scripts/…`) или вычисленные от модуля
(`new URL('…', import.meta.url)`); ссылок от корня домена (`/assets/…`) в проекте нет.

## Жизненный цикл экрана

Каждый экран — модуль с функцией `mount(outlet, route)`:

- `outlet` — пустой элемент `<main id="app">`;
- `route` — `{ name, path, params, query }`;
- функция синхронно строит DOM, вызывает `setPageTitle(…)` и создаёт ровно один `h1`;
- возвращает функцию очистки, которая снимает подписки на store, слушатели `window`/`document`,
  таймеры и observers. Роутер вызывает её перед показом следующего экрана.

## Данные рецептов

`scripts/data/recipes.js` экспортирует `recipes`, `getRecipe(id)`, `hasRecipe(id)`.

```js
{
  id: '01-pesto-pasta',          // неизменный ID из исходного набора
  title: 'Паста с песто',
  category: 'pasta',             // ID из scripts/data/categories.js
  summary: 'Базилик, пармезан и паста аль денте.',
  difficulty: 'easy',            // 'easy' | 'medium' | 'hard'
  totalMinutes: 25,              // всё время до готовности, включая выпечку и охлаждение
  activeMinutes: 15,             // необязательно: время у плиты
  servings: 4,                   // базовое число порций
  ingredients: [Ingredient],
  steps: [Step],                 // ровно 6, шаг N соответствует сцене N
}
```

`Ingredient`:

```js
{
  id: 'spaghetti',               // ключ словаря scripts/data/ingredients.js
  amount: 340,                   // число | [мин, макс] | null для «по вкусу»
  unit: 'g',                     // ключ единицы из scripts/utils/quantities.js
  note: 'для подачи',            // необязательно
  optional: true,                // необязательно: рецепт получится и без него
  scalable: false,               // необязательно: количество не зависит от числа порций
}
```

`Step`: `{ title, text, timerMinutes?, note? }`.

Словарь `scripts/data/ingredients.js`: `ingredients[id] = { name, staple? }`. `staple: true`
помечает базовые продукты (соль, перец, вода, растительное масло), которые фильтр «Продукты дома»
считает всегда доступными.

Категории (`scripts/data/categories.js`): `breakfast`, `soup`, `salad`, `pasta`, `meat`, `fish`,
`vegetable`, `baking`, `dessert`.

## Изображения

Пути вычисляет `scripts/data/media.js`:

- `dishImage(id)` → `{ src, srcset, width, height }` для `assets/dishes/<id>-480.webp` и
  `assets/dishes/<id>-960.webp`, соотношение сторон 3:2;
- `stepImage(id, n)` → `{ src, width, height }` для `assets/steps/<id>-step-0N.webp`: квадратный
  WebP с прозрачным фоном, показывается с `object-fit: contain`.

## Состояние

`scripts/core/store.js` — единственный владелец пользовательского состояния.

| Ключ localStorage      | Значение                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| `flavora.theme.v1`     | `light` или `dark`; ключа нет — используется системная тема           |
| `flavora.motion.v1`    | `full` или `reduce`; ключа нет — используется системная настройка     |
| `flavora.favorites.v1` | `[{ "id": "<recipe-id>", "addedAt": <ms> }]`                          |
| `flavora.menu.v1`      | `{ "YYYY-MM-DD": { "breakfast"?: id, "lunch"?: id, "dinner"?: id } }` |

- Даты меню — локальные календарные даты `YYYY-MM-DD`; неделя начинается с понедельника.
- В одной ячейке меню — один рецепт.
- При чтении данные проверяются: повреждённый JSON, устаревшая схема и неизвестные ID отбрасываются.
- Если запись в localStorage невозможна, значение живёт до конца сессии, а слушатели
  `onStorageFailure` из `scripts/core/storage.js` получают уведомление.

API: `subscribe(listener)` (слушатель получает `{ type }`, где `type` — `theme`, `motion`,
`favorites` или `menu`), `getTheme/setTheme`, `getMotion/setMotion`, `getFavorites`, `isFavorite`,
`toggleFavorite`, `getMenu`, `getMeal`, `setMeal`, `clearMeal`, `moveMeal(from, to)` (занятая
ячейка меняется местами с исходной).

## Общие модули

| Модуль                                  | Назначение                                                      |
| --------------------------------------- | --------------------------------------------------------------- |
| `scripts/utils/dom.js`                  | `el()`, `listen()`, `createDisposer()`; текст только через узлы |
| `scripts/utils/format.js`               | Русские множественные формы, длительность, порции, поиск        |
| `scripts/components/icons.js`           | `icon(name, { size, filled })` — встроенные SVG                 |
| `scripts/components/modal.js`           | `openDialog({ title, body, footer, variant, onClose })`         |
| `scripts/components/toast.js`           | `showToast(message)` — короткое уведомление в live-region       |
| `scripts/components/favorite-button.js` | `createFavoriteButton(recipe)` → `{ element, dispose }`         |
| `scripts/components/recipe-card.js`     | `createRecipeCard(recipe, options)` → `{ element, dispose }`    |
| `scripts/features/menu/add-to-menu.js`  | `openAddToMenu(recipeId)` — выбор даты и приёма пищи            |

## Стили

`styles/tokens.css` задаёт переменные цвета, типографики, отступов, радиусов, слоёв и длительностей;
тёмная тема переопределяет только значения в `:root[data-theme='dark']`. Остальные файлы используют
токены и не содержат «магических» цветов. Классы — в стиле БЭМ: `block__element--modifier`.

| Файл                    | Содержимое                                  |
| ----------------------- | ------------------------------------------- |
| `styles/base.css`       | Сброс, базовая типографика, focus, иконки   |
| `styles/layout.css`     | Контейнер, шапка, навигация                 |
| `styles/components.css` | Кнопки, поля, диалоги, уведомления          |
| `styles/cards.css`      | Сетка и карточка рецепта, кнопка избранного |
| `styles/views/*.css`    | Стили отдельных экранов                     |
