import { buildHref, setPageTitle } from '../../core/router.js';
import { getFavorites, subscribe } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { createDisposer, el, listen } from '../../utils/dom.js';
import {
  createCardPool,
  createCategoryTabs,
  createEmptyState,
  createResultAnnouncer,
  createSearchField,
  createSortControl,
  syncChildren,
} from '../catalog/controls.js';
import { selectRecipes } from '../catalog/filter-recipes.js';
import { FAVORITE_SORTS, formatSavedCount } from '../catalog/filter-state.js';
import {
  captureLayout,
  fadeOutInPlace,
  refreshSoftly,
  settleFromLayout,
} from '../catalog/motion.js';

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
  const cards = createCardPool();
  let view = savedView;

  setPageTitle(TEXT.title);

  const search = createSearchField({
    label: TEXT.searchLabel,
    placeholder: TEXT.searchPlaceholder,
    compactPlaceholder: TEXT.searchCompactPlaceholder,
    value: view.query,
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
    className: 'favorites__tabs',
  });
  const count = el('p', { class: 'result-count favorites__count', tabindex: '-1' });
  const announcer = createResultAnnouncer();
  const controls = el(
    'div',
    { class: 'favorites__controls' },
    el('div', { class: 'favorites__search', role: 'search' }, search.element),
    tabs.element,
    count,
    sortControl.element,
  );

  const grid = el('div', { class: 'recipe-grid', dataset: { entering: '' } });
  const emptyState = createEmptyState(
    TEXT.emptyTitle,
    TEXT.emptyText,
    el('a', { class: 'button', href: buildHref('/recipes') }, TEXT.emptyAction),
    el('p', { class: 'favorites__storage-note' }, TEXT.storageNote),
  );
  const notFoundState = createEmptyState(
    TEXT.notFoundTitle,
    TEXT.notFoundText,
    el(
      'button',
      { class: 'button', type: 'button', on: { click: resetSearch } },
      TEXT.notFoundAction,
    ),
  );
  const results = el('div', { class: 'recipe-list__results' });

  function pickContent(savedCount, shownCount) {
    if (savedCount === 0) return emptyState;
    return shownCount === 0 ? notFoundState : grid;
  }

  function render() {
    const { saved, addedAt } = readSavedRecipes();
    const entries = selectRecipes(saved, view, { addedAt });
    const removed = cards.prune(new Set(saved.map((recipe) => recipe.id)));
    syncChildren(
      grid,
      entries.map((entry) => cards.take(entry.recipe).element),
    );
    if (search.input.value !== view.query) search.input.value = view.query;
    sortControl.update(SORT_OPTIONS, view.sort);
    tabs.setSelected(view.category);
    controls.hidden = saved.length === 0;
    count.textContent = formatSavedCount(entries.length, saved.length);
    const content = pickContent(saved.length, entries.length);
    if (results.firstChild !== content) results.replaceChildren(content);
    return removed;
  }

  function apply(nextView, { immediate = true } = {}) {
    const shownBefore = [...grid.children];
    view = nextView;
    savedView = view;
    delete grid.dataset.entering;
    render();
    const isChanged =
      shownBefore.length !== grid.children.length ||
      shownBefore.some((card, index) => card !== grid.children[index]);
    if (isChanged) refreshSoftly(results);
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
    const previousLayout = captureLayout(grid.children);
    delete grid.dataset.entering;
    const removed = render();
    for (const card of removed) fadeOutInPlace(card, previousLayout.get(card), results);
    settleFromLayout(previousLayout, grid.children);
    if (focusedIndex !== -1 && !grid.contains(focusedCard)) restoreFocus(focusedIndex);
  }

  disposer.add(search.dispose);
  disposer.add(tabs.dispose);
  disposer.add(announcer.dispose);
  disposer.add(cards.dispose);
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
      { class: 'recipe-list' },
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
