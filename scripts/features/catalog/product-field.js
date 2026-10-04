import { icon } from '../../components/icons.js';
import { el, listen } from '../../utils/dom.js';
import { createChip, focusAfterRemoval } from './controls.js';
import { suggestIngredients } from './filter-state.js';

let fieldCount = 0;

export function createProductField({
  label,
  placeholder,
  chipsLabel,
  options,
  selected = [],
  onAdd,
  onRemove,
}) {
  fieldCount += 1;
  const listId = `product-field-${fieldCount}-options`;
  const namesById = new Map(options.map((option) => [option.id, option.name]));
  let selectedIds = [...selected];
  let suggestions = [];
  let activeIndex = -1;
  const coarsePointer = window.matchMedia('(pointer: coarse)');

  const input = el('input', {
    class: 'search-field__input',
    type: 'text',
    role: 'combobox',
    placeholder,
    autocomplete: 'off',
    autocapitalize: 'none',
    spellcheck: 'false',
    enterkeyhint: 'done',
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
    'aria-controls': listId,
  });
  const listbox = el('ul', {
    class: 'product-field__options',
    id: listId,
    role: 'listbox',
    'aria-label': label,
    hidden: true,
  });
  const combo = el(
    'div',
    { class: 'product-field__combo' },
    el(
      'label',
      { class: 'search-field' },
      icon('search'),
      el('span', { class: 'visually-hidden' }, label),
      input,
    ),
    listbox,
  );
  const chips = el('ul', { class: 'product-field__chips', 'aria-label': chipsLabel, hidden: true });
  const status = el('p', { class: 'visually-hidden', role: 'status' });
  const element = el('div', { class: 'product-field' }, combo, chips, status);

  function isOpen() {
    return !listbox.hidden;
  }

  function setActive(index) {
    activeIndex = index;
    const optionElements = [...listbox.querySelectorAll('[role="option"]')];
    optionElements.forEach((optionElement, optionIndex) => {
      optionElement.setAttribute('aria-selected', String(optionIndex === index));
    });
    const active = optionElements[index];
    if (active) {
      input.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function close() {
    listbox.hidden = true;
    listbox.replaceChildren();
    suggestions = [];
    input.setAttribute('aria-expanded', 'false');
    setActive(-1);
  }

  function choose(option) {
    input.value = '';
    close();
    status.textContent = `Добавлено: ${option.name}`;
    onAdd(option.id);
  }

  function createOption(option, index) {
    return el(
      'li',
      {
        class: 'product-field__option',
        id: `${listId}-${index}`,
        role: 'option',
        'aria-selected': 'false',
        on: {
          pointerdown: (event) => event.preventDefault(),
          click: () => choose(option),
        },
      },
      option.name,
    );
  }

  function open({ activate = 'first' } = {}) {
    suggestions = suggestIngredients(options, input.value, selectedIds);
    if (suggestions.length === 0) {
      listbox.replaceChildren(
        el(
          'li',
          { class: 'product-field__empty', role: 'presentation' },
          input.value.trim() === '' ? 'Все продукты уже выбраны' : 'Такого продукта нет в рецептах',
        ),
      );
    } else {
      listbox.replaceChildren(...suggestions.map(createOption));
    }
    listbox.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    const initialIndex = { first: 0, last: suggestions.length - 1, none: -1 }[activate];
    setActive(suggestions.length > 0 ? initialIndex : -1);
    combo.scrollIntoView({ block: coarsePointer.matches ? 'start' : 'nearest' });
  }

  function moveActive(step) {
    if (!isOpen()) {
      open({ activate: step > 0 ? 'first' : 'last' });
      return;
    }
    if (suggestions.length === 0) return;
    setActive((activeIndex + step + suggestions.length) % suggestions.length);
  }

  function confirm() {
    if (!isOpen()) {
      if (input.value.trim() !== '') open();
      return;
    }
    const option = suggestions[activeIndex];
    if (option) choose(option);
  }

  function handleKeydown(event) {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      confirm();
    } else if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  }

  function handleFocusOut(event) {
    if (!combo.contains(event.relatedTarget)) close();
  }

  function renderChips() {
    const created = selectedIds.map((id) => {
      const name = namesById.get(id) ?? id;
      return createChip(name, { removeLabel: `Убрать: ${name}`, onRemove: () => remove(id) });
    });
    chips.replaceChildren(...created.map((chip) => chip.element));
    chips.hidden = created.length === 0;
    return created.map((chip) => chip.removeButton);
  }

  function remove(id) {
    const removedIndex = selectedIds.indexOf(id);
    status.textContent = `Убрано: ${namesById.get(id) ?? id}`;
    onRemove(id);
    focusAfterRemoval([...chips.querySelectorAll('.chip__remove')], removedIndex, input);
  }

  function setSelected(ids) {
    selectedIds = [...ids];
    renderChips();
    if (isOpen()) open({ activate: 'none' });
  }

  const stopListening = [
    listen(input, 'input', () => open()),
    listen(input, 'keydown', handleKeydown),
    listen(input, 'click', () => {
      if (!isOpen()) open({ activate: 'none' });
    }),
    listen(combo, 'focusout', handleFocusOut),
  ];
  renderChips();

  return {
    element,
    input,
    isOpen,
    close,
    setSelected,
    dispose() {
      stopListening.forEach((stop) => stop());
    },
  };
}
