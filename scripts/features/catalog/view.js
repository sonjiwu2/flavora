import { icon } from '../../components/icons.js';
import { createRecipeCard } from '../../components/recipe-card.js';
import { buildHref, setPageTitle } from '../../core/router.js';
import { recipes } from '../../data/recipes.js';
import { createDisposer, el, listen } from '../../utils/dom.js';
import {
  createCategoryTabs,
  createChip,
  createResultAnnouncer,
  createSearchField,
  createSortControl,
  focusAfterRemoval,
  syncChildren,
} from './controls.js';
import { selectRecipes } from './filter-recipes.js';
import {
  QUICK_TIME_LIMIT,
  countPanelFilters,
  createDefaultFilters,
  describeActiveFilters,
  formatFoundCount,
  formatPantryMatch,
  formatTimeLimit,
  normalizeFilters,
  parseFilters,
  resetFilters,
  serializeFilters,
  toggleQuickTime,
} from './filter-state.js';
import { openFiltersPanel } from './filters-panel.js';

const ROUTE_PATH = '/recipes';
const EAGER_CARD_COUNT = 3;
const ADDRESS_DELAY_MS = 300;

const TEXT = Object.freeze({
  title: 'Рецепты',
  searchLabel: 'Поиск по названию, категории или ингредиенту',
  searchPlaceholder: 'Найти рецепт или ингредиент',
  searchCompactPlaceholder: 'Блюдо или продукт',
  submit: 'Найти',
  categories: 'Категории',
  filters: 'Фильтры',
  filtersCountPrefix: 'выбрано: ',
  activeFilters: 'Активные фильтры',
  removeFilterPrefix: 'Убрать фильтр: ',
  resetAll: 'Сбросить всё',
  sort: 'Сортировка',
  sortDefault: 'По умолчанию',
  sortByMatches: 'По числу совпадений',
  emptyTitle: 'Ничего не нашлось',
  emptyText:
    'Попробуйте изменить запрос или убрать часть фильтров. Избранное и меню останутся как есть.',
  emptyAction: 'Сбросить поиск и фильтры',
});

let savedFilters = createDefaultFilters();

function sortOptions(filters) {
  return [
    {
      value: 'default',
      label: filters.owned.length > 0 ? TEXT.sortByMatches : TEXT.sortDefault,
    },
    { value: 'title', label: 'По названию' },
    { value: 'fastest', label: 'Сначала быстрые' },
    { value: 'slowest', label: 'Сначала долгие' },
  ];
}

function readInitialFilters(route) {
  return Object.keys(route.query ?? {}).length > 0 ? parseFilters(route.query) : savedFilters;
}

export function mount(outlet, route) {
  const disposer = createDisposer();
  const cards = new Map();
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  let filters = readInitialFilters(route);
  let panel = null;
  let addressTimer = null;

  setPageTitle(TEXT.title);

  const search = createSearchField({
    label: TEXT.searchLabel,
    placeholder: TEXT.searchPlaceholder,
    compactPlaceholder: TEXT.searchCompactPlaceholder,
    value: filters.query,
    className: 'catalog__search-field',
  });
  const searchForm = el(
    'form',
    { class: 'catalog__search', role: 'search', novalidate: true },
    search.element,
    el(
      'button',
      { class: 'button catalog__submit', type: 'submit' },
      el('span', { class: 'catalog__submit-label' }, TEXT.submit),
      icon('arrow-right'),
    ),
  );

  const tabs = createCategoryTabs({
    label: TEXT.categories,
    selected: filters.category,
    onSelect: (category) => apply({ ...filters, category }),
  });
  const quickTime = el(
    'button',
    {
      class: 'button button--secondary catalog__toggle',
      type: 'button',
      on: { click: () => apply(toggleQuickTime(filters)) },
    },
    icon('clock'),
    formatTimeLimit(QUICK_TIME_LIMIT),
  );
  const filtersCount = el('span', { class: 'catalog__filters-count', hidden: true });
  const filtersButton = el(
    'button',
    {
      class: 'button button--secondary catalog__filters-button',
      type: 'button',
      'aria-haspopup': 'dialog',
      on: { click: openPanel },
    },
    icon('filters'),
    TEXT.filters,
    filtersCount,
  );

  const count = el('p', { class: 'result-count catalog__count', tabindex: '-1' });
  const announcer = createResultAnnouncer();
  const sortControl = createSortControl({
    label: TEXT.sort,
    options: sortOptions(filters),
    value: filters.sort,
    onChange: (sort) => apply({ ...filters, sort }),
    className: 'catalog__sort',
  });
  const chipList = el('ul', {
    class: 'catalog__chips',
    'aria-label': TEXT.activeFilters,
    hidden: true,
  });
  const resetItem = el(
    'li',
    { class: 'catalog__reset' },
    el(
      'button',
      { class: 'button button--quiet button--small', type: 'button', on: { click: resetAll } },
      TEXT.resetAll,
    ),
  );

  const grid = el('div', { class: 'recipe-grid' });
  const emptyState = el(
    'div',
    { class: 'empty-state' },
    el('h2', { class: 'empty-state__title' }, TEXT.emptyTitle),
    el('p', { class: 'empty-state__text' }, TEXT.emptyText),
    el('button', { class: 'button', type: 'button', on: { click: resetAll } }, TEXT.emptyAction),
  );
  const results = el('div', { class: 'catalog__results' });

  function cancelAddressTimer() {
    if (addressTimer !== null) window.clearTimeout(addressTimer);
    addressTimer = null;
  }

  function writeAddress() {
    cancelAddressTimer();
    const href = buildHref(ROUTE_PATH, serializeFilters(filters));
    const currentHash = window.location.hash;
    if (currentHash === href) return;
    if (!href.includes('?') && !currentHash.includes('?')) return;
    window.history.replaceState(window.history.state, '', href);
  }

  function scheduleAddress() {
    cancelAddressTimer();
    addressTimer = window.setTimeout(writeAddress, ADDRESS_DELAY_MS);
  }

  function flushAddress() {
    if (addressTimer !== null) writeAddress();
  }

  function cardFor(entry) {
    let card = cards.get(entry.recipe.id);
    if (!card) {
      card = createRecipeCard(entry.recipe, {
        eager: cards.size < EAGER_CARD_COUNT,
        priority: cards.size === 0,
      });
      cards.set(entry.recipe.id, card);
      disposer.add(card.dispose);
    }
    card.setMatchLabel(entry.pantry ? formatPantryMatch(entry.pantry) : null);
    return card.element;
  }

  function renderResults(entries) {
    syncChildren(grid, entries.map(cardFor));
    const content = entries.length > 0 ? grid : emptyState;
    if (results.firstChild !== content) results.replaceChildren(content);
  }

  function renderActiveFilters() {
    const active = describeActiveFilters(filters);
    const chips = active.map((filter, index) =>
      createChip(filter.label, {
        removeLabel: `${TEXT.removeFilterPrefix}${filter.label}`,
        onRemove: () => removeFilter(filter, index),
      }),
    );
    chipList.replaceChildren(...chips.map((chip) => chip.element), resetItem);
    chipList.hidden = active.length === 0;
  }

  function renderFiltersCount() {
    const selectedCount = countPanelFilters(filters);
    filtersCount.hidden = selectedCount === 0;
    filtersCount.replaceChildren(
      el('span', { class: 'visually-hidden' }, TEXT.filtersCountPrefix),
      String(selectedCount),
    );
  }

  function render() {
    const entries = selectRecipes(recipes, filters);
    if (search.input.value !== filters.query) search.input.value = filters.query;
    tabs.setSelected(filters.category);
    quickTime.setAttribute('aria-pressed', String(filters.maxMinutes === QUICK_TIME_LIMIT));
    renderFiltersCount();
    sortControl.update(sortOptions(filters), filters.sort);
    count.textContent = formatFoundCount(entries.length);
    renderActiveFilters();
    renderResults(entries);
  }

  function apply(nextFilters, { immediate = true, typing = false } = {}) {
    filters = normalizeFilters(nextFilters);
    savedFilters = filters;
    render();
    announcer.announce(count.textContent, { immediate });
    if (typing) scheduleAddress();
    else writeAddress();
  }

  function resetAll() {
    apply(resetFilters(filters));
    count.focus();
  }

  function removeFilter(filter, index) {
    apply(filter.remove(filters));
    focusAfterRemoval([...chipList.querySelectorAll('.chip__remove')], index, count);
  }

  function openPanel() {
    panel = openFiltersPanel({
      filters,
      onApply: (nextFilters) => apply(nextFilters),
      onReset: () => apply(resetFilters(filters)),
    });
  }

  function submitSearch(event) {
    event.preventDefault();
    apply({ ...filters, query: search.input.value });
    if (coarsePointer.matches) search.input.blur();
  }

  disposer.add(search.dispose);
  disposer.add(tabs.dispose);
  disposer.add(announcer.dispose);
  disposer.add(cancelAddressTimer);
  disposer.add(() => panel?.close());
  disposer.add(
    listen(search.input, 'input', () =>
      apply({ ...filters, query: search.input.value }, { immediate: false, typing: true }),
    ),
  );
  disposer.add(listen(search.input, 'blur', flushAddress));
  disposer.add(listen(searchForm, 'submit', submitSearch));

  outlet.append(
    el(
      'div',
      { class: 'catalog' },
      el('h1', { class: 'page-title' }, TEXT.title),
      searchForm,
      el(
        'div',
        { class: 'catalog__toolbar' },
        tabs.element,
        el('div', { class: 'catalog__quick' }, quickTime, filtersButton),
      ),
      el('div', { class: 'catalog__status' }, count, sortControl.element, chipList),
      announcer.element,
      results,
    ),
  );

  savedFilters = filters;
  render();
  writeAddress();
  return disposer.dispose;
}
