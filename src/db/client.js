const DB_NAME    = 'indus-calc'
const DB_VERSION = 1

let dbPromise = null

export const getDb = () => {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('userData'))
        db.createObjectStore('userData', { keyPath: 'storeKey' })
      if (!db.objectStoreNames.contains('canvases'))
        db.createObjectStore('canvases', { keyPath: 'id' })
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e.target.error)
  })
  return dbPromise
}