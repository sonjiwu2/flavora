const MINUTES_IN_HOUR = 60;
const NO_BREAK_SPACE = '\u00A0';
const SPACE_AFTER_NUMBER = /(?<=\d) (?=[°\p{L}])/gu;
const SPACE_INSIDE_SPOON_UNIT = /(?<=(?:ст|ч)\.) (?=л\.)/g;
const SPACE_BEFORE_DASH = / (?=—)/g;
const SHORT_WORD_BEFORE_SPACE = /(?<![\p{L}\p{N}])(\p{L}{1,2}) (?=\S)/gu;

export function pluralize(count, [one, few, many]) {
  const lastTwo = Math.abs(count) % 100;
  const last = lastTwo % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

export function formatDuration(totalMinutes, { long = false } = {}) {
  const hours = Math.floor(totalMinutes / MINUTES_IN_HOUR);
  const minutes = totalMinutes % MINUTES_IN_HOUR;
  const minuteLabel = long ? pluralize(minutes, ['минута', 'минуты', 'минут']) : 'мин';
  const parts = [];
  if (hours > 0) parts.push(`${hours} ч`);
  if (minutes > 0 || hours === 0) parts.push(`${minutes} ${minuteLabel}`);
  return parts.join(' ');
}

export function formatServings(count) {
  return `${count} ${pluralize(count, ['порция', 'порции', 'порций'])}`;
}

export function keepShortWordsAttached(text) {
  return text.replace(SHORT_WORD_BEFORE_SPACE, `$1${NO_BREAK_SPACE}`);
}

export function keepNumbersWithUnits(text) {
  return text
    .replace(SPACE_AFTER_NUMBER, NO_BREAK_SPACE)
    .replace(SPACE_INSIDE_SPOON_UNIT, NO_BREAK_SPACE)
    .replace(SPACE_BEFORE_DASH, NO_BREAK_SPACE);
}

export function normalizeSearchText(text) {
  return text.toLocaleLowerCase('ru').replaceAll('ё', 'е').replace(/\s+/g, ' ').trim();
}
