import { icon } from '../../components/icons.js';
import { el, listen } from '../../utils/dom.js';
import { normalizeSearchText } from '../../utils/format.js';
import { createKeyedChips, focusAfterRemoval, syncChildren } from './controls.js';
import { suggestIngredients } from './filter-state.js';
import { captureLayout, settleFromLayout } from './motion.js';

const TEXT = Object.freeze({
  allSelected: 'Все продукты уже выбраны',
  noMatch: 'Такого продукта нет в рецептах',
  added: 'Добавлено: ',
  removed: 'Убрано: ',
  removeLabel: 'Убрать: ',
  pending: 'Выберите продукт из списка или очистите поле — набранный текст пока не добавлен.',
  moreBefore: 'Ещё ',
  moreAfter: ' — введите название, чтобы сузить список',
});

const MAX_VISIBLE_OPTIONS = 20;

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
  const pendingId = `product-field-${fieldCount}-pending`;
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
  const emptyNote = el('p', { class: 'product-field__empty', hidden: true });
  const moreNote = el('p', { class: 'product-field__more', hidden: true });
  const pendingNote = el(
    'p',
    { class: 'product-field__pending', id: pendingId, role: 'alert', hidden: true },
    TEXT.pending,
  );
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
    moreNote,
    emptyNote,
    pendingNote,
  );
  const chips = el('ul', { class: 'product-field__chips', 'aria-label': chipsLabel, hidden: true });
  const status = el('p', { class: 'visually-hidden', role: 'status' });
  const element = el('div', { class: 'product-field' }, combo, chips, status);

  function isOpen() {
    return !listbox.hidden || !emptyNote.hidden;
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
    emptyNote.hidden = true;
    moreNote.hidden = true;
    listbox.replaceChildren();
    suggestions = [];
    input.setAttribute('aria-expanded', 'false');
    setActive(-1);
  }

  function clearPending() {
    pendingNote.hidden = true;
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  function showPending() {
    pendingNote.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', pendingId);
    input.focus();
    open();
  }

  function settlePendingText() {
    const typed = normalizeSearchText(input.value);
    if (typed === '') return true;
    const exact = suggestIngredients(options, typed, selectedIds).find(
      (option) => normalizeSearchText(option.name) === typed,
    );
    if (exact) choose(exact);
    else showPending();
    return Boolean(exact);
  }

  function choose(option) {
    clearPending();
    input.value = '';
    close();
    status.textContent = `${TEXT.added}${option.name}`;
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
    const matches = suggestIngredients(options, input.value, selectedIds);
    const hiddenCount = Math.max(0, matches.length - MAX_VISIBLE_OPTIONS);
    suggestions = matches.slice(0, MAX_VISIBLE_OPTIONS);
    const hasSuggestions = suggestions.length > 0;
    const emptyText = input.value.trim() === '' ? TEXT.allSelected : TEXT.noMatch;
    listbox.replaceChildren(...suggestions.map(createOption));
    listbox.hidden = !hasSuggestions;
    emptyNote.hidden = hasSuggestions;
    moreNote.hidden = hiddenCount === 0;
    moreNote.textContent = `${TEXT.moreBefore}${hiddenCount}${TEXT.moreAfter}`;
    emptyNote.textContent = hasSuggestions ? '' : emptyText;
    if (!hasSuggestions) status.textContent = emptyText;
    input.setAttribute('aria-expanded', String(hasSuggestions));
    const initialIndex = { first: 0, last: suggestions.length - 1, none: -1 }[activate];
    setActive(hasSuggestions ? initialIndex : -1);
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

  function describeChip({ key }) {
    const name = namesById.get(key) ?? key;
    return { label: name, removeLabel: `${TEXT.removeLabel}${name}` };
  }

  function renderChips() {
    const previousLayout = captureLayout(chips.children);
    const created = syncChips(selectedIds.map((id) => ({ key: id })));
    syncChildren(
      chips,
      created.map((chip) => chip.element),
    );
    chips.hidden = created.length === 0;
    settleFromLayout(previousLayout, chips.children);
  }

  function remove(id) {
    const removedIndex = selectedIds.indexOf(id);
    status.textContent = `${TEXT.removed}${namesById.get(id) ?? id}`;
    onRemove(id);
    focusAfterRemoval([...chips.querySelectorAll('.chip__remove')], removedIndex, input);
  }

  function setSelected(ids) {
    selectedIds = [...ids];
    renderChips();
    if (isOpen()) open({ activate: 'none' });
  }

  const syncChips = createKeyedChips({ describe: describeChip, onRemove: remove });
  const stopListening = [
    listen(input, 'input', () => {
      clearPending();
      open();
    }),
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
    settlePendingText,
    dispose() {
      stopListening.forEach((stop) => stop());
    },
  };
}
