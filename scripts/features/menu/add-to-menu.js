import { buildHref } from '../../core/router.js';
import { getMeal, getMenu, setMeal } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { parseIsoDate, startOfWeek, toIsoDate } from '../../utils/dates.js';
import { el } from '../../utils/dom.js';
import { openMenuDialog } from './dialog.js';
import { createDishThumb } from './dish.js';
import { notify } from './notify.js';
import { describeSlot, suggestMeal } from './planner.js';
import { createSlotPicker } from './slot-picker.js';
import { createWeekSwitcher } from './week-switcher.js';

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

export function openAddToMenu(recipeId) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return null;

  const now = new Date();
  const today = toIsoDate(now);
  const weekStart = toIsoDate(startOfWeek(now));
  const status = el('p', { class: 'slot-status', role: 'status' });
  const confirmButton = el('button', { class: 'button', type: 'button' });
  const cancelButton = el(
    'button',
    { class: 'button button--secondary', type: 'button' },
    'Отмена',
  );

  function renderTarget(slot) {
    const target = describeTarget(recipe, slot);
    status.textContent = target.text;
    confirmButton.textContent = target.action;
    confirmButton.disabled = !target.allowed;
  }

  const picker = createSlotPicker({
    weekStart,
    today,
    selected: { date: today, meal: suggestMeal(recipe, getMenu()[today]) },
    onChange: renderTarget,
  });
  const switcher = createWeekSwitcher({ weekStart, onChange: picker.setWeek });

  function confirm() {
    const slot = picker.getSlot();
    if (!setMeal(slot.date, slot.meal, recipe.id)) return;
    notify(`«${recipe.title}» добавлено: ${describeSlot(slot)}`, {
      label: 'Открыть меню',
      href: buildHref('/menu', { week: toIsoDate(startOfWeek(parseIsoDate(slot.date))) }),
    });
    dialog.close();
  }

  renderTarget(picker.getSlot());
  const dialog = openMenuDialog({
    title: 'В меню',
    body: el(
      'div',
      { class: 'slot-dialog' },
      el(
        'p',
        { class: 'slot-dialog__recipe' },
        createDishThumb(recipe, 'slot-dialog__thumb'),
        el('span', { class: 'slot-dialog__title' }, recipe.title),
      ),
      switcher.element,
      picker.element,
      status,
    ),
    footer: [cancelButton, confirmButton],
    variant: 'center',
  });
  cancelButton.addEventListener('click', () => dialog.close());
  confirmButton.addEventListener('click', confirm);
  return dialog;
}
