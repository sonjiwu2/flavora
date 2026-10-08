import { closeAllDialogs } from '../../components/modal.js';
import { setPageTitle, updateAddress } from '../../core/router.js';
import { subscribe } from '../../core/store.js';
import { isIsoDate, parseIsoDate, toIsoDate } from '../../utils/dates.js';
import { createDisposer, el, listen } from '../../utils/dom.js';
import { createBoard } from './board.js';
import { createMealActions } from './meal-actions.js';
import { replaceWithMotion } from './motion.js';
import { pickDefaultDay, resolveWeekStart } from './planner.js';
import { createWeekSwitcher } from './week-switcher.js';

const MENU_PATH = '/menu';

function readToday() {
  return toIsoDate(new Date());
}

function normalizeAddress(requestedWeek, weekStart) {
  if (requestedWeek === undefined || requestedWeek === weekStart) return;
  const query = isIsoDate(requestedWeek) ? { week: weekStart } : {};
  updateAddress(MENU_PATH, query, { replace: true });
}

export function mount(outlet, route) {
  setPageTitle('Меню на неделю');
  const disposer = createDisposer();
  const state = { today: readToday(), weekStart: null, board: null };
  state.weekStart = resolveWeekStart(route.query.week, parseIsoDate(state.today));
  normalizeAddress(route.query.week, state.weekStart);

  const boardHost = el('div', { class: 'menu__board' });
  const handlers = createMealActions({
    getBoard: () => state.board,
    getWeekStart: () => state.weekStart,
    getToday: () => state.today,
  });

  function showWeek(weekStart, motion = null) {
    state.weekStart = weekStart;
    state.board = createBoard({
      weekStart,
      today: state.today,
      selectedDay: pickDefaultDay(weekStart, state.today),
      handlers,
    });
    replaceWithMotion(boardHost, state.board.element, { enter: motion, leave: motion });
  }

  function refreshToday() {
    if (document.visibilityState !== 'visible' || readToday() === state.today) return;
    state.today = readToday();
    showWeek(state.weekStart);
  }

  const switcher = createWeekSwitcher({
    weekStart: state.weekStart,
    onChange(weekStart, direction) {
      updateAddress(MENU_PATH, { week: weekStart });
      showWeek(weekStart, direction);
    },
  });

  outlet.append(
    el(
      'div',
      { class: 'menu' },
      el(
        'header',
        { class: 'menu__intro' },
        el('h1', { class: 'page-title' }, 'Меню на неделю'),
        el('p', { class: 'page-subtitle' }, 'Распределите любимые блюда по дням.'),
        switcher.element,
      ),
      boardHost,
    ),
  );
  showWeek(state.weekStart, 'first');

  disposer.add(
    subscribe((change) => {
      if (change.type === 'menu') state.board.refresh();
    }),
  );
  disposer.add(listen(document, 'visibilitychange', refreshToday));
  disposer.add(closeAllDialogs);
  return () => disposer.dispose();
}
