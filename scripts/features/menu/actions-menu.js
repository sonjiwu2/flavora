import { icon } from '../../components/icons.js';
import { el } from '../../utils/dom.js';

const FOCUS_STEPS = Object.freeze({ ArrowDown: 1, ArrowUp: -1 });

let menuCount = 0;

export function createActionsMenu({ label, actions }) {
  menuCount += 1;
  const listId = `menu-actions-${menuCount}`;
  const toggle = el(
    'button',
    {
      class: 'icon-button menu-actions__toggle',
      type: 'button',
      'aria-label': label,
      'aria-expanded': 'false',
      'aria-controls': listId,
    },
    icon('more'),
  );
  const items = actions.map((action) =>
    el('button', { class: 'menu-actions__item', type: 'button' }, action.label),
  );
  const list = el(
    'ul',
    { class: 'menu-actions__list', id: listId, hidden: true },
    items.map((item) => el('li', {}, item)),
  );
  const element = el('div', { class: 'menu-actions' }, toggle, list);

  function isOpen() {
    return !list.hidden;
  }

  function open() {
    list.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    items[0].focus();
    list.scrollIntoView({ block: 'nearest' });
  }

  function close() {
    list.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  function closeAndFocusToggle() {
    close();
    toggle.focus();
  }

  function moveFocus(step) {
    const index = items.indexOf(document.activeElement);
    items[(index + step + items.length) % items.length].focus();
  }

  function handleKeydown(event) {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeAndFocusToggle();
    } else if (event.key in FOCUS_STEPS) {
      event.preventDefault();
      moveFocus(FOCUS_STEPS[event.key]);
    }
  }

  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      close();
      actions[index].onSelect();
    });
  });
  toggle.addEventListener('mousedown', (event) => event.preventDefault());
  toggle.addEventListener('click', () => {
    if (isOpen()) closeAndFocusToggle();
    else open();
  });
  element.addEventListener('keydown', handleKeydown);
  element.addEventListener('focusout', (event) => {
    if (!element.contains(event.relatedTarget)) close();
  });

  return { element, toggle };
}
