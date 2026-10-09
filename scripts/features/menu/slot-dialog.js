import { openDialog } from '../../components/modal.js';
import { el } from '../../utils/dom.js';
import { playEnter } from './motion.js';
import { createSlotPicker } from './slot-picker.js';
import { createWeekSwitcher } from './week-switcher.js';

const SHEET_VIEWPORT = '(width < 40rem)';

function pickVariant() {
  return window.matchMedia(SHEET_VIEWPORT).matches ? 'side' : 'center';
}

export function openSlotDialog({
  title,
  intro,
  weekStart,
  today,
  selected,
  canChangeWeek = false,
  describeTarget,
  onConfirm,
  onClose,
}) {
  const status = el('p', { class: 'slot-status', role: 'status' });
  const confirmButton = el('button', { class: 'button', type: 'button' });
  const cancelButton = el(
    'button',
    { class: 'button button--secondary', type: 'button' },
    'Отмена',
  );

  function renderTarget(slot) {
    const target = describeTarget(slot);
    if (status.textContent !== target.text) playEnter(status, 'fade');
    status.textContent = target.text;
    confirmButton.textContent = target.action;
    confirmButton.disabled = !target.allowed;
  }

  const picker = createSlotPicker({ weekStart, today, selected, onChange: renderTarget });
  const switcher = canChangeWeek
    ? createWeekSwitcher({ weekStart, onChange: picker.setWeek })
    : null;

  renderTarget(picker.getSlot());
  const dialog = openDialog({
    title,
    body: el('div', { class: 'slot-dialog' }, intro, switcher?.element, picker.element, status),
    footer: [cancelButton, confirmButton],
    variant: pickVariant(),
    onClose,
  });
  cancelButton.addEventListener('click', () => dialog.close());
  confirmButton.addEventListener('click', () => {
    if (onConfirm(picker.getSlot())) dialog.close();
  });
  return dialog;
}
