import { getMeal, moveMeal } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { el } from '../../utils/dom.js';
import { openMenuDialog } from './dialog.js';
import { notify } from './notify.js';
import { describeSlot, isSameSlot } from './planner.js';
import { createSlotPicker } from './slot-picker.js';

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
  if (displaced) notify(`«${recipe.title}» и «${displaced.title}» поменялись местами`);
  else notify(`«${recipe.title}» перенесено: ${describeSlot(to)}`);
}

export function openMoveDialog({ from, weekStart, today, onMoved, onClose }) {
  const recipe = getRecipe(getMeal(from.date, from.meal));
  if (!recipe) return null;

  const status = el('p', { class: 'slot-status', role: 'status' });
  const confirmButton = el('button', { class: 'button', type: 'button' });
  const cancelButton = el(
    'button',
    { class: 'button button--secondary', type: 'button' },
    'Отмена',
  );

  function renderTarget(to) {
    const target = describeTarget(from, to);
    status.textContent = target.text;
    confirmButton.textContent = target.action;
    confirmButton.disabled = !target.allowed;
  }

  const picker = createSlotPicker({ weekStart, today, selected: from, onChange: renderTarget });

  function confirm() {
    const to = picker.getSlot();
    const displaced = getRecipe(getMeal(to.date, to.meal));
    if (!moveMeal(from, to)) return;
    announceMove(recipe, displaced, to);
    onMoved(to);
    dialog.close();
  }

  renderTarget(from);
  const dialog = openMenuDialog({
    title: 'Переместить блюдо',
    body: el(
      'div',
      { class: 'slot-dialog' },
      el('p', { class: 'slot-dialog__summary' }, `«${recipe.title}» — ${describeSlot(from)}`),
      picker.element,
      status,
    ),
    footer: [cancelButton, confirmButton],
    variant: 'center',
    onClose,
  });
  cancelButton.addEventListener('click', () => dialog.close());
  confirmButton.addEventListener('click', confirm);
  return dialog;
}
