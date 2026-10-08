import { el } from '../utils/dom.js';
import { icon } from './icons.js';
import { moveToastRegion, removeAfterExit } from './toast.js';

const VARIANTS = ['center', 'side'];
const TRIGGER_SELECTOR = 'button, a[href], input, select, textarea, summary, [tabindex]';
const TRIGGER_MEMORY_MS = 1000;
const openDialogs = [];
const lastActivation = { control: null, time: 0 };
let dialogCount = 0;

document.addEventListener(
  'click',
  (event) => {
    const target = event.target instanceof Element ? event.target : null;
    lastActivation.control = target?.closest(TRIGGER_SELECTOR) ?? null;
    lastActivation.time = performance.now();
  },
  true,
);

function findOpener() {
  if (!hasLostFocus()) return document.activeElement;
  const isRecent = performance.now() - lastActivation.time < TRIGGER_MEMORY_MS;
  return isRecent ? lastActivation.control : null;
}

function lockPageScroll() {
  const root = document.documentElement;
  if ('scrollLock' in root.dataset) return;
  const gutterWidth = Math.max(0, window.innerWidth - root.getBoundingClientRect().width);
  root.style.setProperty('--scroll-lock-gap', `${gutterWidth}px`);
  root.dataset.scrollLock = '';
}

function unlockPageScroll() {
  const root = document.documentElement;
  delete root.dataset.scrollLock;
  root.style.removeProperty('--scroll-lock-gap');
}

function isOutside(event, element) {
  const box = element.getBoundingClientRect();
  return (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  );
}

function hasLostFocus() {
  return document.activeElement === null || document.activeElement === document.body;
}

function restoreFocus(opener) {
  if (opener instanceof HTMLElement && opener.isConnected && hasLostFocus()) opener.focus();
}

function releaseFocus(dialog) {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && dialog.contains(focused)) focused.blur();
}

function leave(dialog) {
  if (openDialogs.length > 0) dialog.remove();
  else removeAfterExit(dialog);
}

function forget(dialog) {
  const index = openDialogs.indexOf(dialog);
  if (index !== -1) openDialogs.splice(index, 1);
}

export function closeAllDialogs() {
  for (const dialog of [...openDialogs].reverse()) dialog.close();
}

export function openDialog({ title, body, footer = null, variant = 'center', onClose }) {
  dialogCount += 1;
  const opener = findOpener();
  const titleId = `dialog-title-${dialogCount}`;
  const layout = VARIANTS.includes(variant) ? variant : VARIANTS[0];
  const closeButton = el(
    'button',
    { class: 'icon-button dialog__close', type: 'button', 'aria-label': 'Закрыть' },
    icon('close'),
  );
  const dialog = el(
    'dialog',
    { class: `dialog dialog--${layout}`, 'aria-labelledby': titleId },
    el(
      'div',
      { class: 'dialog__header' },
      el('h2', { class: 'dialog__title', id: titleId }, title),
      closeButton,
    ),
    el('div', { class: 'dialog__body' }, body),
    footer ? el('div', { class: 'dialog__footer' }, footer) : null,
  );
  let pressStartedOutside = false;

  function close() {
    if (dialog.open) dialog.close();
  }

  closeButton.addEventListener('click', close);
  dialog.addEventListener('pointerdown', (event) => {
    pressStartedOutside = event.target === dialog && isOutside(event, dialog);
  });
  dialog.addEventListener('click', (event) => {
    if (pressStartedOutside && event.target === dialog && isOutside(event, dialog)) close();
    pressStartedOutside = false;
  });
  dialog.addEventListener('close', () => {
    forget(dialog);
    moveToastRegion(openDialogs.at(-1) ?? document.body);
    releaseFocus(dialog);
    leave(dialog);
    if (openDialogs.length === 0) unlockPageScroll();
    restoreFocus(opener);
    onClose?.();
  });

  document.body.append(dialog);
  openDialogs.push(dialog);
  lockPageScroll();
  dialog.showModal();
  moveToastRegion(dialog);
  return { element: dialog, close };
}
