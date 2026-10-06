import { getIngredientName } from '../../data/ingredients.js';
import { el } from '../../utils/dom.js';
import { pluralize } from '../../utils/format.js';
import { formatIngredientAmount } from '../../utils/quantities.js';

const SERVING_FORMS = ['порцию', 'порции', 'порций'];

function servingsLabel(servings) {
  return `На ${servings} ${pluralize(servings, SERVING_FORMS)}`;
}

function createIngredientRow(ingredient, baseServings) {
  return el(
    'li',
    { class: 'ingredients__item' },
    el(
      'span',
      { class: 'ingredients__name' },
      getIngredientName(ingredient.id),
      ingredient.note && el('span', { class: 'ingredients__note' }, ingredient.note),
      ingredient.optional && el('span', { class: 'ingredients__note' }, 'по желанию'),
    ),
    el(
      'span',
      { class: 'ingredients__amount' },
      formatIngredientAmount(ingredient, baseServings, baseServings),
    ),
  );
}

export function createIngredientsSection(recipe) {
  const element = el(
    'section',
    { class: 'ingredients', 'aria-labelledby': 'ingredients-title' },
    el(
      'div',
      { class: 'ingredients__header' },
      el('h2', { class: 'section-title', id: 'ingredients-title' }, 'Ингредиенты'),
      el('p', { class: 'ingredients__servings' }, servingsLabel(recipe.servings)),
    ),
    el(
      'ul',
      { class: 'ingredients__list' },
      recipe.ingredients.map((ingredient) => createIngredientRow(ingredient, recipe.servings)),
    ),
  );
  return { element };
}
