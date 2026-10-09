const MILLISECONDS_IN_SECOND = 1000;
const LEAVING_CLASS = 'recipe-card--leaving';
const REFRESH_FRAMES = [{ opacity: 0.45, transform: 'translateY(0.25rem)' }, { opacity: 1 }];
const LEAVE_FRAMES = [{ opacity: 1 }, { opacity: 0, transform: 'scale(0.96)' }];
const REAPPEAR_FRAMES = [{ opacity: 0 }, { opacity: 1 }];

const running = new WeakMap();

function readToken(name) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function parseDuration(value) {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return value.trim().endsWith('ms') ? amount : amount * MILLISECONDS_IN_SECOND;
}

export function pickSettleFrames(shiftX, shiftY) {
  if (shiftX === 0 && shiftY === 0) return null;
  if (shiftX !== 0 && shiftY !== 0) return REAPPEAR_FRAMES;
  return [{ transform: `translate(${shiftX}px, ${shiftY}px)` }, { transform: 'none' }];
}

function readDuration(token) {
  return parseDuration(readToken(token));
}

function animate(element, keyframes, durationToken) {
  running.get(element)?.cancel();
  const duration = readDuration(durationToken);
  if (duration === 0 || typeof element.animate !== 'function') return null;
  const animation = element.animate(keyframes, {
    duration,
    easing: readToken('--ease-out') || 'ease-out',
  });
  running.set(element, animation);
  return animation;
}

export function refreshSoftly(element) {
  animate(element, REFRESH_FRAMES, '--duration-base');
}

export function captureLayout(elements) {
  const layout = new Map();
  for (const element of elements) {
    if (element.offsetParent === null) continue;
    layout.set(element, {
      left: element.offsetLeft,
      top: element.offsetTop,
      width: element.offsetWidth,
    });
  }
  return layout;
}

export function settleFromLayout(previousLayout, elements) {
  for (const element of elements) {
    const previous = previousLayout.get(element);
    if (!previous || element.offsetParent === null) continue;
    const frames = pickSettleFrames(
      previous.left - element.offsetLeft,
      previous.top - element.offsetTop,
    );
    if (frames) animate(element, frames, '--duration-panel');
  }
}

export function fadeOutInPlace(element, previous, positionedHost) {
  if (!previous || readDuration('--duration-base') === 0) return;
  element.inert = true;
  element.classList.add(LEAVING_CLASS);
  element.style.setProperty('--leaving-left', `${previous.left}px`);
  element.style.setProperty('--leaving-top', `${previous.top}px`);
  element.style.setProperty('--leaving-width', `${previous.width}px`);
  positionedHost.append(element);
  const animation = animate(element, LEAVE_FRAMES, '--duration-base');
  if (!animation) {
    element.remove();
    return;
  }
  animation.addEventListener('finish', () => element.remove());
  animation.addEventListener('cancel', () => element.remove());
}
