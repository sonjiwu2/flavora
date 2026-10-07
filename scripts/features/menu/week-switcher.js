import { icon } from '../../components/icons.js';
import { getWeekRangeParts, parseIsoDate } from '../../utils/dates.js';
import { el } from '../../utils/dom.js';
import { shiftWeek } from './planner.js';

function createStepButton(label, iconName, onClick) {
  return el(
    'button',
    {
      class: 'icon-button menu-week__button',
      type: 'button',
      'aria-label': label,
      on: { click: onClick },
    },
    icon(iconName),
  );
}

export function createWeekSwitcher({ weekStart, onChange }) {
  let current = weekStart;
  const days = el('span', { class: 'menu-week__days' });
  const year = el('span', { class: 'menu-week__year' });
  const label = el(
    'p',
    { class: 'menu-week__label', 'aria-live': 'polite', 'aria-atomic': 'true' },
    days,
    ' ',
    year,
  );

  function render() {
    const parts = getWeekRangeParts(parseIsoDate(current));
    days.textContent = parts.days;
    year.textContent = parts.year;
  }

  function shift(amount) {
    current = shiftWeek(current, amount);
    render();
    onChange(current);
  }

  render();
  const element = el(
    'div',
    { class: 'menu-week', role: 'group', 'aria-label': 'Неделя' },
    createStepButton('Предыдущая неделя', 'chevron-left', () => shift(-1)),
    label,
    createStepButton('Следующая неделя', 'chevron-right', () => shift(1)),
  );
  return { element };
}
