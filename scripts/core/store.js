import { hasRecipe } from '../data/recipes.js';
import { readJson, readText, removeValue, writeJson, writeText } from './storage.js';

export const STORAGE_KEYS = Object.freeze({
  theme: 'flavora.theme.v1',
  motion: 'flavora.motion.v1',
  favorites: 'flavora.favorites.v1',
  menu: 'flavora.menu.v1',
});

export const MEALS = Object.freeze(['breakfast', 'lunch', 'dinner']);
export const THEMES = Object.freeze(['light', 'dark']);
export const MOTION_MODES = Object.freeze(['full', 'reduce']);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const listeners = new Set();

const state = {
  theme: sanitizeChoice(readText(STORAGE_KEYS.theme), THEMES),
  motion: sanitizeChoice(readText(STORAGE_KEYS.motion), MOTION_MODES),
  favorites: sanitizeFavorites(readJson(STORAGE_KEYS.favorites, [])),
  menu: sanitizeMenu(readJson(STORAGE_KEYS.menu, {})),
};

function sanitizeChoice(value, allowed) {
  return allowed.includes(value) ? value : null;
}

export function sanitizeFavorites(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const favorites = [];
  for (const entry of value) {
    const id = entry?.id;
    if (typeof id !== 'string' || seen.has(id) || !hasRecipe(id)) continue;
    seen.add(id);
    favorites.push({ id, addedAt: Number.isFinite(entry.addedAt) ? entry.addedAt : 0 });
  }
  return favorites;
}

export function sanitizeMenu(value) {
  const menu = {};
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return menu;
  for (const [date, meals] of Object.entries(value)) {
    if (!ISO_DATE.test(date) || meals === null || typeof meals !== 'object') continue;
    const day = {};
    for (const meal of MEALS) {
      if (typeof meals[meal] === 'string' && hasRecipe(meals[meal])) day[meal] = meals[meal];
    }
    if (Object.keys(day).length > 0) menu[date] = day;
  }
  return menu;
}

function notify(type) {
  for (const listener of listeners) listener({ type });
}

function persistChoice(key, value) {
  if (value === null) removeValue(key);
  else writeText(key, value);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTheme() {
  return state.theme;
}

export function setTheme(theme) {
  state.theme = sanitizeChoice(theme, THEMES);
  persistChoice(STORAGE_KEYS.theme, state.theme);
  notify('theme');
}

export function getMotion() {
  return state.motion;
}

export function setMotion(motion) {
  state.motion = sanitizeChoice(motion, MOTION_MODES);
  persistChoice(STORAGE_KEYS.motion, state.motion);
  notify('motion');
}

export function getFavorites() {
  return state.favorites.map((favorite) => ({ ...favorite }));
}

export function isFavorite(recipeId) {
  return state.favorites.some((favorite) => favorite.id === recipeId);
}

export function toggleFavorite(recipeId) {
  if (!hasRecipe(recipeId)) return false;
  const wasFavorite = isFavorite(recipeId);
  state.favorites = wasFavorite
    ? state.favorites.filter((favorite) => favorite.id !== recipeId)
    : [...state.favorites, { id: recipeId, addedAt: Date.now() }];
  writeJson(STORAGE_KEYS.favorites, state.favorites);
  notify('favorites');
  return !wasFavorite;
}

export function getMenu() {
  return structuredClone(state.menu);
}

export function getMeal(date, meal) {
  return state.menu[date]?.[meal] ?? null;
}

function isValidSlot(date, meal) {
  return ISO_DATE.test(date) && MEALS.includes(meal);
}

function writeSlot(menu, date, meal, recipeId) {
  const day = { ...menu[date] };
  if (recipeId === null) delete day[meal];
  else day[meal] = recipeId;
  if (Object.keys(day).length === 0) delete menu[date];
  else menu[date] = day;
}

function commitMenu(menu) {
  state.menu = menu;
  writeJson(STORAGE_KEYS.menu, state.menu);
  notify('menu');
}

export function setMeal(date, meal, recipeId) {
  if (!isValidSlot(date, meal) || !hasRecipe(recipeId)) return false;
  const menu = { ...state.menu };
  writeSlot(menu, date, meal, recipeId);
  commitMenu(menu);
  return true;
}

export function clearMeal(date, meal) {
  if (!isValidSlot(date, meal) || getMeal(date, meal) === null) return false;
  const menu = { ...state.menu };
  writeSlot(menu, date, meal, null);
  commitMenu(menu);
  return true;
}

export function moveMeal(from, to) {
  if (!isValidSlot(from.date, from.meal) || !isValidSlot(to.date, to.meal)) return false;
  if (from.date === to.date && from.meal === to.meal) return false;
  const moving = getMeal(from.date, from.meal);
  if (moving === null) return false;
  const displaced = getMeal(to.date, to.meal);
  const menu = { ...state.menu };
  writeSlot(menu, to.date, to.meal, moving);
  writeSlot(menu, from.date, from.meal, displaced);
  commitMenu(menu);
  return true;
}

function syncFromStorageEvent(event) {
  if (event.key === STORAGE_KEYS.theme) {
    state.theme = sanitizeChoice(event.newValue, THEMES);
    notify('theme');
  } else if (event.key === STORAGE_KEYS.motion) {
    state.motion = sanitizeChoice(event.newValue, MOTION_MODES);
    notify('motion');
  } else if (event.key === STORAGE_KEYS.favorites) {
    state.favorites = sanitizeFavorites(readJson(STORAGE_KEYS.favorites, []));
    notify('favorites');
  } else if (event.key === STORAGE_KEYS.menu) {
    state.menu = sanitizeMenu(readJson(STORAGE_KEYS.menu, {}));
    notify('menu');
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', syncFromStorageEvent);
}
