import { createFavoriteButton } from '../../components/favorite-button.js';
import { buildHref, setPageTitle } from '../../core/router.js';
import { getIngredientName } from '../../data/ingredients.js';
import { getRecipe } from '../../data/recipes.js';
import { el } from '../../utils/dom.js';
import { openAddToMenu } from '../menu/add-to-menu.js';
import { mount as mountNotFound } from '../shell/not-found.js';

export function mount(outlet, route) {
  const recipe = getRecipe(route.params.id);
  if (!recipe) return mountNotFound(outlet, route);

  setPageTitle(recipe.title);
  const favorite = createFavoriteButton(recipe);
  outlet.append(
    el('a', { class: 'back-link', href: buildHref('/recipes') }, 'Все рецепты'),
    el('h1', { class: 'page-title' }, recipe.title),
    favorite.element,
    el(
      'button',
      { class: 'button', type: 'button', on: { click: () => openAddToMenu(recipe.id) } },
      'В меню',
    ),
    el('h2', {}, 'Ингредиенты'),
    el(
      'ul',
      {},
      recipe.ingredients.map((ingredient) => el('li', {}, getIngredientName(ingredient.id))),
    ),
    el('h2', {}, 'Приготовление'),
    el(
      'ol',
      {},
      recipe.steps.map((step) => el('li', {}, step.title)),
    ),
  );
  return favorite.dispose;
}
