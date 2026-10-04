import { icon } from '../../components/icons.js';
import { CATEGORIES } from '../../data/categories.js';
import { el, listen } from '../../utils/dom.js';
import { findBalancedRowWidth } from './wrap-balance.js';

const ANNOUNCE_DELAY_MS = 600;
const CHIP_ICON_SIZE = 16;
const SCROLL_EDGE_TOLERANCE = 2;
const COMPACT_VIEWPORT_QUERY = '(max-width: 26rem)';
const BALANCED_WIDTH_PROPERTY = '--category-tabs-width';

export function syncChildren(container, nodes) {
  const wanted = new Set(nodes);
  for (const child of [...container.children]) {
    if (!wanted.has(child)) child.remove();
  }
  nodes.forEach((node, index) => {
    const current = container.children[index] ?? null;
    if (current !== node) container.insertBefore(node, current);
  });
}

export function createChip(label, { removeLabel, onRemove, tagName = 'li' }) {
  const removeButton = el(
    'button',
    { class: 'chip__remove', type: 'button', 'aria-label': removeLabel, on: { click: onRemove } },
    icon('close', { size: CHIP_ICON_SIZE }),
  );
  const element = el(
    tagName,
    { class: 'chip' },
    el('span', { class: 'chip__text' }, label),
    removeButton,
  );
  return { element, removeButton };
}

export function focusAfterRemoval(removeButtons, removedIndex, fallback) {
  const target = removeButtons[removedIndex] ?? removeButtons[removeButtons.length - 1] ?? fallback;
  target?.focus();
}

export function createSearchField({
  label,
  placeholder,
  compactPlaceholder = placeholder,
  value = '',
  className = '',
}) {
  const compactViewport = window.matchMedia(COMPACT_VIEWPORT_QUERY);
  const input = el('input', {
    class: 'search-field__input',
    type: 'search',
    name: 'q',
    value,
    autocomplete: 'off',
    autocapitalize: 'none',
    spellcheck: 'false',
    enterkeyhint: 'search',
  });
  const element = el(
    'label',
    { class: `search-field ${className}`.trim() },
    icon('search'),
    el('span', { class: 'visually-hidden' }, label),
    input,
  );

  function updatePlaceholder() {
    input.placeholder = compactViewport.matches ? compactPlaceholder : placeholder;
  }

  updatePlaceholder();
  return { element, input, dispose: listen(compactViewport, 'change', updatePlaceholder) };
}

export function createSortControl({ label, options, value, onChange, className = '' }) {
  const select = el('select', {
    class: 'select sort-control__select',
    on: { change: () => onChange(select.value) },
  });
  const element = el(
    'label',
    { class: `sort-control ${className}`.trim() },
    el('span', { class: 'sort-control__label' }, label),
    select,
  );

  let renderedOptions = '';

  function update(nextOptions, nextValue) {
    const signature = JSON.stringify(nextOptions);
    if (signature !== renderedOptions) {
      renderedOptions = signature;
      select.replaceChildren(
        ...nextOptions.map((option) => el('option', { value: option.value }, option.label)),
      );
    }
    select.value = nextValue;
  }

  update(options, value);
  return { element, select, update };
}

export function createResultAnnouncer() {
  const element = el('p', { class: 'visually-hidden', role: 'status' });
  let timer = null;

  function cancel() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }

  function announce(message, { immediate = false } = {}) {
    cancel();
    if (immediate) {
      element.textContent = message;
      return;
    }
    timer = window.setTimeout(() => {
      timer = null;
      element.textContent = message;
    }, ANNOUNCE_DELAY_MS);
  }

  return { element, announce, dispose: cancel };
}

export function createCategoryTabs({ label, selected = null, onSelect }) {
  const choices = [{ id: null, label: 'Все' }, ...CATEGORIES];
  const buttons = choices.map((choice) =>
    el(
      'button',
      {
        class: 'tabs__item category-tabs__item',
        type: 'button',
        on: { click: () => onSelect(choice.id) },
      },
      choice.label,
    ),
  );
  const list = el(
    'div',
    { class: 'tabs category-tabs__list', role: 'group', 'aria-label': label },
    buttons,
  );
  const element = el('div', { class: 'category-tabs' }, list);

  function updateEdges() {
    const hiddenAfter = list.scrollWidth - list.clientWidth - list.scrollLeft;
    element.toggleAttribute('data-fade-start', list.scrollLeft > SCROLL_EDGE_TOLERANCE);
    element.toggleAttribute('data-fade-end', hiddenAfter > SCROLL_EDGE_TOLERANCE);
  }

  function revealButton(button) {
    const start = button.offsetLeft;
    const end = start + button.offsetWidth;
    if (start < list.scrollLeft) list.scrollLeft = start;
    else if (end > list.scrollLeft + list.clientWidth) list.scrollLeft = end - list.clientWidth;
  }

  function revealSelected() {
    const active = buttons.find((button) => button.getAttribute('aria-pressed') === 'true');
    if (active) revealButton(active);
    updateEdges();
  }

  function setSelected(categoryId) {
    choices.forEach((choice, index) => {
      buttons[index].setAttribute('aria-pressed', String(choice.id === categoryId));
    });
    revealSelected();
  }

  function balanceRows() {
    const style = window.getComputedStyle(list);
    const inlinePadding =
      Number.parseFloat(style.paddingInlineStart) + Number.parseFloat(style.paddingInlineEnd);
    const balancedWidth =
      style.flexWrap === 'wrap'
        ? findBalancedRowWidth(
            buttons.map((button) => button.getBoundingClientRect().width),
            Number.parseFloat(style.columnGap) || 0,
            element.clientWidth - inlinePadding,
          )
        : null;
    if (balancedWidth === null) element.style.removeProperty(BALANCED_WIDTH_PROPERTY);
    else element.style.setProperty(BALANCED_WIDTH_PROPERTY, `${balancedWidth + inlinePadding}px`);
  }

  function handleResize() {
    balanceRows();
    revealSelected();
  }

  const stopScroll = listen(list, 'scroll', updateEdges, { passive: true });
  const observer = new ResizeObserver(handleResize);
  observer.observe(element);
  buttons.forEach((button) => observer.observe(button));
  setSelected(selected);

  return {
    element,
    setSelected,
    dispose() {
      stopScroll();
      observer.disconnect();
    },
  };
}
