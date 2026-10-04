import { createRouter } from './core/router.js';
import { getTheme, setTheme, subscribe } from './core/store.js';

const routes = [
  { name: 'recipes', pattern: /^\/recipes$/, load: () => import('./features/catalog/view.js') },
  {
    name: 'recipe',
    pattern: /^\/recipe\/([^/]+)$/,
    params: ['id'],
    load: () => import('./features/recipe/view.js'),
  },
  {
    name: 'favorites',
    pattern: /^\/favorites$/,
    load: () => import('./features/favorites/view.js'),
  },
  { name: 'menu', pattern: /^\/menu$/, load: () => import('./features/menu/view.js') },
];
const fallback = { name: 'not-found', load: () => import('./features/shell/not-found.js') };
const NAV_SECTIONS = {
  recipes: 'recipes',
  recipe: 'recipes',
  favorites: 'favorites',
  menu: 'menu',
};

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function resolveTheme() {
  return getTheme() ?? (systemDark.matches ? 'dark' : 'light');
}

function applyTheme() {
  document.documentElement.dataset.theme = resolveTheme();
}

function markActiveLink(route) {
  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === NAV_SECTIONS[route.name]) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

document.querySelector('#theme-toggle').addEventListener('click', () => {
  setTheme(resolveTheme() === 'dark' ? 'light' : 'dark');
});
subscribe((change) => {
  if (change.type === 'theme') applyTheme();
});
systemDark.addEventListener('change', applyTheme);
applyTheme();

createRouter({
  routes,
  fallback,
  outlet: document.querySelector('#app'),
  onChange: markActiveLink,
}).start();
