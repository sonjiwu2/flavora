import { getTheme, setTheme, subscribe } from '../../core/store.js';
import { prefersReducedMotion } from './motion.js';
import { oppositeTheme, resolveTheme, themeToggleLabel } from './preferences.js';

const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  return resolveTheme(getTheme(), systemDark.matches);
}

function syncBrowserChrome() {
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (!themeColor) return;
  themeColor.content = getComputedStyle(root).getPropertyValue('--color-bg').trim();
}

function ignoreSkippedTransition() {}

function paintTheme(theme, toggleButton) {
  root.dataset.theme = theme;
  toggleButton.setAttribute('aria-label', themeToggleLabel(theme));
  syncBrowserChrome();
}

function canCrossFade() {
  return (
    typeof document.startViewTransition === 'function' &&
    document.visibilityState === 'visible' &&
    !prefersReducedMotion()
  );
}

function showTheme(toggleButton) {
  const theme = currentTheme();
  if (root.dataset.theme === theme || !canCrossFade()) {
    paintTheme(theme, toggleButton);
    return;
  }
  const transition = document.startViewTransition(() => paintTheme(theme, toggleButton));
  transition.ready.catch(ignoreSkippedTransition);
  transition.finished.catch(ignoreSkippedTransition);
}

export function initTheme(toggleButton) {
  paintTheme(currentTheme(), toggleButton);
  toggleButton.addEventListener('click', () => setTheme(oppositeTheme(currentTheme())));
  subscribe((change) => {
    if (change.type === 'theme') showTheme(toggleButton);
  });
  systemDark.addEventListener('change', () => {
    if (getTheme() === null) showTheme(toggleButton);
  });
}
