import { createRecipeCard } from '../../components/recipe-card.js';
import { buildHref, setPageTitle } from '../../core/router.js';
import { getFavorites, subscribe } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { createDisposer, el, listen } from '../../utils/dom.js';
import {
  createCategoryTabs,
  createResultAnnouncer,
  createSearchField,
  createSortControl,
  syncChildren,
} from '../catalog/controls.js';
import { selectRecipes } from '../catalog/filter-recipes.js';
import { FAVORITE_SORTS, formatSavedCount } from '../catalog/filter-state.js';

const EAGER_CARD_COUNT = 3;

const TEXT = Object.freeze({
  title: 'Избранное',
  subtitle: 'Сохранённые рецепты',
  searchLabel: 'Поиск среди сохранённых рецептов',
  searchPlaceholder: 'Поиск среди сохранённых рецептов',
  searchCompactPlaceholder: 'Поиск в избранном',
  categories: 'Категории сохранённых рецептов',
  sort: 'Сортировка',
  emptyTitle: 'Здесь пока пусто',
  emptyText: 'Нажмите на сердечко у понравившегося рецепта — и он появится на этой странице.',
  emptyAction: 'Перейти к рецептам',
  storageNote: 'Список хранится только в этом браузере.',
  notFoundTitle: 'Среди сохранённых ничего не найдено',
  notFoundText: 'Попробуйте другой запрос или категорию — сами рецепты остались в избранном.',
  notFoundAction: 'Сбросить поиск',
});

const SORT_LABELS = Object.freeze({
  recent: 'По дате добавления',
  title: 'По названию',
  fastest: 'Сначала быстрые',
});

const SORT_OPTIONS = FAVORITE_SORTS.map((value) => ({ value, label: SORT_LABELS[value] }));

let savedView = { query: '', category: null, sort: FAVORITE_SORTS[0] };

function readSavedRecipes() {
  const favorites = getFavorites().reverse();
  return {
    saved: favorites.map((favorite) => getRecipe(favorite.id)).filter(Boolean),
    addedAt: new Map(favorites.map((favorite) => [favorite.id, favorite.addedAt])),
  };
}

export function mount(outlet) {
  const disposer = createDisposer();
  const cards = new Map();
  let view = savedView;

  setPageTitle(TEXT.title);

  const search = createSearchField({
    label: TEXT.searchLabel,
    placeholder: TEXT.searchPlaceholder,
    compactPlaceholder: TEXT.searchCompactPlaceholder,
    value: view.query,
    className: 'favorites__search-field',
  });
  const sortControl = createSortControl({
    label: TEXT.sort,
    options: SORT_OPTIONS,
    value: view.sort,
    onChange: (sort) => apply({ ...view, sort }),
    className: 'favorites__sort',
  });
  const tabs = createCategoryTabs({
    label: TEXT.categories,
    selected: view.category,
    onSelect: (category) => apply({ ...view, category }),
  });
  const count = el('p', { class: 'result-count', tabindex: '-1' });
  const announcer = createResultAnnouncer();
  const controls = el(
    'div',
    { class: 'favorites__controls' },
    el('div', { class: 'favorites__search', role: 'search' }, search.element, sortControl.element),
    tabs.element,
    count,
  );

  const grid = el('div', { class: 'recipe-grid' });
  const emptyState = el(
    'div',
    { class: 'empty-state' },
    el('h2', { class: 'empty-state__title' }, TEXT.emptyTitle),
    el('p', { class: 'empty-state__text' }, TEXT.emptyText),
    el('a', { class: 'button', href: buildHref('/recipes') }, TEXT.emptyAction),
    el('p', { class: 'favorites__storage-note' }, TEXT.storageNote),
  );
  const notFoundState = el(
    'div',
    { class: 'empty-state' },
    el('h2', { class: 'empty-state__title' }, TEXT.notFoundTitle),
    el('p', { class: 'empty-state__text' }, TEXT.notFoundText),
    el(
      'button',
      { class: 'button', type: 'button', on: { click: resetSearch } },
      TEXT.notFoundAction,
    ),
  );
  const results = el('div', { class: 'favorites__results' });

  function cardFor(recipe) {
    let card = cards.get(recipe.id);
    if (!card) {
      card = createRecipeCard(recipe, {
        eager: cards.size < EAGER_CARD_COUNT,
        priority: cards.size === 0,
      });
      cards.set(recipe.id, card);
    }
    return card.element;
  }

  function dropRemovedCards(saved) {
    const savedIds = new Set(saved.map((recipe) => recipe.id));
    for (const [recipeId, card] of cards) {
      if (savedIds.has(recipeId)) continue;
      card.dispose();
      cards.delete(recipeId);
    }
  }

  function pickContent(savedCount, shownCount) {
    if (savedCount === 0) return emptyState;
    return shownCount === 0 ? notFoundState : grid;
  }

  function render() {
    const { saved, addedAt } = readSavedRecipes();
    const entries = selectRecipes(saved, view, { addedAt });
    dropRemovedCards(saved);
    syncChildren(
      grid,
      entries.map((entry) => cardFor(entry.recipe)),
    );
    if (search.input.value !== view.query) search.input.value = view.query;
    sortControl.update(SORT_OPTIONS, view.sort);
    tabs.setSelected(view.category);
    controls.hidden = saved.length === 0;
    count.textContent = formatSavedCount(entries.length, saved.length);
    const content = pickContent(saved.length, entries.length);
    if (results.firstChild !== content) results.replaceChildren(content);
  }

  function apply(nextView, { immediate = true } = {}) {
    view = nextView;
    savedView = view;
    render();
    announcer.announce(count.textContent, { immediate });
  }

  function resetSearch() {
    apply({ ...view, query: '', category: null });
    count.focus();
  }

  function restoreFocus(removedIndex) {
    const neighbour = grid.children[removedIndex] ?? grid.children[grid.children.length - 1];
    const target =
      neighbour?.querySelector('.favorite-button') ??
      results.querySelector('a[href], button') ??
      count;
    target.focus();
  }

  function handleFavoritesChange() {
    const focusedCard = document.activeElement?.closest('.recipe-card') ?? null;
    const focusedIndex = focusedCard ? [...grid.children].indexOf(focusedCard) : -1;
    render();
    if (focusedIndex !== -1 && !focusedCard.isConnected) restoreFocus(focusedIndex);
  }

  disposer.add(search.dispose);
  disposer.add(tabs.dispose);
  disposer.add(announcer.dispose);
  disposer.add(() => {
    for (const card of cards.values()) card.dispose();
    cards.clear();
  });
  disposer.add(
    subscribe((change) => {
      if (change.type === 'favorites') handleFavoritesChange();
    }),
  );
  disposer.add(
    listen(search.input, 'input', () =>
      apply({ ...view, query: search.input.value }, { immediate: false }),
    ),
  );

  outlet.append(
    el(
      'div',
      { class: 'favorites' },
      el(
        'header',
        { class: 'favorites__header' },
        el('h1', { class: 'page-title' }, TEXT.title),
        el('p', { class: 'page-subtitle' }, TEXT.subtitle),
      ),
      controls,
      announcer.element,
      results,
    ),
  );

  render();
  return disposer.dispose;
}
