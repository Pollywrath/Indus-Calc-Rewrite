export const reorderPort = (data, side, fromIndex, toIndex) => {
  const key  = side === 'input' ? 'inputs' : 'outputs'
  const arr  = [...data[key]]
  const [item] = arr.splice(fromIndex, 1)
  arr.splice(toIndex, 0, item)
  return { ...data, [key]: arr.map((p, i) => ({ ...p, node: i })) }
}

export const swapPortSides = (data) => ({
  ...data,
  inputs:  data.outputs.map((p, i) => ({ ...p, node: i })),
  outputs: data.inputs.map((p,  i) => ({ ...p, node: i })),
})

export const remapEdges = (edges, nodeId, oldHandleId, newHandleId) =>
  edges.map(e => {
    if (e.source === nodeId && e.sourceHandle === oldHandleId)
      return { ...e, sourceHandle: newHandleId }
    if (e.target === nodeId && e.targetHandle === oldHandleId)
      return { ...e, targetHandle: newHandleId }
    return e
  })