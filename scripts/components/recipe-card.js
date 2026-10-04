import { buildHref } from '../core/router.js';
import { dishImage } from '../data/media.js';
import { el } from '../utils/dom.js';
import { formatDuration, formatServings } from '../utils/format.js';
import { createFavoriteButton } from './favorite-button.js';

export function createRecipeCard(recipe, { headingLevel = 2, eager = false } = {}) {
  const image = dishImage(recipe.id);
  const favorite = createFavoriteButton(recipe);
  const element = el(
    'article',
    { class: 'recipe-card' },
    el(
      'a',
      { class: 'recipe-card__link', href: buildHref(`/recipe/${recipe.id}`) },
      el('img', {
        class: 'recipe-card__image',
        src: image.src,
        srcset: image.srcset,
        sizes: '(min-width: 1100px) 30vw, (min-width: 640px) 46vw, 92vw',
        width: image.width,
        height: image.height,
        alt: '',
        loading: eager ? 'eager' : 'lazy',
        decoding: 'async',
      }),
      el(`h${headingLevel}`, { class: 'recipe-card__title' }, recipe.title),
    ),
    el(
      'p',
      { class: 'recipe-card__meta' },
      `${formatDuration(recipe.totalMinutes)} · ${formatServings(recipe.servings)}`,
    ),
    favorite.element,
  );
  return { element, dispose: favorite.dispose };
}
