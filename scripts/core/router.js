const DEFAULT_PATH = '/recipes';

export function parseHash(hash) {
  const raw = hash.replace(/^#/, '');
  const [pathPart, queryPart = ''] = raw.split('?');
  const path = `/${pathPart.replace(/^\/+|\/+$/g, '')}`;
  return {
    path: path === '/' ? DEFAULT_PATH : path,
    query: Object.fromEntries(new URLSearchParams(queryPart)),
  };
}

export function buildHref(path, query = {}) {
  const entries = Object.entries(query).filter(
    ([, value]) => value !== null && value !== undefined && value !== '',
  );
  const search = new URLSearchParams(entries).toString();
  return search ? `#${path}?${search}` : `#${path}`;
}

export function matchRoute(routes, path) {
  for (const route of routes) {
    const match = route.pattern.exec(path);
    if (!match) continue;
    const params = {};
    (route.params ?? []).forEach((name, index) => {
      params[name] = decodeURIComponent(match[index + 1]);
    });
    return { route, params };
  }
  return null;
}

export function navigate(path, query) {
  window.location.hash = buildHref(path, query);
}

export function updateAddress(path, query, { replace = false } = {}) {
  const href = buildHref(path, query);
  if (replace) window.history.replaceState(window.history.state, '', href);
  else window.history.pushState(window.history.state, '', href);
}

export function setPageTitle(title) {
  document.title = title ? `${title} — Flavora` : 'Flavora — домашние рецепты';
}

export function createRouter({ routes, fallback, outlet, onChange }) {
  let dispose = null;
  let navigationId = 0;

  async function render() {
    const currentId = ++navigationId;
    const { path, query } = parseHash(window.location.hash);
    const matched = matchRoute(routes, path) ?? { route: fallback, params: {} };
    const module = await matched.route.load();
    if (currentId !== navigationId) return;

    if (typeof dispose === 'function') dispose();
    dispose = null;
    const focusWasInside = outlet.contains(document.activeElement);
    outlet.replaceChildren();
    const context = { name: matched.route.name, path, params: matched.params, query };
    dispose = module.mount(outlet, context) ?? null;
    onChange?.(context);
    if (focusWasInside && document.activeElement === document.body) {
      outlet.focus({ preventScroll: true });
    }
  }

  function start() {
    window.addEventListener('hashchange', render);
    return render();
  }

  return { start, refresh: render };
}
