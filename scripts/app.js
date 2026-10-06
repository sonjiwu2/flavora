import { createRouter } from './core/router.js';
import { initSkipLink, markActiveSection } from './features/shell/header.js';
import { initMotion } from './features/shell/motion.js';
import { createScreenChangeHandler } from './features/shell/screen-change.js';
import { openSettings } from './features/shell/settings.js';
import { initStorageNotice } from './features/shell/storage-notice.js';
import { initTheme } from './features/shell/theme.js';

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

const outlet = document.querySelector('#app');
const handleScreenChange = createScreenChangeHandler(outlet);

initStorageNotice();
initMotion();
initTheme(document.querySelector('#theme-toggle'));
initSkipLink(outlet);
document.querySelector('#settings-open').addEventListener('click', openSettings);

createRouter({
  routes,
  fallback,
  outlet,
  onChange(route) {
    markActiveSection(route);
    handleScreenChange(route);
  },
}).start();
