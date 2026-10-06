const NAV_SECTIONS = Object.freeze({
  recipes: 'recipes',
  recipe: 'recipes',
  favorites: 'favorites',
  menu: 'menu',
});

export function markActiveSection(route) {
  const activeSection = NAV_SECTIONS[route.name] ?? null;
  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === activeSection) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

export function initSkipLink(outlet) {
  const skipLink = document.querySelector('[data-skip-link]');
  skipLink?.addEventListener('click', (event) => {
    event.preventDefault();
    outlet.focus();
  });
}
