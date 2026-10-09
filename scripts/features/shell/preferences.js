export const SYSTEM_CHOICE = 'system';

export const THEME_OPTIONS = Object.freeze([
  { value: SYSTEM_CHOICE, label: 'Как в системе' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
]);

export const MOTION_OPTIONS = Object.freeze([
  { value: SYSTEM_CHOICE, label: 'Как в системе' },
  { value: 'full', label: 'Обычное' },
  { value: 'reduce', label: 'Уменьшенное' },
]);

const THEME_TOGGLE_LABELS = Object.freeze({
  light: 'Включить тёмную тему',
  dark: 'Включить светлую тему',
});

export function resolveTheme(storedTheme, systemPrefersDark) {
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  return systemPrefersDark ? 'dark' : 'light';
}

export function oppositeTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}

export function themeToggleLabel(theme) {
  return THEME_TOGGLE_LABELS[theme] ?? THEME_TOGGLE_LABELS.light;
}

export function isMotionReduced(storedMotion, systemPrefersReduced) {
  if (storedMotion === 'reduce') return true;
  if (storedMotion === 'full') return false;
  return Boolean(systemPrefersReduced);
}

export function toChoice(storedValue) {
  return storedValue ?? SYSTEM_CHOICE;
}

export function fromChoice(choice) {
  return choice === SYSTEM_CHOICE ? null : choice;
}

export function spillDirection(theme) {
  return theme === 'dark' ? 'out' : 'in';
}

export function spillGeometry(originBox, viewport) {
  const x = Math.round(originBox.left + originBox.width / 2);
  const y = Math.round(originBox.top + originBox.height / 2);
  const farthestX = Math.max(x, viewport.width - x);
  const farthestY = Math.max(y, viewport.height - y);
  return { x, y, radius: Math.ceil(Math.hypot(farthestX, farthestY)) };
}
