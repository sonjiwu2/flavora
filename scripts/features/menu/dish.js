import { icon } from '../../components/icons.js';
import { buildHref } from '../../core/router.js';
import { dishImage } from '../../data/media.js';
import { el } from '../../utils/dom.js';
import { formatDuration } from '../../utils/format.js';

const CLOCK_ICON_SIZE = 20;
const CELL_THUMB_SIZES = '(min-width: 75rem) 13vw, 6rem';
const OPTION_THUMB_SIZES = '5.5rem';

function joinClasses(...names) {
  return names.filter(Boolean).join(' ');
}

function createDishImage(recipe, sizes) {
  const source = dishImage(recipe.id);
  const image = el('img', {
    class: 'menu-thumb__image',
    loading: 'lazy',
    decoding: 'async',
    width: source.width,
    height: source.height,
    sizes,
    srcset: source.srcset,
    alt: '',
  });
  image.addEventListener('error', () => image.remove(), { once: true });
  image.src = source.src;
  return image;
}

export function createDishThumb(recipe, className) {
  return el(
    'span',
    { class: joinClasses('menu-thumb', className) },
    createDishImage(recipe, OPTION_THUMB_SIZES),
  );
}

export function createDishThumbLink(recipe, className) {
  return el(
    'a',
    {
      class: joinClasses('menu-thumb', className),
      href: buildHref(`/recipe/${recipe.id}`),
      tabindex: '-1',
      'aria-hidden': 'true',
    },
    createDishImage(recipe, CELL_THUMB_SIZES),
  );
}

export function createDurationMeta(recipe, className) {
  return el(
    'span',
    { class: joinClasses('meta', className) },
    el(
      'span',
      { class: 'meta__item' },
      icon('clock', { size: CLOCK_ICON_SIZE }),
      formatDuration(recipe.totalMinutes),
    ),
  );
}
