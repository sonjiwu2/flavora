import { el } from '../utils/dom.js';
import { icon } from './icons.js';

let dialogCount = 0;

export function openDialog({ title, body, footer = null, variant = 'center', onClose }) {
  dialogCount += 1;
  const titleId = `dialog-title-${dialogCount}`;
  const closeButton = el(
    'button',
    { class: 'icon-button dialog__close', type: 'button', 'aria-label': 'Закрыть' },
    icon('close'),
  );
  const dialog = el(
    'dialog',
    { class: `dialog dialog--${variant}`, 'aria-labelledby': titleId },
    el(
      'div',
      { class: 'dialog__header' },
      el('h2', { class: 'dialog__title', id: titleId }, title),
      closeButton,
    ),
    el('div', { class: 'dialog__body' }, body),
    footer ? el('div', { class: 'dialog__footer' }, footer) : null,
  );

  function close() {
    if (dialog.open) dialog.close();
  }

  closeButton.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('close', () => {
    dialog.remove();
    onClose?.();
  });

  document.body.append(dialog);
  dialog.showModal();
  return { element: dialog, close };
}
