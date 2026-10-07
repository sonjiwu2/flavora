import { clearMeal, getMeal, setMeal } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { openMoveDialog } from './move-dialog.js';
import { notify } from './notify.js';
import { describeSlot } from './planner.js';
import { openRecipePicker } from './recipe-picker.js';

function capitalize(text) {
  return text.charAt(0).toLocaleUpperCase('ru') + text.slice(1);
}

export function createMealActions({ getBoard, getWeekStart, getToday }) {
  function focusSlot(slot, fallbackSlot = null) {
    const board = getBoard();
    if (!board.focusCell(slot) && fallbackSlot) board.focusCell(fallbackSlot);
  }

  function chooseRecipe(slot, { title, currentRecipeId, describeChange }) {
    openRecipePicker({
      title,
      context: capitalize(describeSlot(slot)),
      currentRecipeId,
      onSelect(recipeId) {
        if (recipeId === currentRecipeId) return;
        if (setMeal(slot.date, slot.meal, recipeId)) notify(describeChange(getRecipe(recipeId)));
      },
      onClose: () => focusSlot(slot),
    });
  }

  function onAdd(slot) {
    chooseRecipe(slot, {
      title: 'Добавить блюдо',
      currentRecipeId: null,
      describeChange: (recipe) => `«${recipe.title}» добавлено: ${describeSlot(slot)}`,
    });
  }

  function onReplace(slot) {
    const current = getRecipe(getMeal(slot.date, slot.meal));
    if (!current) return;
    chooseRecipe(slot, {
      title: 'Заменить блюдо',
      currentRecipeId: current.id,
      describeChange: (recipe) =>
        `«${recipe.title}» вместо «${current.title}»: ${describeSlot(slot)}`,
    });
  }

  function onMove(slot) {
    let focusTarget = slot;
    openMoveDialog({
      from: slot,
      weekStart: getWeekStart(),
      today: getToday(),
      onMoved(target) {
        focusTarget = target;
      },
      onClose: () => focusSlot(focusTarget, slot),
    });
  }

  function restore(slot, recipe) {
    if (getMeal(slot.date, slot.meal) !== null) {
      notify(`Не удалось вернуть «${recipe.title}»: ячейка уже занята`);
      return;
    }
    if (!setMeal(slot.date, slot.meal, recipe.id)) return;
    focusSlot(slot);
    notify(`«${recipe.title}» снова в меню: ${describeSlot(slot)}`);
  }

  function onRemove(slot) {
    const recipe = getRecipe(getMeal(slot.date, slot.meal));
    if (!recipe || !clearMeal(slot.date, slot.meal)) return;
    focusSlot(slot);
    notify(`«${recipe.title}» убрано: ${describeSlot(slot)}`, {
      label: 'Вернуть',
      onSelect: () => restore(slot, recipe),
    });
  }

  return { onAdd, onReplace, onMove, onRemove };
}
