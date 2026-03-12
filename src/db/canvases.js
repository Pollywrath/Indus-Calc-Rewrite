import { getDb } from './client'

const store = async (mode) => {
  const db = await getDb()
  return db.transaction('canvases', mode).objectStore('canvases')
}

const run = (req) => new Promise((resolve, reject) => {
  req.onsuccess = (e) => resolve(e.target.result)
  req.onerror   = (e) => reject(e.target.error)
})

export const listCanvases = async () => {
  const s    = await store('readonly')
  const all  = await run(s.getAll())
  return all.map(({ id, name, savedAt, nodeCount }) => ({ id, name, savedAt, nodeCount }))
}

export const getCanvas = async (id) => {
  return run((await store('readonly')).get(id))
}

export const saveCanvas = async (name, nodes, edges) => {
  const entry = {
    id:        crypto.randomUUID(),
    name,
    savedAt:   new Date().toISOString(),
    nodeCount: nodes.length,
    nodes,
    edges,
  }
  await run((await store('readwrite')).put(entry))
  return entry.id
}

export const deleteCanvas = async (id) => {
  await run((await store('readwrite')).delete(id))
}