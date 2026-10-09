import { icon } from '../../components/icons.js';
import { buildHref } from '../../core/router.js';
import { getMeal } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { formatDayLong, formatWeekdayShort, isWeekend, parseIsoDate } from '../../utils/dates.js';
import { el } from '../../utils/dom.js';
import { createActionsMenu } from './actions-menu.js';
import { createDishThumbLink, createDurationMeta } from './dish.js';
import { flyFrom, isRendered, playEnter, replaceWithMotion } from './motion.js';
import { MEAL_OPTIONS, describeSlot, getWeekDates } from './planner.js';

const RAIL_ICON_SIZE = 30;
const FOCUS_TARGETS = '.menu-actions__toggle, .menu-add';

function joinClasses(...names) {
  return names.filter(Boolean).join(' ');
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
  let shownDay = null;

  function createAddButton(slot) {
    return el(
      'button',
      {
        class: 'menu-add',
        type: 'button',
        'aria-label': `Добавить блюдо: ${describeSlot(slot)}`,
        on: { click: () => handlers.onAdd(slot) },
      },
      el('span', { class: 'icon-button icon-button--outlined menu-add__icon' }, icon('plus')),
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
      createDurationMeta(recipe, 'menu-dish__meta'),
      actions.element,
    );
  }

  function readMeal(cell) {
    return getMeal(cell.slot.date, cell.slot.meal);
  }

  function createContent(cell) {
    return cell.recipeId === null
      ? createAddButton(cell.slot)
      : createDish(cell.slot, getRecipe(cell.recipeId));
  }

  function findDepartures(changedCells) {
    const departures = new Map();
    for (const cell of changedCells) {
      if (cell.recipeId !== null && isRendered(cell.content)) {
        departures.set(cell.recipeId, cell.content.getBoundingClientRect());
      }
    }
    return departures;
  }

  function findFlights(changedCells) {
    const departures = findDepartures(changedCells);
    const flights = new Map();
    for (const cell of changedCells) {
      const origin = departures.get(readMeal(cell));
      if (origin && isRendered(cell.content)) flights.set(cell, origin);
    }
    return flights;
  }

  function changeCell(cell, { flies, departs }) {
    cell.recipeId = readMeal(cell);
    const content = createContent(cell);
    const enter = cell.recipeId === null ? 'fade' : 'pop';
    replaceWithMotion(cell.content, content, {
      enter: flies ? null : enter,
      leave: departs ? 'fade' : null,
    });
    return content;
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
    const cell = { slot: { date, meal: meal.id }, element, content, recipeId: null };
    cell.recipeId = readMeal(cell);
    content.append(createContent(cell));
    cells.push(cell);
    return element;
  }

  function createDay(date, order) {
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
    element.style.setProperty('--menu-order', order);
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

  function showDay(date) {
    for (const [tabDate, tab] of tabElements) {
      tab.setAttribute('aria-pressed', String(tabDate === date));
    }
    for (const [dayDate, day] of dayElements) {
      day.classList.toggle('menu-day--selected', dayDate === date);
    }
    shownDay = date;
  }

  function selectDay(date) {
    if (date === shownDay) return;
    const motion = date > shownDay ? 'forward' : 'backward';
    showDay(date);
    playEnter(dayElements.get(date), motion);
  }

  function refresh() {
    const changedCells = cells.filter((cell) => readMeal(cell) !== cell.recipeId);
    const flights = findFlights(changedCells);
    const flownRecipes = new Set([...flights.keys()].map(readMeal));
    const landed = changedCells.map((cell) => {
      const isDish = cell.recipeId !== null;
      const content = changeCell(cell, {
        flies: flights.has(cell),
        departs: isDish && !flownRecipes.has(cell.recipeId),
      });
      return { cell, content };
    });
    for (const { cell, content } of landed) {
      if (flights.has(cell)) flyFrom(content, flights.get(cell));
    }
  }

  function focusCell(slot) {
    const cell = cells.find(
      (candidate) => candidate.slot.date === slot.date && candidate.slot.meal === slot.meal,
    );
    const target = [...(cell?.content.querySelectorAll(FOCUS_TARGETS) ?? [])].at(-1);
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
  showDay(selectedDay);
  return { element, refresh, focusCell };
}
