import { showToast } from '../../components/toast.js';
import { el } from '../../utils/dom.js';

function createActionControl(action) {
  if (action.href) {
    return el('a', { class: 'menu-toast__action', href: action.href }, action.label);
  }
  const button = el('button', { class: 'menu-toast__action', type: 'button' }, action.label);
  button.addEventListener(
    'click',
    () => {
      button.disabled = true;
      action.onSelect();
    },
    { once: true },
  );
  return button;
}

export function notify(message, action = null) {
  if (!action) {
    showToast(message);
    return;
  }
  showToast(
    el(
      'span',
      { class: 'menu-toast' },
      el('span', { class: 'menu-toast__text' }, message),
      createActionControl(action),
    ),
  );
}
