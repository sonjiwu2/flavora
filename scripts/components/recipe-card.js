import { buildHref } from '../core/router.js';
import { dishImage } from '../data/media.js';
import { el } from '../utils/dom.js';
import { formatDuration, formatServings } from '../utils/format.js';
import { createFavoriteButton } from './favorite-button.js';
import { icon } from './icons.js';

const IMAGE_SIZES =
  '(min-width: 86rem) 26rem, (min-width: 58rem) 30vw, (min-width: 40rem) 46vw, 92vw';
const META_ICON_SIZE = 20;

function markLoaded(image) {
  image.dataset.loaded = '';
}

function createImage(recipe, { eager, priority }) {
  const source = dishImage(recipe.id);
  const image = el('img', {
    class: 'recipe-card__image',
    alt: '',
    width: source.width,
    height: source.height,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
    fetchpriority: priority ? 'high' : null,
    sizes: IMAGE_SIZES,
    srcset: source.srcset,
    src: source.src,
    on: {
      load: (event) => markLoaded(event.currentTarget),
      error: (event) => event.currentTarget.remove(),
    },
  });
  if (priority || image.complete) markLoaded(image);
  return image;
}

function createMetaItem(iconName, hiddenLabel, text) {
  return el(
    'li',
    { class: 'meta__item' },
    icon(iconName, { size: META_ICON_SIZE }),
    el('span', {}, el('span', { class: 'visually-hidden' }, `${hiddenLabel}: `), text),
  );
}

export function createRecipeCard(
  recipe,
  { headingLevel = 2, eager = false, priority = false, matchLabel = null } = {},
) {
  const favorite = createFavoriteButton(recipe);
  favorite.element.classList.add('recipe-card__favorite');
  const match = el('p', { class: 'recipe-card__match', hidden: true });
  const element = el(
    'article',
    { class: 'recipe-card', dataset: { recipeId: recipe.id } },
    el('div', { class: 'recipe-card__media' }, createImage(recipe, { eager, priority })),
    el(
      `h${headingLevel}`,
      { class: 'recipe-card__title' },
      el(
        'a',
        { class: 'recipe-card__link', href: buildHref(`/recipe/${recipe.id}`) },
        recipe.title,
      ),
    ),
    el(
      'ul',
      { class: 'meta recipe-card__meta' },
      createMetaItem('clock', 'Время', formatDuration(recipe.totalMinutes)),
      createMetaItem('user', 'Порции', formatServings(recipe.servings)),
    ),
    match,
    favorite.element,
  );

  function setMatchLabel(text) {
    match.textContent = text ?? '';
    match.hidden = text === null || text === undefined || text === '';
  }

  setMatchLabel(matchLabel);
  return { element, dispose: favorite.dispose, setMatchLabel };
}
