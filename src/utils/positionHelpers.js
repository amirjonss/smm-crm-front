export const POSITION_GAP = 10

export function calcInsertPosition(before, after) {
  const a = before ?? 0
  const b = after ?? a + POSITION_GAP * 2
  return Math.round((a + b) / 2)
}

export function reindexPositions(items) {
  return items.map((item, i) => ({
    ...item,
    position: (i + 1) * POSITION_GAP,
  }))
}

export function calcDropPosition(list, newIndex) {
  const prev = newIndex > 0 ? list[newIndex - 1].position : 0
  const next = newIndex < list.length ? list[newIndex].position : prev + POSITION_GAP * 2
  const pos = calcInsertPosition(prev, next)

  if (next - prev <= 1) {
    return { position: pos, needsReindex: true }
  }
  return { position: pos, needsReindex: false }
}
