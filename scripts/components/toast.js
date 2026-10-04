import { el } from '../utils/dom.js';

const MIN_LIFETIME_MS = 3200;
const MAX_LIFETIME_MS = 9000;
const READING_MS_PER_CHARACTER = 70;
const MAX_VISIBLE_TOASTS = 3;

const visibleToasts = new Map();

function findRegion() {
  return document.querySelector('#toast-region');
}

function lifetimeFor(text) {
  const readingTime = text.length * READING_MS_PER_CHARACTER;
  return Math.min(MAX_LIFETIME_MS, Math.max(MIN_LIFETIME_MS, readingTime));
}

function dismiss(text) {
  const entry = visibleToasts.get(text);
  if (!entry) return;
  window.clearTimeout(entry.timer);
  entry.element.remove();
  visibleToasts.delete(text);
}

function scheduleDismissal(text, duration) {
  return window.setTimeout(() => dismiss(text), duration);
}

export function moveToastRegion(host) {
  const region = findRegion();
  if (region && region.parentElement !== host) host.append(region);
}

export function showToast(message, { duration } = {}) {
  const region = findRegion();
  if (!region) return;
  const text = String(message);
  const lifetime = duration ?? lifetimeFor(text);
  const shown = visibleToasts.get(text);
  if (shown) {
    window.clearTimeout(shown.timer);
    shown.timer = scheduleDismissal(text, lifetime);
    return;
  }
  if (visibleToasts.size >= MAX_VISIBLE_TOASTS) dismiss(visibleToasts.keys().next().value);
  const element = el('p', { class: 'toast' }, text);
  region.append(element);
  visibleToasts.set(text, { element, timer: scheduleDismissal(text, lifetime) });
}
