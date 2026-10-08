import { icon } from '../../components/icons.js';
import { CATEGORIES } from '../../data/categories.js';
import { el, listen } from '../../utils/dom.js';
import { findTidyRowWidth } from './tab-rows.js';

const ANNOUNCE_DELAY_MS = 600;
const CHIP_ICON_SIZE = 16;
const SCROLL_EDGE_TOLERANCE = 2;
const COMPACT_VIEWPORT_QUERY = '(max-width: 26rem)';
const TIDY_WIDTH_PROPERTY = '--category-tabs-width';

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
  const text = el('span', { class: 'chip__text' }, label);
  const removeButton = el(
    'button',
    { class: 'chip__remove', type: 'button', 'aria-label': removeLabel, on: { click: onRemove } },
    icon('close', { size: CHIP_ICON_SIZE }),
  );
  const element = el(tagName, { class: 'chip' }, text, removeButton);

  function setLabel(nextLabel, nextRemoveLabel) {
    if (text.textContent !== nextLabel) text.textContent = nextLabel;
    removeButton.setAttribute('aria-label', nextRemoveLabel);
  }

  return { element, removeButton, setLabel };
}

export function createKeyedChips({ describe, onRemove }) {
  const chips = new Map();

  function chipFor(item) {
    const { label, removeLabel } = describe(item);
    let chip = chips.get(item.key);
    if (chip) chip.setLabel(label, removeLabel);
    else {
      chip = createChip(label, { removeLabel, onRemove: () => onRemove(item.key) });
      chips.set(item.key, chip);
    }
    return chip;
  }

  return function sync(items) {
    const wanted = new Set(items.map((item) => item.key));
    for (const key of [...chips.keys()]) {
      if (!wanted.has(key)) chips.delete(key);
    }
    return items.map(chipFor);
  };
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
    const edgeInset = buttons[0].offsetLeft;
    const start = button.offsetLeft - edgeInset;
    const end = button.offsetLeft + button.offsetWidth + edgeInset;
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

  function tidyRows() {
    const style = window.getComputedStyle(list);
    const tidyWidth =
      style.flexWrap === 'wrap'
        ? findTidyRowWidth(
            buttons.map((button) => button.getBoundingClientRect().width),
            Number.parseFloat(style.columnGap) || 0,
            element.clientWidth,
          )
        : null;
    if (tidyWidth === null) element.style.removeProperty(TIDY_WIDTH_PROPERTY);
    else element.style.setProperty(TIDY_WIDTH_PROPERTY, `${tidyWidth}px`);
  }

  function handleResize() {
    tidyRows();
    revealSelected();
  }

  const stopScroll = listen(list, 'scroll', updateEdges, { passive: true });
  const stopWindowResize = listen(window, 'resize', handleResize);
  const observer = new ResizeObserver(handleResize);
  buttons.forEach((button) => observer.observe(button));
  setSelected(selected);

  return {
    element,
    setSelected,
    dispose() {
      stopScroll();
      stopWindowResize();
      observer.disconnect();
    },
  };
}
