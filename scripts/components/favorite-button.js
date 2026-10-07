import { isFavorite, subscribe, toggleFavorite } from '../core/store.js';
import { el, listen } from '../utils/dom.js';
import { icon } from './icons.js';
import { showToast } from './toast.js';

const TEXT = Object.freeze({
  add: 'В избранное',
  added: 'В избранном',
  addHint: 'Добавить в избранное',
  removeHint: 'Убрать из избранного',
  toastAdded: 'Добавлено в избранное',
  toastRemoved: 'Убрано из избранного',
});

function createHeart() {
  const outline = icon('heart');
  const fill = icon('heart', { filled: true });
  outline.classList.add('favorite-button__outline');
  fill.classList.add('favorite-button__fill');
  return el('span', { class: 'favorite-button__icon' }, outline, fill);
}

export function createFavoriteButton(recipe, { withLabel = false, announce = true } = {}) {
  const label = withLabel ? el('span', { class: 'favorite-button__label' }) : null;
  const button = el(
    'button',
    {
      class: withLabel ? 'favorite-button favorite-button--labeled' : 'favorite-button',
      type: 'button',
      dataset: { recipeId: recipe.id },
    },
    createHeart(),
    label,
  );

  function update() {
    const active = isFavorite(recipe.id);
    const stateText = active ? TEXT.added : TEXT.add;
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', `${stateText}: ${recipe.title}`);
    button.title = active ? TEXT.removeHint : TEXT.addHint;
    if (label) label.textContent = stateText;
  }

  function toggle() {
    const active = toggleFavorite(recipe.id);
    if (announce) showToast(active ? TEXT.toastAdded : TEXT.toastRemoved);
  }

  const stopListening = listen(button, 'click', toggle);
  const unsubscribe = subscribe((change) => {
    if (change.type === 'favorites') update();
  });
  update();

  return {
    element: button,
    dispose() {
      stopListening();
      unsubscribe();
    },
  };
}
