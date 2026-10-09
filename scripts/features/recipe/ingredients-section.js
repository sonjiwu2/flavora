import { icon } from '../../components/icons.js';
import { getIngredientName } from '../../data/ingredients.js';
import { el } from '../../utils/dom.js';
import { pluralize } from '../../utils/format.js';
import { formatIngredientAmount } from '../../utils/quantities.js';

const MIN_SERVINGS = 1;
const DEFAULT_MAX_SERVINGS = 12;
const SERVING_FORMS = ['порцию', 'порции', 'порций'];
const TICK_CLASS = 'is-ticking';

export function describeServings(servings) {
  return `${servings} ${pluralize(servings, SERVING_FORMS)}`;
}

function replayTick(elements) {
  if (elements.length === 0) return;
  for (const element of elements) element.classList.remove(TICK_CLASS);
  elements[0].getBoundingClientRect();
  for (const element of elements) element.classList.add(TICK_CLASS);
}

function createIngredientRow(ingredient) {
  const amount = el('span', { class: 'ingredients__amount' });
  const element = el(
    'li',
    { class: 'ingredients__item' },
    el(
      'span',
      { class: 'ingredients__name' },
      getIngredientName(ingredient.id),
      ingredient.note && el('span', { class: 'ingredients__note' }, ingredient.note),
      ingredient.optional && el('span', { class: 'ingredients__note' }, 'по желанию'),
    ),
    amount,
  );
  return { element, amount, ingredient };
}

function createStepperButton(iconName, label, onClick) {
  return el(
    'button',
    {
      class: 'icon-button servings__button',
      type: 'button',
      'aria-label': label,
      on: { click: onClick },
    },
    icon(iconName),
  );
}

export function createIngredientsSection(recipe, { onServingsChange }) {
  const maxServings = Math.max(DEFAULT_MAX_SERVINGS, recipe.servings * 2);
  const rows = recipe.ingredients.map(createIngredientRow);
  const value = el('p', {
    class: 'servings__value',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });
  const decrease = createStepperButton('minus', 'Уменьшить число порций', () => change(-1));
  const increase = createStepperButton('plus', 'Увеличить число порций', () => change(1));
  let servings = recipe.servings;

  function render() {
    const changed = [];
    value.textContent = `На ${describeServings(servings)}`;
    decrease.disabled = servings <= MIN_SERVINGS;
    increase.disabled = servings >= maxServings;
    for (const row of rows) {
      const text = formatIngredientAmount(row.ingredient, recipe.servings, servings);
      if (row.amount.textContent === text) continue;
      row.amount.textContent = text;
      changed.push(row.amount);
    }
    return changed;
  }

  function change(delta) {
    servings = Math.min(maxServings, Math.max(MIN_SERVINGS, servings + delta));
    replayTick([value, ...render()]);
    onServingsChange(servings);
    if (decrease.disabled) increase.focus();
    if (increase.disabled) decrease.focus();
  }

  render();
  const element = el(
    'section',
    { class: 'ingredients', 'aria-labelledby': 'ingredients-title' },
    el(
      'div',
      { class: 'ingredients__header' },
      el('h2', { class: 'section-title', id: 'ingredients-title' }, 'Ингредиенты'),
      el(
        'div',
        { class: 'servings', role: 'group', 'aria-label': 'Количество порций' },
        value,
        decrease,
        el('span', { class: 'servings__divider', 'aria-hidden': 'true' }),
        increase,
      ),
    ),
    el(
      'ul',
      { class: 'ingredients__list', role: 'list' },
      rows.map((row) => row.element),
    ),
  );
  return { element };
}
