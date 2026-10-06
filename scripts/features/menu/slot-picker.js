import { icon } from '../../components/icons.js';
import { MEALS, getMeal } from '../../core/store.js';
import { getRecipe } from '../../data/recipes.js';
import { formatDayLong, formatWeekdayShort, parseIsoDate } from '../../utils/dates.js';
import { el } from '../../utils/dom.js';
import { MEAL_OPTIONS, getWeekDates } from './planner.js';

let pickerCount = 0;

function describeDay(date, isToday) {
  const busyCount = MEALS.filter((meal) => getMeal(date, meal) !== null).length;
  return [
    formatDayLong(parseIsoDate(date)),
    isToday ? 'сегодня' : null,
    `занято ${busyCount} из ${MEALS.length}`,
  ]
    .filter(Boolean)
    .join(', ');
}

function createDayMarks(date) {
  return el(
    'span',
    { class: 'slot-day__marks', 'aria-hidden': 'true' },
    MEALS.map((meal) =>
      el('span', {
        class:
          getMeal(date, meal) === null ? 'slot-day__mark' : 'slot-day__mark slot-day__mark--busy',
      }),
    ),
  );
}

function createMealState(date, meal) {
  const recipe = getRecipe(getMeal(date, meal));
  if (!recipe) return el('span', { class: 'slot-meal__state' }, 'свободно');
  return el(
    'span',
    { class: 'slot-meal__state slot-meal__state--busy' },
    el('span', { class: 'visually-hidden' }, 'занято: '),
    recipe.title,
  );
}

export function createSlotPicker({ weekStart, today, selected, onChange }) {
  pickerCount += 1;
  const dayGroupName = `slot-day-${pickerCount}`;
  const mealGroupName = `slot-meal-${pickerCount}`;
  const state = { weekStart, date: selected.date, meal: selected.meal };
  const dayList = el('div', { class: 'slot-picker__days' });
  const mealList = el('div', { class: 'slot-picker__meals' });

  function getSlot() {
    return { date: state.date, meal: state.meal };
  }

  function selectDate(date) {
    state.date = date;
    renderMeals();
    onChange(getSlot());
  }

  function selectMeal(meal) {
    state.meal = meal;
    onChange(getSlot());
  }

  function createDayOption(date) {
    const parsed = parseIsoDate(date);
    const isToday = date === today;
    return el(
      'label',
      { class: isToday ? 'slot-day slot-day--today' : 'slot-day' },
      el('input', {
        class: 'slot-day__input visually-hidden',
        type: 'radio',
        name: dayGroupName,
        value: date,
        checked: date === state.date,
        autofocus: date === selected.date && state.weekStart === weekStart,
        on: { change: () => selectDate(date) },
      }),
      el(
        'span',
        { class: 'slot-day__face' },
        el(
          'span',
          { class: 'slot-day__weekday', 'aria-hidden': 'true' },
          formatWeekdayShort(parsed),
        ),
        el('span', { class: 'slot-day__number', 'aria-hidden': 'true' }, parsed.getDate()),
        createDayMarks(date),
        el('span', { class: 'visually-hidden' }, describeDay(date, isToday)),
      ),
    );
  }

  function createMealOption(option) {
    return el(
      'label',
      { class: 'slot-meal' },
      el('input', {
        class: 'slot-meal__input visually-hidden',
        type: 'radio',
        name: mealGroupName,
        value: option.id,
        checked: option.id === state.meal,
        on: { change: () => selectMeal(option.id) },
      }),
      el(
        'span',
        { class: 'slot-meal__face' },
        el('span', { class: 'slot-meal__check', 'aria-hidden': 'true' }),
        icon(option.icon),
        el('span', { class: 'slot-meal__label' }, option.label),
        createMealState(state.date, option.id),
      ),
    );
  }

  function renderDays() {
    dayList.replaceChildren(...getWeekDates(state.weekStart).map(createDayOption));
  }

  function renderMeals() {
    mealList.replaceChildren(...MEAL_OPTIONS.map(createMealOption));
  }

  function setWeek(nextWeekStart) {
    const dayIndex = Math.max(getWeekDates(state.weekStart).indexOf(state.date), 0);
    state.weekStart = nextWeekStart;
    state.date = getWeekDates(nextWeekStart)[dayIndex];
    renderDays();
    renderMeals();
    onChange(getSlot());
  }

  renderDays();
  renderMeals();
  const element = el(
    'div',
    { class: 'slot-picker' },
    el(
      'fieldset',
      { class: 'slot-picker__group' },
      el('legend', { class: 'slot-picker__legend' }, 'День'),
      dayList,
    ),
    el(
      'fieldset',
      { class: 'slot-picker__group' },
      el('legend', { class: 'slot-picker__legend' }, 'Приём пищи'),
      mealList,
    ),
  );
  return { element, getSlot, setWeek };
}
