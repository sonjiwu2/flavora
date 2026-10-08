import { CATEGORIES, getCategoryLabel } from '../../data/categories.js';
import { ingredients } from '../../data/ingredients.js';
import { normalizeSearchText, pluralize } from '../../utils/format.js';

export const TIME_LIMITS = Object.freeze([null, 15, 30, 60]);
export const CATALOG_SORTS = Object.freeze(['default', 'title', 'fastest', 'slowest']);
export const FAVORITE_SORTS = Object.freeze(['recent', 'title', 'fastest']);
export const STAPLES_NAMED_IN_HINT = Object.freeze([
  'salt',
  'black-pepper',
  'water',
  'pasta-water',
  'vegetable-oil',
]);

const LIST_SEPARATOR = ',';
const DEFAULT_CONTEXT = Object.freeze({ ingredients, categories: CATEGORIES, getCategoryLabel });

export function createDefaultFilters() {
  return {
    query: '',
    category: null,
    maxMinutes: null,
    owned: [],
    onlyOwned: false,
    excluded: [],
    sort: 'default',
  };
}

export function cloneFilters(filters) {
  return { ...filters, owned: [...filters.owned], excluded: [...filters.excluded] };
}

export function resetFilters(filters) {
  return { ...createDefaultFilters(), sort: filters.sort };
}

export function formatTimeLimit(maxMinutes) {
  return maxMinutes === null ? 'Любое' : `До ${maxMinutes} минут`;
}

export function formatFoundCount(count) {
  if (count === 0) return 'Ничего не найдено';
  return `Найдено ${count} ${pluralize(count, ['блюдо', 'блюда', 'блюд'])}`;
}

export function formatPreviewCount(count) {
  if (count === 0) return 'По этим фильтрам ничего не найдётся';
  return `Будет показано: ${count} ${pluralize(count, ['блюдо', 'блюда', 'блюд'])}`;
}

export function formatSavedCount(shown, total) {
  if (shown !== total) return `Найдено ${shown} из ${total}`;
  return `${total} ${pluralize(total, ['рецепт', 'рецепта', 'рецептов'])}`;
}

export function formatPantryMatch(pantry) {
  const products = pluralize(pantry.total, ['продукта', 'продуктов', 'продуктов']);
  return `Есть ${pantry.matched} из ${pantry.total} ${products}`;
}

function isKnownIngredient(ingredientId, context) {
  return Object.hasOwn(context.ingredients, ingredientId);
}

function isPantryIngredient(ingredientId, context) {
  return (
    isKnownIngredient(ingredientId, context) && context.ingredients[ingredientId].staple !== true
  );
}

function uniqueIds(ids) {
  return [...new Set(ids)];
}

export function normalizeFilters(filters, context = DEFAULT_CONTEXT) {
  const defaults = createDefaultFilters();
  const excluded = uniqueIds(filters.excluded ?? []).filter((id) => isKnownIngredient(id, context));
  const owned = uniqueIds(filters.owned ?? []).filter(
    (id) => isPantryIngredient(id, context) && !excluded.includes(id),
  );
  const hasCategory = context.categories.some((category) => category.id === filters.category);
  return {
    query: typeof filters.query === 'string' ? filters.query : defaults.query,
    category: hasCategory ? filters.category : defaults.category,
    maxMinutes: TIME_LIMITS.includes(filters.maxMinutes) ? filters.maxMinutes : defaults.maxMinutes,
    owned,
    onlyOwned: filters.onlyOwned === true && owned.length > 0,
    excluded,
    sort: CATALOG_SORTS.includes(filters.sort) ? filters.sort : defaults.sort,
  };
}

export function addOwned(filters, ingredientId) {
  return {
    ...filters,
    owned: uniqueIds([...filters.owned, ingredientId]),
    excluded: filters.excluded.filter((id) => id !== ingredientId),
  };
}

export function addExcluded(filters, ingredientId) {
  const owned = filters.owned.filter((id) => id !== ingredientId);
  return {
    ...filters,
    owned,
    onlyOwned: filters.onlyOwned && owned.length > 0,
    excluded: uniqueIds([...filters.excluded, ingredientId]),
  };
}

export function removeOwned(filters, ingredientId) {
  const owned = filters.owned.filter((id) => id !== ingredientId);
  return { ...filters, owned, onlyOwned: filters.onlyOwned && owned.length > 0 };
}

export function removeExcluded(filters, ingredientId) {
  return { ...filters, excluded: filters.excluded.filter((id) => id !== ingredientId) };
}

export function serializeFilters(filters) {
  return {
    q: filters.query.trim(),
    category: filters.category,
    time: filters.maxMinutes,
    have: filters.owned.join(LIST_SEPARATOR),
    only: filters.onlyOwned ? '1' : '',
    without: filters.excluded.join(LIST_SEPARATOR),
    sort: filters.sort === 'default' ? '' : filters.sort,
  };
}

function splitList(value) {
  return typeof value === 'string' && value !== '' ? value.split(LIST_SEPARATOR) : [];
}

export function parseFilters(query, context = DEFAULT_CONTEXT) {
  return normalizeFilters(
    {
      query: query.q,
      category: query.category,
      maxMinutes: query.time === undefined ? null : Number(query.time),
      owned: splitList(query.have),
      onlyOwned: query.only === '1',
      excluded: splitList(query.without),
      sort: query.sort,
    },
    context,
  );
}

export function describeActiveFilters(filters, context = DEFAULT_CONTEXT) {
  const name = (ingredientId) => context.ingredients[ingredientId]?.name ?? ingredientId;
  const active = [];
  const query = filters.query.trim();
  if (query !== '') {
    active.push({
      key: 'query',
      label: `Поиск: ${query}`,
      remove: (current) => ({ ...current, query: '' }),
    });
  }
  if (filters.category !== null) {
    active.push({
      key: 'category',
      label: context.getCategoryLabel(filters.category),
      remove: (current) => ({ ...current, category: null }),
    });
  }
  if (filters.maxMinutes !== null) {
    active.push({
      key: 'time',
      label: formatTimeLimit(filters.maxMinutes),
      remove: (current) => ({ ...current, maxMinutes: null }),
    });
  }
  for (const ingredientId of filters.owned) {
    active.push({
      key: `owned:${ingredientId}`,
      label: `Есть: ${name(ingredientId)}`,
      remove: (current) => removeOwned(current, ingredientId),
    });
  }
  if (filters.onlyOwned && filters.owned.length > 0) {
    active.push({
      key: 'only-owned',
      label: 'Только из выбранного',
      remove: (current) => ({ ...current, onlyOwned: false }),
    });
  }
  for (const ingredientId of filters.excluded) {
    active.push({
      key: `excluded:${ingredientId}`,
      label: `Без: ${name(ingredientId)}`,
      remove: (current) => removeExcluded(current, ingredientId),
    });
  }
  return active;
}

export function countPanelFilters(filters) {
  return describeActiveFilters(filters).filter((filter) => filter.key !== 'query').length;
}

export function listIngredientOptions({ includeStaples = false } = {}, context = DEFAULT_CONTEXT) {
  return Object.entries(context.ingredients)
    .filter(([, ingredient]) => includeStaples || ingredient.staple !== true)
    .map(([id, ingredient]) => ({ id, name: ingredient.name }))
    .sort((first, second) => first.name.localeCompare(second.name, 'ru'));
}

function rankSuggestion(name, words) {
  const nameWords = name.split(' ');
  if (!words.every((word) => name.includes(word))) return null;
  if (name.startsWith(words[0])) return 0;
  if (words.every((word) => nameWords.some((nameWord) => nameWord.startsWith(word)))) return 1;
  return 2;
}

export function suggestIngredients(options, text, selectedIds = []) {
  const selected = new Set(selectedIds);
  const available = options.filter((option) => !selected.has(option.id));
  const query = normalizeSearchText(text);
  if (query === '') return available;
  const words = query.split(' ');
  return available
    .map((option, position) => ({
      option,
      position,
      rank: rankSuggestion(normalizeSearchText(option.name), words),
    }))
    .filter((candidate) => candidate.rank !== null)
    .sort((first, second) => first.rank - second.rank || first.position - second.position)
    .map((candidate) => candidate.option);
}
