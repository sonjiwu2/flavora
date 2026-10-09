import { showToast } from '../../components/toast.js';
import { getMeal, moveMeal } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { el } from '../../utils/dom.js';
import { describeSlot, isSameSlot } from './planner.js';
import { openSlotDialog } from './slot-dialog.js';

function describeTarget(from, to) {
  if (isSameSlot(from, to)) {
    return { text: 'Выберите другой день или приём пищи.', action: 'Переместить', allowed: false };
  }
  const occupant = getRecipe(getMeal(to.date, to.meal));
  if (occupant) {
    return {
      text: `Здесь уже «${occupant.title}» — блюда поменяются местами.`,
      action: 'Поменять местами',
      allowed: true,
    };
  }
  return { text: 'Ячейка свободна.', action: 'Переместить', allowed: true };
}

function announceMove(recipe, displaced, to) {
  if (displaced) showToast(`«${recipe.title}» и «${displaced.title}» поменялись местами`);
  else showToast(`«${recipe.title}» перенесено: ${describeSlot(to)}`);
}

export function openMoveDialog({ from, weekStart, today, onMoved, onClose }) {
  const recipe = getRecipe(getMeal(from.date, from.meal));
  if (!recipe) return null;

  return openSlotDialog({
    title: 'Переместить блюдо',
    intro: el('p', { class: 'slot-dialog__summary' }, `«${recipe.title}» — ${describeSlot(from)}`),
    weekStart,
    today,
    selected: from,
    describeTarget: (to) => describeTarget(from, to),
    onConfirm(to) {
      const displaced = getRecipe(getMeal(to.date, to.meal));
      if (!moveMeal(from, to)) return false;
      announceMove(recipe, displaced, to);
      onMoved(to);
      return true;
    },
    onClose,
  });
}
