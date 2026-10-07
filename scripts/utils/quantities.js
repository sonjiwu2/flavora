import { pluralize } from './format.js';

const NBSP = ' ';
const RANGE_DASH = '–';
const LARGE_UNIT_THRESHOLD = 1000;
const MEASURE_STEPS = [
  { below: 25, step: 1 },
  { below: 250, step: 5 },
  { below: 1000, step: 10 },
  { below: Infinity, step: 50 },
];
const FRACTION_GLYPHS = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

export const UNITS = Object.freeze({
  g: { kind: 'measure', label: 'г', largeLabel: 'кг', factor: 1 },
  kg: { kind: 'measure', label: 'г', largeLabel: 'кг', factor: 1000 },
  ml: { kind: 'measure', label: 'мл', largeLabel: 'л', factor: 1 },
  l: { kind: 'measure', label: 'мл', largeLabel: 'л', factor: 1000 },
  pcs: { kind: 'fraction', label: 'шт.' },
  tsp: { kind: 'fraction', label: `ч.${NBSP}л.` },
  tbsp: { kind: 'fraction', label: `ст.${NBSP}л.` },
  bunch: { kind: 'fraction', forms: ['пучок', 'пучка', 'пучков'] },
  head: { kind: 'fraction', forms: ['головка', 'головки', 'головок'] },
  clove: { kind: 'whole', forms: ['зубчик', 'зубчика', 'зубчиков'] },
  pinch: { kind: 'whole', forms: ['щепотка', 'щепотки', 'щепоток'] },
  sprig: { kind: 'whole', forms: ['веточка', 'веточки', 'веточек'] },
  slice: { kind: 'whole', forms: ['ломтик', 'ломтика', 'ломтиков'] },
  leaf: { kind: 'whole', forms: ['лист', 'листа', 'листьев'] },
  stalk: { kind: 'whole', forms: ['стебель', 'стебля', 'стеблей'] },
  taste: { kind: 'phrase', label: 'по вкусу' },
  serve: { kind: 'phrase', label: 'для подачи' },
});

export function isKnownUnit(unit) {
  return Object.hasOwn(UNITS, unit);
}

function scaleValue(value, baseServings, servings) {
  return (value * servings) / baseServings;
}

export function scaleIngredient(ingredient, baseServings, servings) {
  const { amount } = ingredient;
  const fixed = ingredient.scalable === false || amount === null || amount === undefined;
  if (fixed || baseServings === servings) return ingredient;
  const scaled = Array.isArray(amount)
    ? amount.map((value) => scaleValue(value, baseServings, servings))
    : scaleValue(amount, baseServings, servings);
  return { ...ingredient, amount: scaled };
}

function roundToStep(value, step) {
  return Math.max(step, Math.round(value / step + Number.EPSILON) * step);
}

function roundMeasure(value) {
  const { step } = MEASURE_STEPS.find((range) => value < range.below);
  const rounded = roundToStep(value, step);
  const next = MEASURE_STEPS.find((range) => rounded < range.below);
  return roundToStep(rounded, next.step);
}

function roundFraction(value) {
  if (value < 1) return roundToStep(value, 0.25);
  if (value < 4) return roundToStep(value, 0.5);
  return Math.round(value);
}

function roundByKind(value, kind) {
  if (kind === 'measure') return roundMeasure(value);
  if (kind === 'fraction') return roundFraction(value);
  return Math.max(1, Math.round(value));
}

function formatDecimal(value) {
  return String(Number(value.toFixed(2))).replace('.', ',');
}

function formatCount(value) {
  const whole = Math.floor(value);
  const glyph = FRACTION_GLYPHS[value - whole];
  if (!glyph) return formatDecimal(value);
  return whole > 0 ? `${whole}${glyph}` : glyph;
}

function countLabel(definition, value) {
  if (!definition.forms) return definition.label;
  return Number.isInteger(value) ? pluralize(value, definition.forms) : definition.forms[1];
}

function formatMeasure(values, definition) {
  const rounded = values.map((value) => roundMeasure(value * definition.factor));
  const large = rounded.at(-1) >= LARGE_UNIT_THRESHOLD;
  const label = large ? definition.largeLabel : definition.label;
  const numbers = rounded.map((value) => formatDecimal(large ? value / 1000 : value));
  return { numbers, label };
}

function formatCounted(values, definition) {
  const rounded = values.map((value) => roundByKind(value, definition.kind));
  return {
    numbers: rounded.map(formatCount),
    label: countLabel(definition, rounded.at(-1)),
  };
}

export function formatAmount(amount, unit) {
  const definition = UNITS[unit];
  if (!definition) return '';
  if (definition.kind === 'phrase') return definition.label;
  if (amount === null || amount === undefined) return '';
  const values = Array.isArray(amount) ? amount : [amount];
  const { numbers, label } =
    definition.kind === 'measure'
      ? formatMeasure(values, definition)
      : formatCounted(values, definition);
  const distinct = [...new Set(numbers)];
  return `${distinct.join(RANGE_DASH)}${NBSP}${label}`;
}

export function formatIngredientAmount(ingredient, baseServings, servings) {
  const scaled = scaleIngredient(ingredient, baseServings, servings);
  return formatAmount(scaled.amount, scaled.unit);
}
