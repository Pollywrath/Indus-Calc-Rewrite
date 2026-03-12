import { getDb } from './client'

const key = (tab) => `tab_${tab.toLowerCase()}`

const tx = async (mode, fn) => {
  const db    = await getDb()
  const store = db.transaction('userData', mode).objectStore('userData')
  return new Promise((resolve, reject) => {
    const req = fn(store)
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e.target.error)
  })
}

export const getOverrides = async (tab) => {
  const record = await tx('readonly', (s) => s.get(key(tab)))
  return record?.entries ?? []
}

export const putOverrides = async (tab, entries) => {
  await tx('readwrite', (s) => s.put({ storeKey: key(tab), entries }))
}

export const clearOverrides = async (tab) => {
  await tx('readwrite', (s) => s.delete(key(tab)))
}