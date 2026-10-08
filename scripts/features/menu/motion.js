function whenSettled(element) {
  const animations = element.getAnimations({ subtree: true });
  return Promise.allSettled(animations.map((animation) => animation.finished));
}

export function isRendered(element) {
  return element.getClientRects().length > 0;
}

export function playEnter(element, motion) {
  delete element.dataset.entering;
  element.getBoundingClientRect();
  element.dataset.entering = motion;
  whenSettled(element).then(() => {
    if (element.dataset.entering === motion) delete element.dataset.entering;
  });
}

export function playLeave(element, motion) {
  element.inert = true;
  element.setAttribute('aria-hidden', 'true');
  element.dataset.leaving = motion;
  whenSettled(element).then(() => element.remove());
}

export function replaceWithMotion(host, next, { enter = null, leave = null } = {}) {
  const previous = [...host.children];
  const current = previous.find((child) => !('leaving' in child.dataset));
  host.append(next);
  for (const child of previous) {
    if (child === current && leave && isRendered(child)) playLeave(child, leave);
    else child.remove();
  }
  if (enter) playEnter(next, enter);
}

export function flyFrom(element, origin) {
  const target = element.getBoundingClientRect();
  element.style.setProperty('--menu-fly-x', `${Math.round(origin.left - target.left)}px`);
  element.style.setProperty('--menu-fly-y', `${Math.round(origin.top - target.top)}px`);
  playEnter(element, 'fly');
}
