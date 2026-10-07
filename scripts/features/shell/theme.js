import { getTheme, setTheme, subscribe } from '../../core/store.js';
import { prefersReducedMotion } from './motion.js';
import {
  oppositeTheme,
  resolveTheme,
  spillDirection,
  spillGeometry,
  themeToggleLabel,
} from './preferences.js';

const SPILL_PROPERTIES = Object.freeze({
  x: '--theme-spill-x',
  y: '--theme-spill-y',
  radius: '--theme-spill-radius',
});

const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
let toggleButton = null;
let spillOrigin = null;
let activeSpill = null;

function currentTheme() {
  return resolveTheme(getTheme(), systemDark.matches);
}

function syncBrowserChrome() {
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (!themeColor) return;
  themeColor.content = getComputedStyle(root).getPropertyValue('--color-bg').trim();
}

function ignoreSkippedTransition() {}

function paintTheme() {
  const theme = currentTheme();
  root.dataset.theme = theme;
  toggleButton.setAttribute('aria-label', themeToggleLabel(theme));
  syncBrowserChrome();
}

function canSpill() {
  return (
    typeof document.startViewTransition === 'function' &&
    document.visibilityState === 'visible' &&
    !prefersReducedMotion()
  );
}

function markSpill(origin) {
  const source = origin.isConnected ? origin : toggleButton;
  const geometry = spillGeometry(source.getBoundingClientRect(), {
    width: window.innerWidth,
    height: window.innerHeight,
  });
  root.dataset.themeSpill = spillDirection(currentTheme());
  for (const [key, property] of Object.entries(SPILL_PROPERTIES)) {
    root.style.setProperty(property, `${geometry[key]}px`);
  }
}

function clearSpill() {
  delete root.dataset.themeSpill;
  for (const property of Object.values(SPILL_PROPERTIES)) root.style.removeProperty(property);
  if (root.getAttribute('style') === '') root.removeAttribute('style');
}

function spillTheme(origin) {
  const transition = document.startViewTransition(() => {
    markSpill(origin);
    paintTheme();
  });
  activeSpill = transition;
  transition.ready.catch(ignoreSkippedTransition);
  transition.finished.catch(ignoreSkippedTransition).then(() => {
    if (activeSpill !== transition) return;
    activeSpill = null;
    clearSpill();
  });
}

function showTheme() {
  const isAlreadyPainted = root.dataset.theme === currentTheme();
  if (spillOrigin === null || isAlreadyPainted || !canSpill()) {
    activeSpill?.skipTransition();
    paintTheme();
    return;
  }
  spillTheme(spillOrigin);
}

function isWithin(event, box) {
  return (
    event.clientX >= box.left &&
    event.clientX <= box.right &&
    event.clientY >= box.top &&
    event.clientY <= box.bottom
  );
}

function handleClickDuringSpill(event) {
  if (activeSpill === null || event.target !== root) return;
  if (isWithin(event, toggleButton.getBoundingClientRect())) toggleButton.click();
  else activeSpill.skipTransition();
}

export function changeTheme(theme, origin) {
  spillOrigin = origin;
  setTheme(theme);
  spillOrigin = null;
}

export function initTheme(button) {
  toggleButton = button;
  paintTheme();
  button.addEventListener('click', () => changeTheme(oppositeTheme(currentTheme()), button));
  root.addEventListener('click', handleClickDuringSpill);
  subscribe((change) => {
    if (change.type === 'theme') showTheme();
  });
  systemDark.addEventListener('change', () => {
    if (getTheme() === null) showTheme();
  });
}
