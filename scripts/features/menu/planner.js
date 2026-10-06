import { MEALS } from '../../core/store.js';
import {
  addWeeks,
  formatDayLong,
  getWeekDays,
  parseIsoDate,
  startOfWeek,
  toIsoDate,
} from '../../utils/dates.js';
import { normalizeSearchText } from '../../utils/format.js';

const MEAL_DETAILS = Object.freeze({
  breakfast: { label: 'Завтрак', icon: 'cup' },
  lunch: { label: 'Обед', icon: 'bowl' },
  dinner: { label: 'Ужин', icon: 'cutlery' },
});

const MEAL_PREFERENCES = Object.freeze({
  breakfast: ['breakfast', 'lunch', 'dinner'],
  default: ['lunch', 'dinner', 'breakfast'],
});

export const MEAL_OPTIONS = Object.freeze(MEALS.map((id) => ({ id, ...MEAL_DETAILS[id] })));

export function getMealLabel(meal) {
  return MEAL_DETAILS[meal]?.label ?? '';
}

export function resolveWeekStart(weekParam, today) {
  return toIsoDate(startOfWeek(parseIsoDate(weekParam) ?? today));
}

export function shiftWeek(weekStart, amount) {
  return toIsoDate(addWeeks(parseIsoDate(weekStart), amount));
}

export function getWeekDates(weekStart) {
  return getWeekDays(parseIsoDate(weekStart)).map(toIsoDate);
}

export function pickDefaultDay(weekStart, today) {
  return getWeekDates(weekStart).includes(today) ? today : weekStart;
}

export function describeSlot({ date, meal }) {
  return `${getMealLabel(meal).toLocaleLowerCase('ru')}, ${formatDayLong(parseIsoDate(date))}`;
}

export function isSameSlot(first, second) {
  return first.date === second.date && first.meal === second.meal;
}

export function suggestMeal(recipe, dayMeals = {}) {
  const order = MEAL_PREFERENCES[recipe.category] ?? MEAL_PREFERENCES.default;
  return order.find((meal) => !dayMeals[meal]) ?? order[0];
}

export function filterRecipes(recipes, { query = '', category = '' } = {}) {
  const words = normalizeSearchText(query).split(' ').filter(Boolean);
  return recipes.filter((recipe) => {
    if (category && recipe.category !== category) return false;
    const title = normalizeSearchText(recipe.title);
    return words.every((word) => title.includes(word));
  });
}

export function pickRecentFavorites(favorites, limit) {
  return [...favorites]
    .sort((first, second) => second.addedAt - first.addedAt)
    .slice(0, limit)
    .map((favorite) => favorite.id);
}
