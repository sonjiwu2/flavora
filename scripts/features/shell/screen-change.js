import { closeAllDialogs } from '../../components/modal.js';

const ENTRY_KEY = 'flavoraEntry';
const scrollPositions = new Map();
let entryCount = 0;

function readEntryId() {
  return window.history.state?.[ENTRY_KEY] ?? null;
}

function createEntryId() {
  entryCount += 1;
  const id = `${Date.now()}-${entryCount}`;
  window.history.replaceState({ ...window.history.state, [ENTRY_KEY]: id }, '');
  return id;
}

function restartEnterAnimation(outlet) {
  delete outlet.dataset.entering;
  outlet.getBoundingClientRect();
  outlet.dataset.entering = '';
}

export function createScreenChangeHandler(outlet) {
  let currentPath = null;
  let currentEntryId = null;

  window.history.scrollRestoration = 'manual';
  window.addEventListener(
    'scroll',
    () => {
      if (currentEntryId !== null) scrollPositions.set(currentEntryId, window.scrollY);
    },
    { passive: true },
  );

  return function handleScreenChange(route) {
    const isFirstScreen = currentPath === null;
    const isSameScreen = route.path === currentPath;
    const knownEntryId = readEntryId();
    currentPath = route.path;
    currentEntryId = knownEntryId ?? createEntryId();
    if (isSameScreen) return;

    restartEnterAnimation(outlet);
    if (isFirstScreen) return;
    closeAllDialogs();
    window.scrollTo(0, knownEntryId === null ? 0 : (scrollPositions.get(knownEntryId) ?? 0));
    outlet.focus({ preventScroll: true });
  };
}
