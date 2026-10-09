import { el } from '../utils/dom.js';

const MIN_LIFETIME_MS = 3200;
const MIN_ACTION_LIFETIME_MS = 6500;
const MAX_LIFETIME_MS = 12000;
const READING_MS_PER_CHARACTER = 70;
const MAX_VISIBLE_TOASTS = 3;

const visibleToasts = new Map();

function findRegion() {
  return document.querySelector('#toast-region');
}

function lifetimeFor(text, action) {
  const readingTime = text.length * READING_MS_PER_CHARACTER;
  const minimum = action ? MIN_ACTION_LIFETIME_MS : MIN_LIFETIME_MS;
  return Math.min(MAX_LIFETIME_MS, Math.max(minimum, readingTime));
}

export function removeAfterExit(element) {
  element.inert = true;
  element.setAttribute('aria-hidden', 'true');
  const exitAnimations = element.getAnimations().map((animation) => animation.finished);
  Promise.allSettled(exitAnimations).then(() => element.remove());
}

function dismiss(text) {
  const entry = visibleToasts.get(text);
  if (!entry) return;
  window.clearTimeout(entry.timer);
  visibleToasts.delete(text);
  entry.element.dataset.leaving = '';
  removeAfterExit(entry.element);
}

function startCountdown(text) {
  const entry = visibleToasts.get(text);
  if (!entry) return;
  window.clearTimeout(entry.timer);
  entry.timer = window.setTimeout(() => dismiss(text), entry.lifetime);
}

function pauseCountdown(text) {
  const entry = visibleToasts.get(text);
  if (entry) window.clearTimeout(entry.timer);
}

function isInUse(element) {
  return element.matches(':hover') || element.contains(document.activeElement);
}

function createActionControl(text, action) {
  if (typeof action.href === 'string') {
    return el(
      'a',
      {
        class: 'toast__action',
        href: action.href,
        on: { click: () => window.setTimeout(() => dismiss(text)) },
      },
      action.label,
    );
  }
  const button = el('button', { class: 'toast__action', type: 'button' }, action.label);
  button.addEventListener(
    'click',
    () => {
      dismiss(text);
      action.onSelect?.();
    },
    { once: true },
  );
  return button;
}

function createToastElement(text, action) {
  if (!action) return el('p', { class: 'toast' }, text);
  return el(
    'div',
    { class: 'toast toast--with-action' },
    el('p', { class: 'toast__message' }, text),
    createActionControl(text, action),
  );
}

function keepWhileInUse(text, element) {
  const resume = () => {
    window.requestAnimationFrame(() => {
      if (!isInUse(element)) startCountdown(text);
    });
  };
  element.addEventListener('pointerenter', () => pauseCountdown(text));
  element.addEventListener('focusin', () => pauseCountdown(text));
  element.addEventListener('pointerleave', resume);
  element.addEventListener('focusout', resume);
}

function refreshShownToast(entry, text, lifetime, action) {
  entry.lifetime = lifetime;
  if (action) {
    const element = createToastElement(text, action);
    keepWhileInUse(text, element);
    entry.element.replaceWith(element);
    entry.element = element;
  }
  startCountdown(text);
}

export function moveToastRegion(host) {
  const region = findRegion();
  if (region && region.parentElement !== host) host.append(region);
}

export function showToast(message, { duration, action = null } = {}) {
  const region = findRegion();
  if (!region) return;
  const text = String(message);
  const lifetime = duration ?? lifetimeFor(text, action);
  const shown = visibleToasts.get(text);
  if (shown) {
    refreshShownToast(shown, text, lifetime, action);
    return;
  }
  if (visibleToasts.size >= MAX_VISIBLE_TOASTS) dismiss(visibleToasts.keys().next().value);
  const element = createToastElement(text, action);
  keepWhileInUse(text, element);
  region.append(element);
  visibleToasts.set(text, { element, lifetime, timer: 0 });
  startCountdown(text);
}
