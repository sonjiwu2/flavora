import { setPageTitle } from '../../core/router.js';
import { getMenu } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { el } from '../../utils/dom.js';

export function mount(outlet) {
  setPageTitle('Меню на неделю');
  const entries = Object.entries(getMenu()).flatMap(([date, meals]) =>
    Object.entries(meals).map(([meal, recipeId]) =>
      el('li', {}, `${date} · ${meal} · ${getRecipe(recipeId).title}`),
    ),
  );
  outlet.append(el('h1', { class: 'page-title' }, 'Меню на неделю'), el('ul', {}, entries));
}
