import { buildHref } from '../core/router.js';
import { dishImage } from '../data/media.js';
import { el } from '../utils/dom.js';
import { formatDuration, formatServings } from '../utils/format.js';
import { createFavoriteButton } from './favorite-button.js';
import { icon } from './icons.js';

const IMAGE_SIZES =
  '(min-width: 86rem) 26rem, (min-width: 58rem) 30vw, (min-width: 38rem) 46vw, 92vw';
const META_ICON_SIZE = 20;

function createImage(recipe, { eager, priority }) {
  const image = dishImage(recipe.id);
  return el('img', {
    class: 'recipe-card__image',
    alt: '',
    width: image.width,
    height: image.height,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
    fetchpriority: priority ? 'high' : null,
    sizes: IMAGE_SIZES,
    srcset: image.srcset,
    src: image.src,
    on: { error: (event) => event.currentTarget.remove() },
  });
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
