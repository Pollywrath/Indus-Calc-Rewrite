import { memo, useState, useMemo, useCallback, useDeferredValue, useRef } from 'react'
import { formatComma } from '../../../utils/formatters'

const ROW_HEIGHT = 37
const OVERSCAN   = 5

const SortHeader = memo(({ label, col, sortCol, sortDir, onSort }) => {
  const active    = sortCol === col
  const indicator = !active || !sortDir ? '↕' : sortDir === 'asc' ? '↑' : '↓'
  return (
    <th className={`ui-table-th ui-table-th--sortable${active && sortDir ? ' ui-table-th--active' : ''}`} onClick={() => onSort(col)}>
      {label} <span className="ui-sort-indicator">{indicator}</span>
    </th>
  )
})

const MachineTable = memo(({ machines, onSelect }) => {
  const [search,       setSearch]    = useState('')
  const [catFilter,    setCat]       = useState('All')
  const [subcatFilter, setSubcat]    = useState('All')
  const [tierFilter,   setTier]      = useState('All')
  const [sort,         setSort]      = useState({ col: 'name', dir: 'asc' })
  const [scrollTop,    setScrollTop] = useState(0)
  const scrollRef                    = useRef(null)
  const viewHeight                   = scrollRef.current?.clientHeight ?? window.innerHeight * 0.75

  const categories = useMemo(() => ['All', ...new Set(machines.map(m => m.category))].sort(), [machines])
  const tiers      = useMemo(() => ['All', ...new Set(machines.map(m => m.tier))].sort((a, b) => a === 'All' ? -1 : a - b), [machines])
  const subcats    = useMemo(() => {
    if (catFilter === 'All') return ['All']
    return ['All', ...new Set(machines.filter(m => m.category === catFilter).map(m => m.subcategory))].sort()
  }, [machines, catFilter])

  const handleSort = useCallback((col) => {
    setSort(prev => {
      if (prev.col !== col)   return { col, dir: 'asc' }
      if (prev.dir === 'asc') return { col, dir: 'desc' }
      return { col: null, dir: null }
    })
  }, [])

  const deferredSearch       = useDeferredValue(search)
  const deferredCatFilter    = useDeferredValue(catFilter)
  const deferredSubcatFilter = useDeferredValue(subcatFilter)
  const deferredTierFilter   = useDeferredValue(tierFilter)
  const deferredSort         = useDeferredValue(sort)

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    return machines
      .filter(m =>
        (deferredCatFilter    === 'All' || m.category    === deferredCatFilter)    &&
        (deferredSubcatFilter === 'All' || m.subcategory === deferredSubcatFilter) &&
        (deferredTierFilter   === 'All' || m.tier        === Number(deferredTierFilter)) &&
        (!q || m.name.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        if (!deferredSort.col) return 0
        const cmp = deferredSort.col === 'name' ? a.name.localeCompare(b.name) : a.cost - b.cost
        return deferredSort.dir === 'asc' ? cmp : -cmp
      })
  }, [machines, deferredSearch, deferredCatFilter, deferredSubcatFilter, deferredTierFilter, deferredSort])

  const startIndex  = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const endIndex    = Math.min(filtered.length - 1, Math.ceil((scrollTop + viewHeight) / ROW_HEIGHT) + OVERSCAN)
  const visible     = filtered.slice(startIndex, endIndex + 1)
  const topPad      = startIndex * ROW_HEIGHT
  const bottomPad   = Math.max(0, (filtered.length - endIndex - 1) * ROW_HEIGHT)

  return (
    <>
      <div className="ui-modal-controls">
        <input
          className="ui-search"
          type="text"
          placeholder="Search machines…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      <div className="ui-modal-filters">
        <select className="ui-type-select" value={catFilter} onChange={e => { setCat(e.target.value); setSubcat('All') }}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="ui-type-select" value={subcatFilter} onChange={e => setSubcat(e.target.value)} disabled={catFilter === 'All'}>
          {subcats.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="ui-type-select" value={tierFilter} onChange={e => setTier(e.target.value)}>
          {tiers.map(t => <option key={t} value={t}>{t === 'All' ? 'All Tiers' : `Tier ${t}`}</option>)}
        </select>
      </div>
      <div className="ui-table-wrap" ref={scrollRef} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
        <table className="ui-table ui-table--machines">
          <thead>
            <tr>
              <SortHeader label="Name" col="name" sortCol={sort.col} sortDir={sort.dir} onSort={handleSort} />
              <SortHeader label="Cost" col="cost" sortCol={sort.col} sortDir={sort.dir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={2} className="ui-table-empty">No machines match</td></tr>
              : <>
                  {topPad > 0    && <tr><td colSpan={2} style={{ height: topPad,    padding: 0, border: 'none' }} /></tr>}
                  {visible.map(m => (
                    <tr key={m.id} className="ui-table-row ui-table-row--clickable" onClick={() => onSelect(m)}>
                      <td className="ui-table-td ui-table-td--name">{m.name}</td>
                      <td className="ui-table-td ui-table-td--num">{formatComma(m.cost)}</td>
                    </tr>
                  ))}
                  {bottomPad > 0 && <tr><td colSpan={2} style={{ height: bottomPad, padding: 0, border: 'none' }} /></tr>}
                </>
            }
          </tbody>
        </table>
      </div>
    </>
  )
})

export default MachineTable