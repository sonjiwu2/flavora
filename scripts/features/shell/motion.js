import { getMotion, subscribe } from '../../core/store.js';
import { isMotionReduced } from './preferences.js';

const systemReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function applyMotion() {
  const motion = getMotion();
  if (motion === null) delete document.documentElement.dataset.motion;
  else document.documentElement.dataset.motion = motion;
}

export function prefersReducedMotion() {
  return isMotionReduced(getMotion(), systemReducedMotion.matches);
}

export function initMotion() {
  applyMotion();
  subscribe((change) => {
    if (change.type === 'motion') applyMotion();
  });
}
