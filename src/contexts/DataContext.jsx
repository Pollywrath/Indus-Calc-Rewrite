import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { products, machines, recipes, research } from '../data/store'
import { getOverrides, putOverrides } from '../db/userData'
import { mergeDataset } from '../utils/mergeData'

const TABS = ['products', 'machines', 'recipes', 'research']

const BASE = { products, machines, recipes, research }

const buildMaps = (data) => ({
  productsMap:  Object.fromEntries(data.products.map(p => [p.id, p])),
  machinesMap:  Object.fromEntries(data.machines.map(m => [m.id, m])),
  recipesMap:   Object.fromEntries(data.recipes.map(r  => [r.id, r])),
  researchMap:  Object.fromEntries(data.research.map(s => [s.id, s])),
})

const DataContext = createContext(null)

export const DataProvider = ({ children }) => {
  const [data, setData]       = useState(BASE)
  const [ready, setReady]     = useState(false)

  useEffect(() => {
    const load = async () => {
      const overrides = await Promise.all(TABS.map(tab => getOverrides(tab)))
      setData({
        products: mergeDataset(BASE.products, overrides[0]),
        machines: mergeDataset(BASE.machines, overrides[1]),
        recipes:  mergeDataset(BASE.recipes,  overrides[2]),
        research: mergeDataset(BASE.research, overrides[3]),
      })
      setReady(true)
    }
    load()
  }, [])

  const saveEntry = useCallback(async (tab, entry) => {
    setData(prev => {
      const key     = tab.toLowerCase()
      const current = prev[key]
      const exists  = current.some(e => e.id === entry.id)
      return {
        ...prev,
        [key]: exists ? current.map(e => e.id === entry.id ? entry : e) : [...current, entry],
      }
    })
    setData(prev => {
      const key      = tab.toLowerCase()
      const updated  = prev[key].some(e => e.id === entry.id)
        ? prev[key].map(e => e.id === entry.id ? entry : e)
        : [...prev[key], entry]
      const baseIds  = new Set(BASE[key].map(e => e.id))
      const modified = updated.filter(e =>
        !baseIds.has(e.id) ||
        JSON.stringify(e) !== JSON.stringify(BASE[key].find(b => b.id === e.id))
      )
      putOverrides(tab, modified)
      return { ...prev, [key]: updated }
    })
  }, [])

  const deleteEntry = useCallback(async (tab, id) => {
    setData(prev => {
      const key     = tab.toLowerCase()
      const updated = prev[key].filter(e => e.id !== id)
      const baseIds = new Set(BASE[key].map(e => e.id))
      const modified = updated.filter(e =>
        !baseIds.has(e.id) ||
        JSON.stringify(e) !== JSON.stringify(BASE[key].find(b => b.id === e.id))
      )
      putOverrides(tab, modified)
      return { ...prev, [key]: updated }
    })
  }, [])

  const maps  = useMemo(() => buildMaps(data), [data])
  const value = useMemo(() => ({
    ...data, ...maps, ready, saveEntry, deleteEntry,
  }), [data, maps, ready, saveEntry, deleteEntry])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)