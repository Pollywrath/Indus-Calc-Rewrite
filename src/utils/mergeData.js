export const mergeDataset = (base, overrides) => {
  if (!overrides.length) return base
  const overrideMap = Object.fromEntries(overrides.map(e => [e.id, e]))
  const merged = base.map(e => overrideMap[e.id] ?? e)
  const newEntries = overrides.filter(e => !base.some(b => b.id === e.id))
  return [...merged, ...newEntries]
}