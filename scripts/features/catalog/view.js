import { createRecipeCard } from '../../components/recipe-card.js';
import { setPageTitle } from '../../core/router.js';
import { recipes } from '../../data/recipes.js';
import { createDisposer, el } from '../../utils/dom.js';

export function mount(outlet) {
  const disposer = createDisposer();
  setPageTitle('Рецепты');
  const cards = recipes.map((recipe, index) => {
    const card = createRecipeCard(recipe, { eager: index < 3 });
    disposer.add(card.dispose);
    return card.element;
  });
  outlet.append(
    el('h1', { class: 'page-title' }, 'Рецепты'),
    el('div', { class: 'recipe-grid' }, cards),
  );
  return disposer.dispose;
}
