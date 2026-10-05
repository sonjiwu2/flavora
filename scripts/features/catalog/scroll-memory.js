import { listen } from '../../utils/dom.js';

const SAVE_DELAY_MS = 400;

function readEntryState() {
  const state = window.history.state;
  return typeof state === 'object' && state !== null ? state : {};
}

export function rememberScroll(stateKey) {
  let timer = null;
  let frame = null;

  function cancelTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }

  function save() {
    cancelTimer();
    const state = readEntryState();
    const position = Math.round(window.scrollY);
    if (state[stateKey] === position) return;
    window.history.replaceState({ ...state, [stateKey]: position }, '');
  }

  function scheduleSave() {
    cancelTimer();
    timer = window.setTimeout(save, SAVE_DELAY_MS);
  }

  function restore() {
    const position = readEntryState()[stateKey];
    if (!Number.isFinite(position) || position <= 0) return;
    frame = window.requestAnimationFrame(() => {
      frame = null;
      window.scrollTo(0, position);
    });
  }

  const stopListening = listen(window, 'scroll', scheduleSave, { passive: true });

  return {
    save,
    restore,
    dispose() {
      stopListening();
      cancelTimer();
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
    },
  };
}
