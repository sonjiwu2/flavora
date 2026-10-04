import { icon } from '../../components/icons.js';
import { getFavorites } from '../../core/store.js';
import { CATEGORIES, getCategoryLabel } from '../../data/categories.js';
import { getRecipe, recipes } from '../../data/recipes.js';
import { el } from '../../utils/dom.js';
import { pluralize } from '../../utils/format.js';
import { openMenuDialog } from './dialog.js';
import { createDishThumb, createDurationMeta } from './dish.js';
import { filterRecipes, pickRecentFavorites } from './planner.js';

const FAVORITES_LIMIT = 6;
const RECIPE_FORMS = ['рецепт', 'рецепта', 'рецептов'];

function describeCount(count) {
  if (count === 0) return 'Ничего не нашлось';
  return `Найдено: ${count} ${pluralize(count, RECIPE_FORMS)}`;
}

function getFavoriteRecipes() {
  return pickRecentFavorites(getFavorites(), FAVORITES_LIMIT).map(getRecipe).filter(Boolean);
}

export function openRecipePicker({ title, context, currentRecipeId = null, onSelect, onClose }) {
  const filters = { query: '', category: '' };
  const favoriteRecipes = getFavoriteRecipes();

  const searchInput = el('input', {
    class: 'search-field__input',
    type: 'search',
    autofocus: true,
    autocomplete: 'off',
    enterkeyhint: 'search',
    placeholder: 'Название блюда',
    'aria-label': 'Поиск по названию',
  });
  const categorySelect = el(
    'select',
    { class: 'select' },
    el('option', { value: '' }, 'Все категории'),
    CATEGORIES.map((category) => el('option', { value: category.id }, category.label)),
  );
  const status = el('p', { class: 'recipe-picker__status', role: 'status' });
  const results = el('div', { class: 'recipe-picker__results' });

  function isFiltered() {
    return filters.query.trim() !== '' || filters.category !== '';
  }

  function choose(recipe) {
    onSelect(recipe.id);
    dialog.close();
  }

  function createOption(recipe) {
    const isCurrent = recipe.id === currentRecipeId;
    return el(
      'li',
      {},
      el(
        'button',
        {
          class: 'recipe-option',
          type: 'button',
          'aria-current': isCurrent ? 'true' : null,
          on: { click: () => choose(recipe) },
        },
        createDishThumb(recipe, 'recipe-option__thumb'),
        el(
          'span',
          { class: 'recipe-option__text' },
          el('span', { class: 'recipe-option__title' }, recipe.title),
          el(
            'span',
            { class: 'recipe-option__details' },
            createDurationMeta(recipe),
            el('span', { class: 'recipe-option__category' }, getCategoryLabel(recipe.category)),
          ),
          isCurrent ? el('span', { class: 'recipe-option__note' }, 'сейчас в меню') : null,
        ),
      ),
    );
  }

  function createList(list, label) {
    return el('ul', { class: 'recipe-picker__list', 'aria-label': label }, list.map(createOption));
  }

  function createSection(heading, list) {
    return el(
      'section',
      { class: 'recipe-picker__section' },
      el('h3', { class: 'recipe-picker__heading' }, heading),
      createList(list, heading),
    );
  }

  function resetFilters() {
    filters.query = '';
    filters.category = '';
    searchInput.value = '';
    categorySelect.value = '';
    renderResults();
    searchInput.focus();
  }

  function createEmptyState() {
    return el(
      'div',
      { class: 'empty-state' },
      el('p', { class: 'empty-state__title' }, 'Ничего не нашлось'),
      el('p', { class: 'empty-state__text' }, 'Попробуйте другое название или категорию.'),
      el(
        'button',
        { class: 'button button--secondary', type: 'button', on: { click: resetFilters } },
        'Сбросить поиск',
      ),
    );
  }

  function createUnfilteredSections() {
    const sections = [createSection('Все рецепты', recipes)];
    if (favoriteRecipes.length > 0) {
      sections.unshift(createSection('Из избранного', favoriteRecipes));
    }
    return sections;
  }

  function renderResults() {
    const matches = filterRecipes(recipes, filters);
    status.textContent = isFiltered() ? describeCount(matches.length) : '';
    if (matches.length === 0) results.replaceChildren(createEmptyState());
    else if (isFiltered()) results.replaceChildren(createList(matches, 'Найденные рецепты'));
    else results.replaceChildren(...createUnfilteredSections());
  }

  searchInput.addEventListener('input', () => {
    filters.query = searchInput.value;
    renderResults();
  });
  searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown') return;
    const firstOption = results.querySelector('.recipe-option');
    if (!firstOption) return;
    event.preventDefault();
    firstOption.focus();
  });
  categorySelect.addEventListener('change', () => {
    filters.category = categorySelect.value;
    renderResults();
  });

  renderResults();
  const body = el(
    'div',
    { class: 'recipe-picker' },
    el('p', { class: 'recipe-picker__context' }, context),
    el(
      'div',
      { class: 'recipe-picker__filters' },
      el('label', { class: 'search-field' }, icon('search'), searchInput),
      el(
        'label',
        { class: 'field' },
        el('span', { class: 'field__label' }, 'Категория'),
        categorySelect,
      ),
    ),
    status,
    results,
  );
  const dialog = openMenuDialog({ title, body, variant: 'side', onClose });
  return dialog;
}
