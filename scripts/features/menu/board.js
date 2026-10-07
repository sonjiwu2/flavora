import { icon } from '../../components/icons.js';
import { buildHref } from '../../core/router.js';
import { getMeal } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { formatDayLong, formatWeekdayShort, isWeekend, parseIsoDate } from '../../utils/dates.js';
import { el } from '../../utils/dom.js';
import { createActionsMenu } from './actions-menu.js';
import { createDishThumbLink, createDurationMeta } from './dish.js';
import { MEAL_OPTIONS, describeSlot, getWeekDates } from './planner.js';

const RAIL_ICON_SIZE = 30;
const FOCUS_TARGETS = '.menu-actions__toggle, .menu-add';

function joinClasses(...names) {
  return names.filter(Boolean).join(' ');
}

function isRendered(element) {
  return element.getClientRects().length > 0;
}

function createRail() {
  return el(
    'div',
    { class: 'menu-rail', 'aria-hidden': 'true' },
    el('span', { class: 'menu-rail__corner' }),
    MEAL_OPTIONS.map((meal) =>
      el(
        'span',
        { class: 'menu-rail__item' },
        icon(meal.icon, { size: RAIL_ICON_SIZE }),
        el('span', { class: 'menu-rail__label' }, meal.label),
      ),
    ),
  );
}

export function createBoard({ weekStart, today, selectedDay, handlers }) {
  const dates = getWeekDates(weekStart);
  const cells = [];
  const dayElements = new Map();
  const tabElements = new Map();

  function createAddButton(slot) {
    return el(
      'button',
      {
        class: 'menu-add',
        type: 'button',
        'aria-label': `Добавить блюдо: ${describeSlot(slot)}`,
        on: { click: () => handlers.onAdd(slot) },
      },
      el('span', { class: 'menu-add__icon' }, icon('plus')),
      el('span', { class: 'menu-add__label' }, 'Добавить'),
    );
  }

  function createDish(slot, recipe) {
    const actions = createActionsMenu({
      label: `Действия: ${recipe.title}, ${describeSlot(slot)}`,
      actions: [
        { label: 'Заменить', onSelect: () => handlers.onReplace(slot) },
        { label: 'Переместить', onSelect: () => handlers.onMove(slot) },
        { label: 'Убрать', onSelect: () => handlers.onRemove(slot) },
      ],
    });
    return el(
      'div',
      { class: 'menu-dish' },
      createDishThumbLink(recipe, 'menu-dish__thumb'),
      el('a', { class: 'menu-dish__title', href: buildHref(`/recipe/${recipe.id}`) }, recipe.title),
      el(
        'div',
        { class: 'menu-dish__footer' },
        createDurationMeta(recipe, 'menu-dish__meta'),
        actions.element,
      ),
    );
  }

  function renderCell(cell) {
    const recipeId = getMeal(cell.slot.date, cell.slot.meal);
    if (recipeId === cell.recipeId) return;
    cell.recipeId = recipeId;
    cell.content.replaceChildren(
      recipeId === null ? createAddButton(cell.slot) : createDish(cell.slot, getRecipe(recipeId)),
    );
  }

  function createCell(date, meal) {
    const content = el('div', { class: 'menu-cell__content' });
    const element = el(
      'div',
      { class: 'menu-cell', dataset: { date, meal: meal.id } },
      el(
        'h3',
        { class: 'menu-cell__meal' },
        icon(meal.icon),
        el('span', { class: 'menu-cell__meal-label' }, meal.label),
      ),
      content,
    );
    const cell = { slot: { date, meal: meal.id }, element, content, recipeId: undefined };
    renderCell(cell);
    cells.push(cell);
    return element;
  }

  function createDay(date) {
    const parsed = parseIsoDate(date);
    const isToday = date === today;
    const headingId = `menu-day-${date}`;
    const element = el(
      'div',
      {
        class: joinClasses(
          'menu-day',
          isToday && 'menu-day--today',
          isWeekend(parsed) && 'menu-day--weekend',
        ),
        role: 'group',
        'aria-labelledby': headingId,
        dataset: { date },
      },
      el(
        'h2',
        { class: 'menu-day__header', id: headingId },
        el(
          'span',
          { class: 'menu-day__short', 'aria-hidden': 'true' },
          el('span', { class: 'menu-day__weekday' }, formatWeekdayShort(parsed)),
          el('span', { class: 'menu-day__number' }, parsed.getDate()),
        ),
        el(
          'span',
          { class: 'menu-day__full' },
          formatDayLong(parsed),
          isToday ? [', ', el('span', { class: 'menu-day__today' }, 'сегодня')] : null,
        ),
      ),
      MEAL_OPTIONS.map((meal) => createCell(date, meal)),
    );
    dayElements.set(date, element);
    return element;
  }

  function createTab(date) {
    const parsed = parseIsoDate(date);
    const isToday = date === today;
    const element = el(
      'button',
      {
        class: joinClasses('menu-days__item', isToday && 'menu-days__item--today'),
        type: 'button',
        'aria-label': isToday ? `${formatDayLong(parsed)}, сегодня` : formatDayLong(parsed),
        dataset: { date },
        on: { click: () => selectDay(date) },
      },
      el('span', { class: 'menu-days__weekday' }, formatWeekdayShort(parsed)),
      el('span', { class: 'menu-days__number' }, parsed.getDate()),
    );
    tabElements.set(date, element);
    return element;
  }

  function selectDay(date) {
    for (const [tabDate, tab] of tabElements) {
      tab.setAttribute('aria-pressed', String(tabDate === date));
    }
    for (const [dayDate, day] of dayElements) {
      day.classList.toggle('menu-day--selected', dayDate === date);
    }
  }

  function refresh() {
    cells.forEach(renderCell);
  }

  function focusCell(slot) {
    const cell = cells.find(
      (candidate) => candidate.slot.date === slot.date && candidate.slot.meal === slot.meal,
    );
    const target = cell?.content.querySelector(FOCUS_TARGETS);
    if (!target || !isRendered(target)) return false;
    target.focus();
    return true;
  }

  const element = el(
    'div',
    { class: 'menu-planner' },
    el(
      'div',
      { class: 'menu-days', role: 'group', 'aria-label': 'День недели' },
      dates.map(createTab),
    ),
    el('div', { class: 'menu-board' }, createRail(), dates.map(createDay)),
  );
  selectDay(selectedDay);
  return { element, refresh, focusCell };
}
