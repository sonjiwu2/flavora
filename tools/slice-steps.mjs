import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { STEP_SIZE } from '../scripts/data/media.js';
import { recipes } from '../scripts/data/recipes.js';

const COLUMNS = 3;
const ROWS = 2;
const SCENE_COUNT = COLUMNS * ROWS;
const CHANNELS = 4;
const CORE_ALPHA = 16;
const BODY_AREA = 2600;
const SPECK_AREA = 24;
const MERGED_SHARE = 0.25;
const MARGIN = 0.06;
const STRAIGHT_RUN = 60;
const GRID_SLACK = 20;
const WEBP_OPTIONS = { quality: 80, alphaQuality: 100, effort: 4, smartSubsample: true };
const NEIGHBOURS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readOptions(argv) {
  const options = { sheets: null, out: join(projectRoot, 'assets', 'steps'), report: null };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--out' || argument === '--report') {
      options[argument.slice(2)] = resolve(argv[index + 1]);
      index += 1;
    } else {
      options.sheets = resolve(argument);
    }
  }
  if (!options.sheets) {
    throw new Error(
      'Usage: node tools/slice-steps.mjs <sheets-directory> [--out dir] [--report file]',
    );
  }
  return options;
}

async function readSheet(path) {
  const { data, info } = await sharp(path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const alpha = new Uint8Array(width * height);
  for (let index = 0; index < alpha.length; index += 1) alpha[index] = data[index * CHANNELS + 3];
  return { data, alpha, width, height };
}

function cellOf(sheet, x, y) {
  const column = Math.min(COLUMNS - 1, Math.floor((x * COLUMNS) / sheet.width));
  const row = Math.min(ROWS - 1, Math.floor((y * ROWS) / sheet.height));
  return row * COLUMNS + column;
}

function cellBounds(sheet, cell) {
  const column = cell % COLUMNS;
  const row = Math.floor(cell / COLUMNS);
  return {
    left: Math.round((column * sheet.width) / COLUMNS),
    right: Math.round(((column + 1) * sheet.width) / COLUMNS) - 1,
    top: Math.round((row * sheet.height) / ROWS),
    bottom: Math.round(((row + 1) * sheet.height) / ROWS) - 1,
  };
}

function createComponent(id) {
  return {
    id,
    area: 0,
    cells: new Array(SCENE_COUNT).fill(0),
    left: Infinity,
    right: -Infinity,
    top: Infinity,
    bottom: -Infinity,
    sumX: 0,
    sumY: 0,
    scene: -1,
  };
}

function addPixel(component, sheet, x, y) {
  component.area += 1;
  component.cells[cellOf(sheet, x, y)] += 1;
  component.left = Math.min(component.left, x);
  component.right = Math.max(component.right, x);
  component.top = Math.min(component.top, y);
  component.bottom = Math.max(component.bottom, y);
  component.sumX += x;
  component.sumY += y;
}

function labelComponents(sheet) {
  const { alpha, width, height } = sheet;
  const labels = new Int32Array(width * height);
  const stack = new Int32Array(width * height);
  const components = [null];
  for (let start = 0; start < alpha.length; start += 1) {
    if (alpha[start] <= CORE_ALPHA || labels[start] !== 0) continue;
    const component = createComponent(components.length);
    let size = 0;
    stack[size++] = start;
    labels[start] = component.id;
    while (size > 0) {
      const index = stack[--size];
      const x = index % width;
      const y = (index - x) / width;
      addPixel(component, sheet, x, y);
      for (const [dx, dy] of NEIGHBOURS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (alpha[next] <= CORE_ALPHA || labels[next] !== 0) continue;
        labels[next] = component.id;
        stack[size++] = next;
      }
    }
    components.push(component);
  }
  return { labels, components };
}

function majorityCell(component) {
  return component.cells.indexOf(Math.max(...component.cells));
}

function isMerged(component) {
  if (component.area < BODY_AREA) return false;
  const [, second] = [...component.cells].sort((a, b) => b - a);
  return second >= component.area * MERGED_SHARE;
}

function splitAlongGrid(sheet, labels, components, merged) {
  const parts = new Map();
  for (let y = merged.top; y <= merged.bottom; y += 1) {
    for (let x = merged.left; x <= merged.right; x += 1) {
      const index = y * sheet.width + x;
      if (labels[index] !== merged.id) continue;
      const cell = cellOf(sheet, x, y);
      if (!parts.has(cell)) {
        parts.set(cell, createComponent(components.length));
        components.push(parts.get(cell));
      }
      const part = parts.get(cell);
      labels[index] = part.id;
      addPixel(part, sheet, x, y);
    }
  }
  components[merged.id] = null;
  return [...parts.keys()].map((cell) => cell + 1);
}

function spreadOwnership(sheet, labels, components) {
  const { width, height } = sheet;
  const owner = new Int8Array(width * height).fill(-1);
  const queue = new Int32Array(width * height);
  let tail = 0;
  for (let index = 0; index < labels.length; index += 1) {
    const component = components[labels[index]];
    if (!component || component.scene < 0) continue;
    owner[index] = component.scene;
    queue[tail++] = index;
  }
  for (let head = 0; head < tail; head += 1) {
    const index = queue[head];
    const x = index % width;
    const y = (index - x) / width;
    for (const [dx, dy] of NEIGHBOURS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const next = ny * width + nx;
      if (owner[next] !== -1) continue;
      owner[next] = owner[index];
      queue[tail++] = next;
    }
  }
  return owner;
}

function nearestScene(sheet, labels, owner, component) {
  const votes = new Array(SCENE_COUNT).fill(0);
  for (let y = component.top; y <= component.bottom; y += 1) {
    for (let x = component.left; x <= component.right; x += 1) {
      const index = y * sheet.width + x;
      if (labels[index] === component.id) votes[owner[index]] += 1;
    }
  }
  return votes.indexOf(Math.max(...votes));
}

function assignScenes(sheet, labels, components, notes) {
  const bodies = components.filter((component) => component && component.area >= BODY_AREA);
  for (const body of bodies) body.scene = majorityCell(body);
  for (let scene = 0; scene < SCENE_COUNT; scene += 1) {
    if (!bodies.some((body) => body.scene === scene)) {
      throw new Error(`Scene ${scene + 1} has no drawing of its own`);
    }
  }
  const owner = spreadOwnership(sheet, labels, components);
  const details = components.filter((component) => component && component.area < BODY_AREA);
  for (const detail of details) {
    detail.scene = nearestScene(sheet, labels, owner, detail);
    const centreCell = cellOf(sheet, detail.sumX / detail.area, detail.sumY / detail.area);
    if (centreCell !== detail.scene && detail.area >= SPECK_AREA) {
      notes.push({ scene: detail.scene + 1, centreCell: centreCell + 1, area: detail.area });
    }
  }
  for (let index = 0; index < labels.length; index += 1) {
    const component = components[labels[index]];
    if (component) owner[index] = component.scene;
  }
  return owner;
}

function sceneBounds(components, scene) {
  const bounds = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
  for (const component of components) {
    if (!component || component.scene !== scene || component.area < SPECK_AREA) continue;
    bounds.left = Math.min(bounds.left, component.left);
    bounds.right = Math.max(bounds.right, component.right);
    bounds.top = Math.min(bounds.top, component.top);
    bounds.bottom = Math.max(bounds.bottom, component.bottom);
  }
  return bounds;
}

function runAlongLine(sheet, owner, scene, bounds, side) {
  const vertical = side === 'left' || side === 'right';
  const from = vertical ? bounds.top : bounds.left;
  const to = vertical ? bounds.bottom : bounds.right;
  let run = 0;
  for (let position = from; position <= to; position += 1) {
    const x = vertical ? bounds[side] : position;
    const y = vertical ? position : bounds[side];
    const index = y * sheet.width + x;
    if (owner[index] === scene && sheet.alpha[index] > CORE_ALPHA) run += 1;
  }
  return run;
}

function sourceClips(sheet, owner, scene, bounds, cell) {
  const sheetLimits = { left: 0, top: 0, right: sheet.width - 1, bottom: sheet.height - 1 };
  const clips = [];
  for (const side of ['left', 'top', 'right', 'bottom']) {
    if (runAlongLine(sheet, owner, scene, bounds, side) < STRAIGHT_RUN) continue;
    if (bounds[side] === sheetLimits[side]) clips.push(`${side}: sheet edge`);
    else if (Math.abs(bounds[side] - cell[side]) <= GRID_SLACK) clips.push(`${side}: grid line`);
  }
  return clips;
}

function overflow(bounds, cell) {
  return Math.max(
    cell.left - bounds.left,
    bounds.right - cell.right,
    cell.top - bounds.top,
    bounds.bottom - cell.bottom,
    0,
  );
}

function cutScene(sheet, owner, scene, bounds) {
  const drawingSize = Math.max(bounds.right - bounds.left, bounds.bottom - bounds.top) + 1;
  const side = Math.ceil(drawingSize / (1 - 2 * MARGIN));
  const originX = Math.round((bounds.left + bounds.right + 1 - side) / 2);
  const originY = Math.round((bounds.top + bounds.bottom + 1 - side) / 2);
  const pixels = Buffer.alloc(side * side * CHANNELS);
  let masked = 0;
  for (let y = Math.max(0, originY); y < Math.min(sheet.height, originY + side); y += 1) {
    for (let x = Math.max(0, originX); x < Math.min(sheet.width, originX + side); x += 1) {
      const source = y * sheet.width + x;
      if (owner[source] !== scene) {
        if (sheet.alpha[source] > CORE_ALPHA) masked += 1;
        continue;
      }
      const target = ((y - originY) * side + (x - originX)) * CHANNELS;
      sheet.data.copy(pixels, target, source * CHANNELS, source * CHANNELS + CHANNELS);
    }
  }
  return { pixels, side, masked };
}

async function writeScene(cut, path) {
  await sharp(cut.pixels, { raw: { width: cut.side, height: cut.side, channels: CHANNELS } })
    .resize(STEP_SIZE, STEP_SIZE, { kernel: 'lanczos3' })
    .webp(WEBP_OPTIONS)
    .toFile(path);
  return (await stat(path)).size;
}

async function sliceSheet(recipeId, options) {
  const sheet = await readSheet(join(options.sheets, `${recipeId}.png`));
  const { labels, components } = labelComponents(sheet);
  const result = { id: recipeId, splitAlongGrid: [], movedDetails: [], scenes: [] };
  for (const merged of components.filter((component) => component && isMerged(component))) {
    result.splitAlongGrid.push(splitAlongGrid(sheet, labels, components, merged));
  }
  const owner = assignScenes(sheet, labels, components, result.movedDetails);
  for (let scene = 0; scene < SCENE_COUNT; scene += 1) {
    const bounds = sceneBounds(components, scene);
    const cell = cellBounds(sheet, scene);
    const cut = cutScene(sheet, owner, scene, bounds);
    const name = `${recipeId}-step-${String(scene + 1).padStart(2, '0')}.webp`;
    const bytes = await writeScene(cut, join(options.out, name));
    result.scenes.push({
      name,
      bytes,
      sourceSize: Math.max(bounds.right - bounds.left, bounds.bottom - bounds.top) + 1,
      beyondCell: overflow(bounds, cell),
      clippedInSource: sourceClips(sheet, owner, scene, bounds, cell),
      maskedNeighbourPixels: cut.masked,
    });
  }
  return result;
}

function summarize(results) {
  const scenes = results.flatMap((result) => result.scenes);
  return {
    files: scenes.length,
    size: STEP_SIZE,
    totalBytes: scenes.reduce((sum, scene) => sum + scene.bytes, 0),
    beyondCell: scenes.filter((scene) => scene.beyondCell > 0).length,
    maskedNeighbours: scenes.filter((scene) => scene.maskedNeighbourPixels > 0).length,
    clippedInSource: scenes
      .filter((scene) => scene.clippedInSource.length > 0)
      .map((scene) => `${scene.name} (${scene.clippedInSource.join(', ')})`),
    splitAlongGrid: results
      .filter((result) => result.splitAlongGrid.length > 0)
      .map((result) => ({ id: result.id, cells: result.splitAlongGrid })),
    movedDetails: results
      .filter((result) => result.movedDetails.length > 0)
      .map((result) => ({ id: result.id, details: result.movedDetails })),
  };
}

const options = readOptions(process.argv.slice(2));
await mkdir(options.out, { recursive: true });
const results = [];
for (const recipe of recipes) results.push(await sliceSheet(recipe.id, options));
const summary = summarize(results);
if (options.report) {
  await mkdir(dirname(options.report), { recursive: true });
  await writeFile(options.report, `${JSON.stringify({ summary, results }, null, 2)}\n`);
}
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
