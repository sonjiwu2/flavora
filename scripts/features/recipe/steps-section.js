import { stepImage } from '../../data/media.js';
import { createDisposer, el } from '../../utils/dom.js';
import { keepShortWordsAttached, pluralize, typeset } from '../../utils/format.js';
import { prefersReducedMotion } from '../shell/motion.js';
import { describeServings } from './ingredients-section.js';
import { createStepTimer } from './timer-panel.js';

const STEP_FORMS = ['шаг', 'шага', 'шагов'];
const AWAITING_CLASS = 'step--awaiting';
const LOADING_CLASS = 'step__image--loading';
const REVEAL_MARGIN = '0px 0px -8% 0px';

function createImage(source) {
  const image = el('img', {
    class: 'step__image',
    alt: '',
    width: source.width,
    height: source.height,
    loading: 'lazy',
    decoding: 'async',
    src: source.src,
  });
  if (image.complete) return image;
  const settle = () => image.classList.remove(LOADING_CLASS);
  image.classList.add(LOADING_CLASS);
  image.addEventListener('load', settle, { once: true });
  image.addEventListener('error', settle, { once: true });
  return image;
}

function createFigure(recipe, step, stepNumber) {
  return el(
    step.note ? 'figure' : 'div',
    { class: 'step__figure' },
    createImage(stepImage(recipe.id, stepNumber)),
    step.note && el('figcaption', { class: 'step__note' }, typeset(step.note)),
  );
}

function createStep(recipe, step, stepNumber, disposer) {
  const timer = step.timerMinutes ? createStepTimer(recipe, step, stepNumber) : null;
  if (timer) disposer.add(timer.dispose);
  return el(
    'li',
    { class: 'step' },
    el(
      'span',
      { class: 'step__number', 'aria-hidden': 'true' },
      String(stepNumber).padStart(2, '0'),
    ),
    el(
      'div',
      { class: 'step__body' },
      el('h3', { class: 'step__title' }, keepShortWordsAttached(step.title)),
      el('p', { class: 'step__text' }, typeset(step.text)),
      timer?.element,
    ),
    createFigure(recipe, step, stepNumber),
  );
}

function revealOnScroll(steps) {
  if (prefersReducedMotion() || typeof IntersectionObserver !== 'function') return () => {};
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const { target } = entry;
        const isBelowScreen = entry.boundingClientRect.top > (entry.rootBounds?.bottom ?? 0);
        if (!entry.isIntersecting && isBelowScreen) {
          target.classList.add(AWAITING_CLASS);
          continue;
        }
        target.classList.remove(AWAITING_CLASS);
        observer.unobserve(target);
      }
    },
    { rootMargin: REVEAL_MARGIN },
  );
  for (const step of steps) observer.observe(step);
  return () => {
    observer.disconnect();
    for (const step of steps) step.classList.remove(AWAITING_CLASS);
  };
}

export function createStepsSection(recipe) {
  const disposer = createDisposer();
  const count = recipe.steps.length;
  const steps = recipe.steps.map((step, index) => createStep(recipe, step, index + 1, disposer));
  const servingsNote = el(
    'p',
    { class: 'recipe__servings-note', hidden: true },
    typeset(
      `Количества в шагах указаны на ${describeServings(recipe.servings)} — сверяйтесь со списком ингредиентов.`,
    ),
  );

  function setServings(servings) {
    servingsNote.hidden = servings === recipe.servings;
  }

  const element = el(
    'section',
    { class: 'recipe__steps', 'aria-labelledby': 'steps-title' },
    el(
      'div',
      { class: 'recipe__steps-header' },
      el('h2', { class: 'section-title', id: 'steps-title' }, 'Приготовление'),
      el('p', { class: 'recipe__steps-count' }, `${count} ${pluralize(count, STEP_FORMS)}`),
    ),
    servingsNote,
    el('ol', { class: 'steps', role: 'list' }, steps),
  );
  disposer.add(revealOnScroll(steps));
  return { element, setServings, dispose: disposer.dispose };
}
