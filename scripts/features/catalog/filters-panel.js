import { openDialog } from '../../components/modal.js';
import { CATEGORIES } from '../../data/categories.js';
import { recipes } from '../../data/recipes.js';
import { el } from '../../utils/dom.js';
import { filterRecipes } from './filter-recipes.js';
import {
  TIME_LIMITS,
  addExcluded,
  addOwned,
  cloneFilters,
  formatPreviewCount,
  formatTimeLimit,
  listIngredientOptions,
  normalizeFilters,
  removeExcluded,
  removeOwned,
} from './filter-state.js';
import { createProductField } from './product-field.js';

const TEXT = Object.freeze({
  title: 'Фильтры',
  time: 'Время приготовления',
  timeHint: 'Общее время до готовности — вместе с выпечкой и охлаждением.',
  category: 'Тип блюда',
  anyCategory: 'Любой',
  pantry: 'Продукты дома',
  pantryHint:
    'Покажем рецепты, где есть хотя бы один из этих продуктов. Соль, перец, воду и масло добавлять не нужно — они всегда считаются под рукой.',
  pantryInput: 'Добавить продукт, который есть дома',
  pantryPlaceholder: 'Добавить ингредиент',
  pantryChips: 'Продукты дома',
  onlyOwned: 'Только из выбранного',
  onlyOwnedHint:
    'Останутся рецепты, для которых хватает выбранных продуктов. Необязательные добавки не в счёт.',
  onlyOwnedDisabledHint: 'Сначала добавьте хотя бы один продукт.',
  excluded: 'Исключить продукты',
  excludedHint: 'Рецепты с этими продуктами не показываются, даже если всё остальное подходит.',
  excludedInput: 'Добавить продукт, который нужно исключить',
  excludedPlaceholder: 'Выбрать продукт',
  excludedChips: 'Исключённые продукты',
  reset: 'Сбросить',
  apply: 'Применить',
});

let panelCount = 0;

function createGroup(legend, ...children) {
  return el(
    'fieldset',
    { class: 'filters-panel__group' },
    el('legend', { class: 'filters-panel__legend' }, legend),
    children,
  );
}

function createHint(text, id) {
  return el('p', { class: 'filters-panel__hint', id }, text);
}

export function openFiltersPanel({ filters, onApply, onReset }) {
  panelCount += 1;
  const idPrefix = `filters-panel-${panelCount}`;
  let draft = cloneFilters(filters);

  const timeButtons = TIME_LIMITS.map((limit) =>
    el(
      'button',
      {
        class: 'button button--secondary filters-panel__option',
        type: 'button',
        on: { click: () => change({ ...draft, maxMinutes: limit }) },
      },
      formatTimeLimit(limit),
    ),
  );

  const categorySelect = el(
    'select',
    {
      class: 'select',
      id: `${idPrefix}-category`,
      on: { change: () => change({ ...draft, category: categorySelect.value || null }) },
    },
    el('option', { value: '' }, TEXT.anyCategory),
    CATEGORIES.map((category) => el('option', { value: category.id }, category.label)),
  );

  const ownedField = createProductField({
    label: TEXT.pantryInput,
    placeholder: TEXT.pantryPlaceholder,
    chipsLabel: TEXT.pantryChips,
    options: listIngredientOptions(),
    selected: draft.owned,
    onAdd: (id) => change(addOwned(draft, id)),
    onRemove: (id) => change(removeOwned(draft, id)),
  });
  const excludedField = createProductField({
    label: TEXT.excludedInput,
    placeholder: TEXT.excludedPlaceholder,
    chipsLabel: TEXT.excludedChips,
    options: listIngredientOptions({ includeStaples: true }),
    selected: draft.excluded,
    onAdd: (id) => change(addExcluded(draft, id)),
    onRemove: (id) => change(removeExcluded(draft, id)),
  });

  const onlyOwnedHint = createHint('', `${idPrefix}-only-owned-hint`);
  const onlyOwnedInput = el('input', {
    class: 'switch__input',
    type: 'checkbox',
    role: 'switch',
    'aria-describedby': onlyOwnedHint.id,
    on: { change: () => change({ ...draft, onlyOwned: onlyOwnedInput.checked }) },
  });
  const onlyOwnedControl = el(
    'div',
    { class: 'filters-panel__switch-control' },
    el(
      'label',
      { class: 'switch' },
      onlyOwnedInput,
      el('span', { class: 'switch__track' }),
      el('span', { class: 'switch__label' }, TEXT.onlyOwned),
    ),
  );
  const onlyOwned = el('div', { class: 'filters-panel__switch' }, onlyOwnedControl, onlyOwnedHint);

  const preview = el('p', { class: 'filters-panel__preview', role: 'status' });

  function render() {
    TIME_LIMITS.forEach((limit, index) => {
      timeButtons[index].setAttribute('aria-pressed', String(draft.maxMinutes === limit));
    });
    categorySelect.value = draft.category ?? '';
    ownedField.setSelected(draft.owned);
    excludedField.setSelected(draft.excluded);
    const hasOwned = draft.owned.length > 0;
    onlyOwnedInput.disabled = !hasOwned;
    onlyOwnedInput.checked = draft.onlyOwned;
    onlyOwnedControl.toggleAttribute('data-disabled', !hasOwned);
    onlyOwnedHint.textContent = hasOwned ? TEXT.onlyOwnedHint : TEXT.onlyOwnedDisabledHint;
    preview.textContent = formatPreviewCount(filterRecipes(recipes, draft).length);
  }

  function change(nextDraft) {
    draft = nextDraft;
    render();
  }

  const body = el(
    'div',
    { class: 'filters-panel' },
    createGroup(
      TEXT.time,
      el('div', { class: 'filters-panel__options' }, timeButtons),
      createHint(TEXT.timeHint),
    ),
    el(
      'div',
      { class: 'filters-panel__group' },
      el('label', { class: 'filters-panel__legend', for: categorySelect.id }, TEXT.category),
      categorySelect,
    ),
    createGroup(TEXT.pantry, createHint(TEXT.pantryHint), ownedField.element, onlyOwned),
    createGroup(TEXT.excluded, createHint(TEXT.excludedHint), excludedField.element),
  );

  const footer = el(
    'div',
    { class: 'filters-panel__footer' },
    preview,
    el(
      'div',
      { class: 'filters-panel__actions' },
      el(
        'button',
        {
          class: 'button button--secondary',
          type: 'button',
          on: {
            click: () => {
              onReset();
              dialog.close();
            },
          },
        },
        TEXT.reset,
      ),
      el(
        'button',
        {
          class: 'button',
          type: 'button',
          on: {
            click: () => {
              onApply(normalizeFilters(draft));
              dialog.close();
            },
          },
        },
        TEXT.apply,
      ),
    ),
  );

  render();
  const dialog = openDialog({
    title: TEXT.title,
    body,
    footer,
    variant: 'side',
    onClose() {
      ownedField.dispose();
      excludedField.dispose();
    },
  });

  dialog.element.addEventListener('cancel', (event) => {
    const openField = [ownedField, excludedField].find((field) => field.isOpen());
    if (!openField) return;
    event.preventDefault();
    openField.close();
  });

  return dialog;
}
