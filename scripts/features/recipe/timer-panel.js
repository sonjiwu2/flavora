import { icon } from '../../components/icons.js';
import { el } from '../../utils/dom.js';
import { pluralize } from '../../utils/format.js';
import { TIMER_STATUS, describeRemaining, formatClock, parseTimerMinutes } from './timer-state.js';
import {
  getTimer,
  getTimerRemainingMs,
  isTimerSoundEnabled,
  isTimerSoundSupported,
  pauseTimer,
  resetTimer,
  resumeTimer,
  setTimerSoundEnabled,
  startTimer,
  subscribeTimers,
  timerKey,
} from './timers.js';

const MS_IN_MINUTE = 60_000;
const MINUTE_FORMS = ['минуту', 'минуты', 'минут'];
const PRIMARY_LABELS = {
  [TIMER_STATUS.idle]: 'Старт',
  [TIMER_STATUS.running]: 'Пауза',
  [TIMER_STATUS.paused]: 'Продолжить',
  [TIMER_STATUS.done]: 'Старт',
};
const STATE_LABELS = {
  [TIMER_STATUS.idle]: 'Таймер не запущен',
  [TIMER_STATUS.running]: 'Идёт отсчёт',
  [TIMER_STATUS.paused]: 'Пауза',
  [TIMER_STATUS.done]: 'Готово!',
};

function createSoundSwitch() {
  const input = el('input', {
    class: 'switch__input',
    type: 'checkbox',
    role: 'switch',
    checked: isTimerSoundEnabled(),
    on: { change: () => setTimerSoundEnabled(input.checked) },
  });
  const element = el(
    'label',
    { class: 'switch step-timer__sound' },
    input,
    el('span', { class: 'switch__track', 'aria-hidden': 'true' }),
    el('span', { class: 'switch__label' }, 'Звуковой сигнал'),
  );
  return { element, input };
}

export function createStepTimer(recipe, step, stepNumber) {
  const key = timerKey(recipe.id, stepNumber);
  const descriptor = { key, recipeId: recipe.id, stepNumber, stepTitle: step.title };
  const panelId = `timer-panel-${stepNumber}`;
  const inputId = `timer-minutes-${stepNumber}`;
  const errorId = `timer-error-${stepNumber}`;
  let expanded = getTimer(key) !== null;

  const badge = el('span', { class: 'step-timer__badge', 'aria-hidden': 'true' });
  const toggle = el(
    'button',
    {
      class: 'button button--quiet button--small step-timer__toggle',
      type: 'button',
      'aria-controls': panelId,
      on: { click: toggleExpanded },
    },
    icon('clock'),
    'Таймер',
    badge,
  );
  const input = el('input', {
    class: 'step-timer__input',
    id: inputId,
    type: 'text',
    inputmode: 'numeric',
    autocomplete: 'off',
    'aria-describedby': errorId,
    value: String(getTimer(key)?.minutes ?? step.timerMinutes),
    on: { input: clearError },
  });
  const error = el('p', { class: 'step-timer__error', id: errorId, role: 'alert', hidden: true });
  const time = el('p', { class: 'step-timer__time', role: 'timer', 'aria-live': 'off' });
  const state = el('p', { class: 'step-timer__state' });
  const announcer = el('p', { class: 'visually-hidden', role: 'status' });
  const primary = el('button', {
    class: 'button button--small',
    type: 'button',
    on: { click: runPrimaryAction },
  });
  const reset = el(
    'button',
    { class: 'button button--secondary button--small', type: 'button', on: { click: resetNow } },
    'Сброс',
  );
  const sound = isTimerSoundSupported() ? createSoundSwitch() : null;
  const panel = el(
    'div',
    { class: 'step-timer__panel', id: panelId },
    el(
      'div',
      { class: 'step-timer__display' },
      el('div', { class: 'step-timer__readout' }, time, state),
      el(
        'div',
        { class: 'field step-timer__field' },
        el('label', { class: 'field__label', for: inputId }, 'Минуты'),
        input,
      ),
    ),
    error,
    el('div', { class: 'step-timer__controls' }, primary, reset),
    sound?.element,
    announcer,
  );
  const element = el('div', { class: 'step-timer' }, toggle, panel);

  function currentStatus() {
    return getTimer(key)?.status ?? TIMER_STATUS.idle;
  }

  function previewMs() {
    const { minutes } = parseTimerMinutes(input.value);
    return (minutes ?? 0) * MS_IN_MINUTE;
  }

  function renderTime() {
    const status = currentStatus();
    const clock = formatClock(
      status === TIMER_STATUS.idle ? previewMs() : getTimerRemainingMs(key),
    );
    if (time.textContent !== clock) time.textContent = clock;
    const badgeText = expanded || status === TIMER_STATUS.idle ? '' : clock;
    if (badge.textContent !== badgeText) badge.textContent = badgeText;
  }

  function render() {
    const status = currentStatus();
    const locked = status === TIMER_STATUS.running || status === TIMER_STATUS.paused;
    element.dataset.status = status;
    toggle.setAttribute('aria-expanded', String(expanded));
    panel.hidden = !expanded;
    input.disabled = locked;
    primary.textContent = PRIMARY_LABELS[status];
    reset.hidden = status === TIMER_STATUS.idle;
    state.textContent = STATE_LABELS[status];
    renderTime();
  }

  function toggleExpanded() {
    expanded = !expanded;
    if (sound) sound.input.checked = isTimerSoundEnabled();
    render();
  }

  function clearError() {
    error.hidden = true;
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    renderTime();
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }

  function startNow() {
    const { minutes, error: message } = parseTimerMinutes(input.value);
    if (message) {
      showError(message);
      return;
    }
    clearError();
    input.value = String(minutes);
    startTimer(descriptor, minutes);
    announcer.textContent = `Таймер запущен на ${minutes} ${pluralize(minutes, MINUTE_FORMS)}`;
  }

  function runPrimaryAction() {
    const status = currentStatus();
    if (status === TIMER_STATUS.running) {
      pauseTimer(key);
      announcer.textContent = `Таймер на паузе, осталось ${describeRemaining(getTimerRemainingMs(key))}`;
    } else if (status === TIMER_STATUS.paused) {
      resumeTimer(key);
      announcer.textContent = `Таймер продолжен, осталось ${describeRemaining(getTimerRemainingMs(key))}`;
    } else {
      startNow();
    }
  }

  function resetNow() {
    resetTimer(key);
    announcer.textContent = 'Таймер сброшен';
    primary.focus();
  }

  let renderedStatus = currentStatus();
  const unsubscribe = subscribeTimers((changedKey) => {
    if (changedKey !== key) return;
    const status = currentStatus();
    if (status === renderedStatus) {
      renderTime();
      return;
    }
    renderedStatus = status;
    render();
  });

  render();
  return { element, dispose: unsubscribe };
}
