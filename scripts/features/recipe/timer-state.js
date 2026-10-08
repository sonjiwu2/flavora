const MS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const MIN_TIMER_MINUTES = 1;

export const MS_IN_MINUTE = MS_IN_SECOND * SECONDS_IN_MINUTE;
export const MAX_TIMER_MINUTES = 600;
export const TIMER_STATUS = Object.freeze({
  idle: 'idle',
  running: 'running',
  paused: 'paused',
  done: 'done',
});

export function parseTimerMinutes(text) {
  const trimmed = String(text).trim();
  const minutes = Number(trimmed);
  const valid =
    /^\d+$/.test(trimmed) && minutes >= MIN_TIMER_MINUTES && minutes <= MAX_TIMER_MINUTES;
  if (valid) return { minutes, error: null };
  return {
    minutes: null,
    error: `Введите целое число минут от ${MIN_TIMER_MINUTES} до ${MAX_TIMER_MINUTES}`,
  };
}

export function createTimer(descriptor, minutes) {
  const durationMs = minutes * MS_IN_MINUTE;
  return {
    ...descriptor,
    minutes,
    durationMs,
    status: TIMER_STATUS.idle,
    deadline: null,
    remainingMs: durationMs,
  };
}

export function startTimer(timer, now) {
  return {
    ...timer,
    status: TIMER_STATUS.running,
    deadline: now + timer.durationMs,
    remainingMs: timer.durationMs,
  };
}

export function getRemainingMs(timer, now) {
  if (timer.status !== TIMER_STATUS.running) return timer.remainingMs;
  return Math.max(0, timer.deadline - now);
}

export function pauseTimer(timer, now) {
  if (timer.status !== TIMER_STATUS.running) return timer;
  return {
    ...timer,
    status: TIMER_STATUS.paused,
    deadline: null,
    remainingMs: getRemainingMs(timer, now),
  };
}

export function resumeTimer(timer, now) {
  if (timer.status !== TIMER_STATUS.paused) return timer;
  return { ...timer, status: TIMER_STATUS.running, deadline: now + timer.remainingMs };
}

export function isExpired(timer, now) {
  return timer.status === TIMER_STATUS.running && now >= timer.deadline;
}

export function completeTimer(timer) {
  return { ...timer, status: TIMER_STATUS.done, deadline: null, remainingMs: 0 };
}

export function formatClock(milliseconds) {
  const totalSeconds = Math.ceil(Math.max(0, milliseconds) / MS_IN_SECOND);
  const seconds = totalSeconds % SECONDS_IN_MINUTE;
  const totalMinutes = Math.floor(totalSeconds / SECONDS_IN_MINUTE);
  const minutes = totalMinutes % MINUTES_IN_HOUR;
  const hours = Math.floor(totalMinutes / MINUTES_IN_HOUR);
  const tail = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return hours > 0 ? `${hours}:${tail}` : tail;
}

export function describeRemaining(milliseconds) {
  const totalSeconds = Math.ceil(Math.max(0, milliseconds) / MS_IN_SECOND);
  const minutes = Math.floor(totalSeconds / SECONDS_IN_MINUTE);
  const seconds = totalSeconds % SECONDS_IN_MINUTE;
  if (minutes === 0) return `${seconds} с`;
  return seconds === 0 ? `${minutes} мин` : `${minutes} мин ${seconds} с`;
}
