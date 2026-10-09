import { showToast } from '../../components/toast.js';
import { buildHref } from '../../core/router.js';
import { getMeal, getMenu, setMeal } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { parseIsoDate, startOfWeek, toIsoDate } from '../../utils/dates.js';
import { el } from '../../utils/dom.js';
import { createDishThumb } from './dish.js';
import { describeSlot, suggestMeal } from './planner.js';
import { openSlotDialog } from './slot-dialog.js';

function describeTarget(recipe, slot) {
  const occupant = getRecipe(getMeal(slot.date, slot.meal));
  if (!occupant) return { text: 'Ячейка свободна.', action: 'Добавить', allowed: true };
  if (occupant.id === recipe.id) {
    return { text: 'Это блюдо уже стоит здесь.', action: 'Добавить', allowed: false };
  }
  return {
    text: `Сейчас здесь «${occupant.title}». Заменить на «${recipe.title}»?`,
    action: 'Заменить',
    allowed: true,
  };
}

function announceAdded(recipe, slot) {
  showToast(`«${recipe.title}» добавлено: ${describeSlot(slot)}`, {
    action: {
      label: 'Открыть меню',
      href: buildHref('/menu', { week: toIsoDate(startOfWeek(parseIsoDate(slot.date))) }),
    },
  });
}

export function openAddToMenu(recipeId) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return null;

  const now = new Date();
  const today = toIsoDate(now);
  return openSlotDialog({
    title: 'В меню',
    intro: el(
      'p',
      { class: 'slot-dialog__recipe' },
      createDishThumb(recipe),
      el('span', { class: 'slot-dialog__title' }, recipe.title),
    ),
    weekStart: toIsoDate(startOfWeek(now)),
    today,
    selected: { date: today, meal: suggestMeal(recipe, getMenu()[today]) },
    canChangeWeek: true,
    describeTarget: (slot) => describeTarget(recipe, slot),
    onConfirm(slot) {
      if (!setMeal(slot.date, slot.meal, recipe.id)) return false;
      announceAdded(recipe, slot);
      return true;
    },
  });
}
