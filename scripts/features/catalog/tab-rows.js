const MIN_LAST_ROW_ITEMS = 2;

export function wrapIntoRows(itemWidths, gap, rowWidth) {
  const rows = [];
  let used = 0;
  for (const width of itemWidths) {
    const next = used + gap + width;
    if (rows.length === 0 || next > rowWidth) {
      rows.push(1);
      used = width;
    } else {
      rows[rows.length - 1] += 1;
      used = next;
    }
  }
  return rows;
}

export function countWrappedRows(itemWidths, gap, rowWidth) {
  return wrapIntoRows(itemWidths, gap, rowWidth).length;
}

function listRunWidths(itemWidths, gap) {
  const widths = new Set();
  itemWidths.forEach((_, start) => {
    let run = 0;
    for (let end = start; end < itemWidths.length; end += 1) {
      run += itemWidths[end] + (end === start ? 0 : gap);
      widths.add(Math.ceil(run));
    }
  });
  return [...widths].sort((first, second) => second - first);
}

export function findTidyRowWidth(itemWidths, gap, availableWidth) {
  const natural = wrapIntoRows(itemWidths, gap, availableWidth);
  if (natural.length < 2 || natural.at(-1) >= MIN_LAST_ROW_ITEMS) return null;
  const tidy = listRunWidths(itemWidths, gap).find((candidate) => {
    if (candidate > availableWidth) return false;
    const rows = wrapIntoRows(itemWidths, gap, candidate);
    return rows.length === natural.length && rows.at(-1) >= MIN_LAST_ROW_ITEMS;
  });
  return tidy ?? null;
}
