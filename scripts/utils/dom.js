const PROPERTY_KEYS = new Set([
  'textContent',
  'value',
  'checked',
  'disabled',
  'hidden',
  'href',
  'src',
  'type',
  'id',
  'name',
]);

function appendChildren(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function el(tagName, props = {}, ...children) {
  const element = document.createElement(tagName);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') element.className = value;
    else if (key === 'dataset') Object.assign(element.dataset, value);
    else if (key === 'on') {
      for (const [eventName, handler] of Object.entries(value))
        element.addEventListener(eventName, handler);
    } else if (PROPERTY_KEYS.has(key)) element[key] = value;
    else element.setAttribute(key, value === true ? '' : String(value));
  }
  appendChildren(element, children);
  return element;
}

export function clear(element) {
  element.replaceChildren();
  return element;
}

export function listen(target, eventName, handler, options) {
  target.addEventListener(eventName, handler, options);
  return () => target.removeEventListener(eventName, handler, options);
}

export function createDisposer() {
  const tasks = [];
  return {
    add(task) {
      tasks.push(task);
      return task;
    },
    dispose() {
      while (tasks.length > 0) tasks.pop()();
    },
  };
}
