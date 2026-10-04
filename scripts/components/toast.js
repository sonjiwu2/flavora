import { el } from '../utils/dom.js';

const TOAST_LIFETIME_MS = 3200;

export function showToast(message) {
  const region = document.querySelector('#toast-region');
  if (!region) return;
  const toast = el('p', { class: 'toast' }, message);
  region.append(toast);
  window.setTimeout(() => toast.remove(), TOAST_LIFETIME_MS);
}
