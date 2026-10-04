import { isFavorite, subscribe, toggleFavorite } from '../core/store.js';
import { el } from '../utils/dom.js';
import { icon } from './icons.js';

export function createFavoriteButton(recipe) {
  const button = el('button', { class: 'favorite-button', type: 'button' });

  function update() {
    const active = isFavorite(recipe.id);
    const label = active
      ? `Убрать «${recipe.title}» из избранного`
      : `Добавить «${recipe.title}» в избранное`;
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', label);
    button.replaceChildren(icon('heart', { filled: active }));
  }

  button.addEventListener('click', () => toggleFavorite(recipe.id));
  const unsubscribe = subscribe((change) => {
    if (change.type === 'favorites') update();
  });
  update();
  return { element: button, dispose: unsubscribe };
}
