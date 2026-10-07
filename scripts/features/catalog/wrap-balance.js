export function countWrappedRows(itemWidths, gap, rowWidth) {
  let rows = 0;
  let used = 0;
  for (const width of itemWidths) {
    const next = used === 0 ? width : used + gap + width;
    if (used === 0 || next > rowWidth) {
      rows += 1;
      used = width;
    } else {
      used = next;
    }
  }
  return rows;
}

export function findBalancedRowWidth(itemWidths, gap, availableWidth) {
  const rows = countWrappedRows(itemWidths, gap, availableWidth);
  if (rows < 2) return null;
  let tooNarrow = Math.max(...itemWidths) - 1;
  let fits = availableWidth;
  while (fits - tooNarrow > 1) {
    const middle = (fits + tooNarrow) / 2;
    if (countWrappedRows(itemWidths, gap, middle) <= rows) fits = middle;
    else tooNarrow = middle;
  }
  return Math.min(availableWidth, Math.ceil(fits));
}
