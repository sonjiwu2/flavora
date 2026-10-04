import { createRecipeCard } from '../../components/recipe-card.js';
import { buildHref, setPageTitle } from '../../core/router.js';
import { getFavorites, subscribe } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { createDisposer, el } from '../../utils/dom.js';

export function mount(outlet) {
  const cardDisposer = createDisposer();
  const list = el('div', { class: 'recipe-grid' });
  setPageTitle('Избранное');

  function renderList() {
    cardDisposer.dispose();
    const cards = getFavorites().map((favorite) => {
      const card = createRecipeCard(getRecipe(favorite.id));
      cardDisposer.add(card.dispose);
      return card.element;
    });
    if (cards.length === 0) {
      list.replaceChildren(
        el(
          'p',
          {},
          'Здесь пока пусто. ',
          el('a', { href: buildHref('/recipes') }, 'Перейти к рецептам'),
        ),
      );
    } else {
      list.replaceChildren(...cards);
    }
  }

  const unsubscribe = subscribe((change) => {
    if (change.type === 'favorites') renderList();
  });
  renderList();
  outlet.append(el('h1', { class: 'page-title' }, 'Избранное'), list);
  return () => {
    unsubscribe();
    cardDisposer.dispose();
  };
}
