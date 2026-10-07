const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAYS_IN_WEEK = 7;
const FIRST_WEEKEND_INDEX = 5;

const MONTHS_GENITIVE = Object.freeze([
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]);

export const WEEKDAYS_SHORT = Object.freeze(['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']);

export const WEEKDAYS_LONG = Object.freeze([
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
  'воскресенье',
]);

function pad(value, length) {
  return String(value).padStart(length, '0');
}

export function createLocalDate(year, monthIndex, day) {
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, monthIndex, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function toIsoDate(date) {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`;
}

export function parseIsoDate(text) {
  const match = typeof text === 'string' ? ISO_DATE_PATTERN.exec(text) : null;
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = createLocalDate(year, month - 1, day);
  return toIsoDate(date) === text ? date : null;
}

export function isIsoDate(text) {
  return parseIsoDate(text) !== null;
}

export function addDays(date, amount) {
  return createLocalDate(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function addWeeks(date, amount) {
  return addDays(date, amount * DAYS_IN_WEEK);
}

export function getWeekdayIndex(date) {
  return (date.getDay() + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK;
}

export function startOfWeek(date) {
  return addDays(date, -getWeekdayIndex(date));
}

export function getWeekDays(date) {
  const monday = startOfWeek(date);
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(monday, index));
}

export function isSameDay(first, second) {
  return toIsoDate(first) === toIsoDate(second);
}

export function isWeekend(date) {
  return getWeekdayIndex(date) >= FIRST_WEEKEND_INDEX;
}

export function formatWeekdayShort(date) {
  return WEEKDAYS_SHORT[getWeekdayIndex(date)];
}

export function formatWeekdayLong(date) {
  return WEEKDAYS_LONG[getWeekdayIndex(date)];
}

export function formatDayMonth(date) {
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}

export function formatDayLong(date) {
  return `${formatWeekdayLong(date)}, ${formatDayMonth(date)}`;
}

export function getWeekRangeParts(date) {
  const monday = startOfWeek(date);
  const sunday = addDays(monday, DAYS_IN_WEEK - 1);
  const year = String(sunday.getFullYear());
  if (monday.getFullYear() !== sunday.getFullYear()) {
    const start = `${formatDayMonth(monday)} ${monday.getFullYear()}`;
    return { days: `${start} – ${formatDayMonth(sunday)}`, year };
  }
  if (monday.getMonth() !== sunday.getMonth()) {
    return { days: `${formatDayMonth(monday)} – ${formatDayMonth(sunday)}`, year };
  }
  return { days: `${monday.getDate()}–${formatDayMonth(sunday)}`, year };
}

export function formatWeekRange(date) {
  const { days, year } = getWeekRangeParts(date);
  return `${days} ${year}`;
}
