import { getCategoryLabel } from '../../data/categories.js';
import { ingredients } from '../../data/ingredients.js';
import { normalizeSearchText } from '../../utils/format.js';

const DEFAULT_CONTEXT = Object.freeze({ ingredients, getCategoryLabel });

function ingredientName(ingredientId, context) {
  return context.ingredients[ingredientId]?.name ?? '';
}

function isStaple(ingredientId, context) {
  return context.ingredients[ingredientId]?.staple === true;
}

export function buildSearchText(recipe, context = DEFAULT_CONTEXT) {
  const parts = [
    recipe.title,
    context.getCategoryLabel(recipe.category),
    ...recipe.ingredients.map((ingredient) => ingredientName(ingredient.id, context)),
  ];
  return normalizeSearchText(parts.join(' '));
}

export function matchesQuery(searchText, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery === '') return true;
  return normalizedQuery.split(' ').every((word) => searchText.includes(word));
}

export function hasExcludedIngredient(recipe, excludedIds) {
  const excluded = new Set(excludedIds);
  return recipe.ingredients.some((ingredient) => excluded.has(ingredient.id));
}

export function summarizePantry(recipe, ownedIds, context = DEFAULT_CONTEXT) {
  const owned = new Set(ownedIds);
  const counted = new Set();
  const required = new Set();
  for (const ingredient of recipe.ingredients) {
    if (isStaple(ingredient.id, context)) continue;
    counted.add(ingredient.id);
    if (ingredient.optional !== true) required.add(ingredient.id);
  }
  const countOwned = (ids) => [...ids].filter((id) => owned.has(id)).length;
  return {
    matched: countOwned(counted),
    total: counted.size,
    requiredMatched: countOwned(required),
    requiredTotal: required.size,
  };
}

export function isCookableFromPantry(pantry) {
  return pantry.requiredTotal > 0 && pantry.requiredMatched === pantry.requiredTotal;
}

function matchesPantry(pantry, onlyOwned) {
  if (pantry === null) return true;
  return onlyOwned ? isCookableFromPantry(pantry) : pantry.matched > 0;
}

export function filterRecipes(recipes, filters, context = DEFAULT_CONTEXT) {
  const {
    query = '',
    category = null,
    maxMinutes = null,
    owned = [],
    onlyOwned = false,
    excluded = [],
  } = filters;
  const entries = [];
  recipes.forEach((recipe, position) => {
    if (category !== null && recipe.category !== category) return;
    if (maxMinutes !== null && recipe.totalMinutes > maxMinutes) return;
    if (hasExcludedIngredient(recipe, excluded)) return;
    if (!matchesQuery(buildSearchText(recipe, context), query)) return;
    const pantry = owned.length > 0 ? summarizePantry(recipe, owned, context) : null;
    if (!matchesPantry(pantry, onlyOwned)) return;
    entries.push({ recipe, position, pantry });
  });
  return entries;
}

function byPosition(first, second) {
  return first.position - second.position;
}

function byPantryMatch(first, second) {
  const matchedDifference = (second.pantry?.matched ?? 0) - (first.pantry?.matched ?? 0);
  if (matchedDifference !== 0) return matchedDifference;
  const missing = (entry) => (entry.pantry ? entry.pantry.total - entry.pantry.matched : 0);
  return missing(first) - missing(second) || byPosition(first, second);
}

function createComparator(sort, addedAt) {
  const added = (entry) => addedAt.get(entry.recipe.id) ?? 0;
  const comparators = {
    default: byPantryMatch,
    title: (first, second) =>
      first.recipe.title.localeCompare(second.recipe.title, 'ru') || byPosition(first, second),
    fastest: (first, second) =>
      first.recipe.totalMinutes - second.recipe.totalMinutes || byPosition(first, second),
    slowest: (first, second) =>
      second.recipe.totalMinutes - first.recipe.totalMinutes || byPosition(first, second),
    recent: (first, second) => added(second) - added(first) || byPosition(first, second),
  };
  return Object.hasOwn(comparators, sort) ? comparators[sort] : comparators.default;
}

export function sortEntries(entries, sort = 'default', { addedAt = new Map() } = {}) {
  return [...entries].sort(createComparator(sort, addedAt));
}

export function selectRecipes(recipes, filters, { context = DEFAULT_CONTEXT, addedAt } = {}) {
  return sortEntries(filterRecipes(recipes, filters, context), filters.sort, { addedAt });
}
