import { createFavoriteButton } from '../../components/favorite-button.js';
import { icon } from '../../components/icons.js';
import { buildHref, setPageTitle } from '../../core/router.js';
import { dishImage } from '../../data/media.js';
import { getRecipe } from '../../data/recipes.js';
import { createDisposer, el } from '../../utils/dom.js';
import {
  formatDuration,
  formatServings,
  keepShortWordsAttached,
  typeset,
} from '../../utils/format.js';
import { openAddToMenu } from '../menu/add-to-menu.js';
import { mount as mountNotFound } from '../shell/not-found.js';
import { createIngredientsSection } from './ingredients-section.js';
import { createStepsSection } from './steps-section.js';

const DIFFICULTY_LABELS = { easy: 'Просто', medium: 'Средне', hard: 'Сложно' };
const PHOTO_SIZES =
  '(min-width: 64rem) min(40vw, 35rem), (min-width: 48rem) 46vw, calc(100vw - 2rem)';
const PHOTO_LOADED_CLASS = 'recipe__photo--loaded';
const PHOTO_EMPTY_CLASS = 'recipe__photo--empty';

function createMetaItem(iconName, label, text) {
  return el(
    'li',
    { class: 'meta__item' },
    icon(iconName),
    el('span', {}, el('span', { class: 'visually-hidden' }, `${label}: `), text),
  );
}

function createHeader(recipe) {
  const duration = typeset(formatDuration(recipe.totalMinutes, { long: true }));
  return el(
    'header',
    { class: 'recipe__header' },
    el('h1', { class: 'page-title recipe__title' }, keepShortWordsAttached(recipe.title)),
    el('p', { class: 'recipe__summary' }, typeset(recipe.summary)),
    el(
      'ul',
      { class: 'meta meta--large recipe__meta' },
      createMetaItem('clock', 'Время', duration),
      createMetaItem('user', 'Порции', formatServings(recipe.servings)),
      createMetaItem('chef-hat', 'Сложность', DIFFICULTY_LABELS[recipe.difficulty]),
    ),
    recipe.activeMinutes &&
      el(
        'p',
        { class: 'recipe__active-time' },
        typeset(`Активной готовки — ${formatDuration(recipe.activeMinutes, { long: true })}`),
      ),
  );
}

function createPhoto(recipe) {
  const source = dishImage(recipe.id);
  const frame = el('div', { class: 'recipe__photo' });
  const image = el('img', {
    class: 'recipe__photo-image',
    alt: `${recipe.title} — готовое блюдо`,
    width: source.width,
    height: source.height,
    sizes: PHOTO_SIZES,
    srcset: source.srcset,
    loading: 'eager',
    fetchpriority: 'high',
    decoding: 'async',
    on: {
      load: () => frame.classList.add(PHOTO_LOADED_CLASS),
      error: () => frame.classList.add(PHOTO_EMPTY_CLASS),
    },
    src: source.src,
  });
  if (image.complete && image.naturalWidth > 0) frame.classList.add(PHOTO_LOADED_CLASS);
  frame.append(image);
  return frame;
}

function createActions(recipe, favorite) {
  return el(
    'div',
    { class: 'recipe__actions' },
    favorite.element,
    el(
      'button',
      {
        class: 'button button--secondary recipe__action',
        type: 'button',
        on: { click: () => openAddToMenu(recipe.id) },
      },
      icon('calendar'),
      'В меню',
    ),
  );
}

export function mount(outlet, route) {
  const recipe = getRecipe(route.params.id);
  if (!recipe) return mountNotFound(outlet, route);

  setPageTitle(recipe.title);
  const disposer = createDisposer();
  const favorite = createFavoriteButton(recipe, { withLabel: true });
  favorite.element.classList.add('recipe__action');
  const steps = createStepsSection(recipe);
  const ingredients = createIngredientsSection(recipe, { onServingsChange: steps.setServings });
  disposer.add(favorite.dispose);
  disposer.add(steps.dispose);

  outlet.append(
    el(
      'article',
      { class: 'recipe' },
      el(
        'a',
        { class: 'back-link', href: buildHref('/recipes') },
        icon('arrow-left'),
        'Все рецепты',
      ),
      el(
        'div',
        { class: 'recipe__layout' },
        el(
          'div',
          { class: 'recipe__main' },
          createHeader(recipe),
          createPhoto(recipe),
          createActions(recipe, favorite),
          ingredients.element,
        ),
        steps.element,
      ),
    ),
  );
  return disposer.dispose;
}
