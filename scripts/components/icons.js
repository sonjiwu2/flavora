const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const VIEW_BOX = '0 0 24 24';
const DEFAULT_SIZE = 24;

const ICON_PATHS = {
  search: ['M10.5 3.75a6.75 6.75 0 1 0 0 13.5a6.75 6.75 0 0 0 0-13.5z', 'M15.4 15.4l4.85 4.85'],
  heart: [
    'M12 20.3c-.3 0-.6-.1-.85-.3C8.6 18 4 14.2 4 9.6C4 7 6 5 8.5 5c1.4 0 2.6.65 3.5 1.75C12.9 5.65 14.1 5 15.5 5C18 5 20 7 20 9.6c0 4.6-4.6 8.4-7.15 10.4c-.25.2-.55.3-.85.3z',
  ],
  clock: ['M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 0 0 0-17z', 'M12 7.25V12l3.2 2'],
  user: [
    'M12 11.5a3.75 3.75 0 1 0 0-7.5a3.75 3.75 0 0 0 0 7.5z',
    'M5 20c.4-3.4 3.2-5.25 7-5.25s6.6 1.85 7 5.25z',
  ],
  'chef-hat': [
    'M7.5 14.6A3.8 3.8 0 0 1 6.9 7.1A5.2 5.2 0 0 1 17.1 7.1A3.8 3.8 0 0 1 16.5 14.6',
    'M7.5 14.6v5.15h9V14.6',
    'M7.5 17.25h9',
  ],
  sun: [
    'M12 8.25a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5z',
    'M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.46 5.46l1.42 1.42M17.12 17.12l1.42 1.42M5.46 18.54l1.42-1.42M17.12 6.88l1.42-1.42',
  ],
  moon: ['M20.2 14.1A8.4 8.4 0 0 1 9.9 3.8a8.45 8.45 0 1 0 10.3 10.3z'],
  settings: [
    'M10.4 5.08l.39-2.1h2.42l.39 2.1a7.1 7.1 0 0 1 2.16.9l1.76-1.21l1.71 1.71l-1.21 1.76a7.1 7.1 0 0 1 .9 2.16l2.1.39v2.42l-2.1.39a7.1 7.1 0 0 1-.9 2.16l1.21 1.76l-1.71 1.71l-1.76-1.21a7.1 7.1 0 0 1-2.16.9l-.39 2.1h-2.42l-.39-2.1a7.1 7.1 0 0 1-2.16-.9l-1.76 1.21l-1.71-1.71l1.21-1.76a7.1 7.1 0 0 1-.9-2.16l-2.1-.39v-2.42l2.1-.39a7.1 7.1 0 0 1 .9-2.16L4.77 6.48l1.71-1.71l1.76 1.21a7.1 7.1 0 0 1 2.16-.9z',
    'M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z',
  ],
  filters: [
    'M3.5 8h3.2M11.3 8h9.2',
    'M9 5.7a2.3 2.3 0 1 0 0 4.6a2.3 2.3 0 0 0 0-4.6z',
    'M3.5 16h9.2M17.3 16h3.2',
    'M15 13.7a2.3 2.3 0 1 0 0 4.6a2.3 2.3 0 0 0 0-4.6z',
  ],
  'arrow-left': ['M20 12H4.5', 'M10.5 6l-6 6l6 6'],
  'arrow-right': ['M4 12h15.5', 'M13.5 6l6 6l-6 6'],
  'chevron-left': ['M14.5 5.5L8 12l6.5 6.5'],
  'chevron-right': ['M9.5 5.5L16 12l-6.5 6.5'],
  'chevron-down': ['M5.5 9.5L12 16l6.5-6.5'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  close: ['M6 6l12 12M18 6L6 18'],
  check: ['M4.5 12.75l5 5L19.5 7'],
  trash: [
    'M4.5 6.5h15',
    'M9.5 6.5V4.75a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6.5',
    'M6.5 6.5l.8 12.35a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12.35',
    'M10 10.5v6M14 10.5v6',
  ],
  swap: ['M4 8h15', 'M15.5 4.5L19 8l-3.5 3.5', 'M20 16H5', 'M8.5 12.5L5 16l3.5 3.5'],
  calendar: [
    'M5.5 5.5h13A1.5 1.5 0 0 1 20 7v11.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5V7a1.5 1.5 0 0 1 1.5-1.5z',
    'M4 10h16',
    'M8.5 3.5v4M15.5 3.5v4',
  ],
  play: ['M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z'],
  pause: ['M8.5 5v14M15.5 5v14'],
  reset: ['M4.5 12A7.5 7.5 0 1 0 12 4.5a8 8 0 0 0-5.6 2.3L4.5 8.75', 'M4.5 4.5v4.25h4.25'],
  cup: [
    'M5 9.5h11V14a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 14z',
    'M16 10.75h1.5a2.25 2.25 0 0 1 0 4.5H16',
    'M4 21h13',
    'M8.25 6.5c-.7-1 .7-1.75 0-3M12.25 6.5c-.7-1 .7-1.75 0-3',
  ],
  bowl: ['M3.5 11h17a8.5 8.5 0 0 1-5.5 7.95v1.55H9v-1.55A8.5 8.5 0 0 1 3.5 11z'],
  cutlery: [
    'M7 3.5v17',
    'M4.5 3.5V8a2.5 2.5 0 0 0 5 0V3.5',
    'M16.5 20.5v-17c2 .9 3 3.4 3 6.5v3h-3',
  ],
  bell: ['M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z', 'M10 20.75a2.1 2.1 0 0 0 4 0', 'M12 3.25V5'],
  more: [
    'M5.25 12a.75.75 0 1 0 1.5 0a.75.75 0 0 0-1.5 0z',
    'M11.25 12a.75.75 0 1 0 1.5 0a.75.75 0 0 0-1.5 0z',
    'M17.25 12a.75.75 0 1 0 1.5 0a.75.75 0 0 0-1.5 0z',
  ],
};

export const ICON_NAMES = Object.freeze(Object.keys(ICON_PATHS));

export function getIconPaths(name) {
  return ICON_PATHS[name] ?? [];
}

export function icon(name, { size = DEFAULT_SIZE, filled = false } = {}) {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', VIEW_BOX);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('icon');
  if (filled) svg.classList.add('icon--filled');
  for (const d of getIconPaths(name)) {
    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}
