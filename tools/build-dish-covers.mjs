import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { recipes } from '../scripts/data/recipes.js';

const ASPECT = 3 / 2;
const VARIANTS = [
  { width: 480, quality: 76 },
  { width: 960, quality: 76 },
];
const WEBP_OPTIONS = { effort: 6, smartSubsample: true };
const ASPECT_TOLERANCE = 0.01;

const toolsDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(toolsDirectory, '..');

function readOptions(argv) {
  const options = { covers: null, out: join(projectRoot, 'assets', 'dishes') };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--out') {
      options.out = resolve(argv[index + 1]);
      index += 1;
    } else {
      options.covers = resolve(argv[index]);
    }
  }
  if (!options.covers) {
    throw new Error('Usage: node tools/build-dish-covers.mjs <covers-directory> [--out dir]');
  }
  return options;
}

function findDuplicates(values) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function assertEmpty(list, message) {
  if (list.length > 0) throw new Error(`${message}: ${list.join(', ')}`);
}

function validateMapping(mapping, availableFiles) {
  const recipeIds = recipes.map((recipe) => recipe.id);
  const mappedIds = Object.keys(mapping);
  const mappedFiles = Object.values(mapping);
  assertEmpty(
    recipeIds.filter((id) => !mappedIds.includes(id)),
    'Recipes without a cover',
  );
  assertEmpty(
    mappedIds.filter((id) => !recipeIds.includes(id)),
    'Covers for unknown recipes',
  );
  assertEmpty(findDuplicates(mappedFiles), 'Source files used more than once');
  assertEmpty(
    mappedFiles.filter((file) => !availableFiles.includes(file)),
    'Missing source files',
  );
}

async function assertAspect(sourcePath) {
  const { width, height } = await sharp(sourcePath).metadata();
  if (Math.abs(width / height - ASPECT) > ASPECT_TOLERANCE) {
    throw new Error(`${sourcePath} is ${width}×${height}, expected 3:2`);
  }
}

async function buildVariant(sourcePath, outputPath, { width, quality }) {
  const buffer = await sharp(sourcePath)
    .resize(width, Math.round(width / ASPECT), { fit: 'cover', kernel: 'lanczos3' })
    .webp({ ...WEBP_OPTIONS, quality })
    .toBuffer();
  await writeFile(outputPath, buffer);
  return buffer.length;
}

async function buildCover(recipeId, sourcePath, outputDirectory) {
  await assertAspect(sourcePath);
  let bytes = 0;
  for (const variant of VARIANTS) {
    const outputPath = join(outputDirectory, `${recipeId}-${variant.width}.webp`);
    bytes += await buildVariant(sourcePath, outputPath, variant);
  }
  return bytes;
}

const options = readOptions(process.argv.slice(2));
const mapping = JSON.parse(await readFile(join(toolsDirectory, 'dish-covers.json'), 'utf8'));
validateMapping(mapping, await readdir(options.covers));
await mkdir(options.out, { recursive: true });

let totalBytes = 0;
for (const [recipeId, sourceFile] of Object.entries(mapping)) {
  totalBytes += await buildCover(recipeId, join(options.covers, sourceFile), options.out);
}

const fileCount = Object.keys(mapping).length * VARIANTS.length;
process.stdout.write(`${fileCount} covers, ${(totalBytes / 1024 / 1024).toFixed(2)} MB\n`);
