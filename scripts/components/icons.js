const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const ICON_PATHS = {
  search: ['M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14z', 'M20 20l-3.8-3.8'],
  heart: [
    'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z',
  ],
  clock: ['M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 0 0 0-17z', 'M12 7.5V12l3 2'],
  user: ['M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8z', 'M5 20.5c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5'],
  sun: [
    'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z',
    'M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  ],
  moon: ['M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z'],
  settings: [
    'M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z',
    'M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.3-1.3L14 3h-4l-.3 2.4a7 7 0 0 0-2.3 1.3l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.3 1.3L10 21h4l.3-2.4a7 7 0 0 0 2.3-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z',
  ],
  filters: [
    'M4 7h10M18 7h2M4 17h2M10 17h10',
    'M16 5a2 2 0 1 0 0 4a2 2 0 0 0 0-4z',
    'M8 15a2 2 0 1 0 0 4a2 2 0 0 0 0-4z',
  ],
  'arrow-left': ['M20 12H5', 'M11 6l-6 6l6 6'],
  'arrow-right': ['M4 12h15', 'M13 6l6 6l-6 6'],
  'chevron-left': ['M15 5l-7 7l7 7'],
  'chevron-right': ['M9 5l7 7l-7 7'],
  'chevron-down': ['M5 9l7 7l7-7'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  close: ['M6 6l12 12M18 6L6 18'],
};

export function icon(name, { size = 24, filled = false } = {}) {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('icon');
  if (filled) svg.classList.add('icon--filled');
  for (const d of ICON_PATHS[name] ?? []) {
    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}
