import { stepImage } from '../../data/media.js';
import { createDisposer, el } from '../../utils/dom.js';
import { pluralize } from '../../utils/format.js';
import { describeServings } from './ingredients-section.js';
import { createStepTimer } from './timer-panel.js';

const STEP_FORMS = ['шаг', 'шага', 'шагов'];

function createFigure(recipe, step, stepNumber) {
  const source = stepImage(recipe.id, stepNumber);
  return el(
    'figure',
    { class: 'step__figure' },
    el('img', {
      class: 'step__image',
      alt: '',
      width: source.width,
      height: source.height,
      loading: 'lazy',
      decoding: 'async',
      src: source.src,
    }),
    step.note && el('figcaption', { class: 'step__note' }, step.note),
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
      el('h3', { class: 'step__title' }, step.title),
      el('p', { class: 'step__text' }, step.text),
      timer?.element,
    ),
    createFigure(recipe, step, stepNumber),
  );
}

export function createStepsSection(recipe) {
  const disposer = createDisposer();
  const count = recipe.steps.length;
  const servingsNote = el(
    'p',
    { class: 'recipe__servings-note', hidden: true },
    `Количества в шагах указаны на ${describeServings(recipe.servings)} — сверяйтесь со списком ингредиентов.`,
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
    el(
      'ol',
      { class: 'steps' },
      recipe.steps.map((step, index) => createStep(recipe, step, index + 1, disposer)),
    ),
  );
  return { element, setServings, dispose: disposer.dispose };
}
