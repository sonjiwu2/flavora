const DISH_WIDTHS = [480, 960];
const DISH_ASPECT = 3 / 2;
const STEP_SIZE = 512;

function assetUrl(path) {
  return new URL(`../../assets/${path}`, import.meta.url).href;
}

export function dishImage(recipeId) {
  const sources = DISH_WIDTHS.map((width) => ({
    width,
    url: assetUrl(`dishes/${recipeId}-${width}.webp`),
  }));
  return {
    src: sources[0].url,
    srcset: sources.map((source) => `${source.url} ${source.width}w`).join(', '),
    width: DISH_WIDTHS[0],
    height: Math.round(DISH_WIDTHS[0] / DISH_ASPECT),
  };
}

export function stepImage(recipeId, stepNumber) {
  const number = String(stepNumber).padStart(2, '0');
  return {
    src: assetUrl(`steps/${recipeId}-step-${number}.webp`),
    width: STEP_SIZE,
    height: STEP_SIZE,
  };
}
