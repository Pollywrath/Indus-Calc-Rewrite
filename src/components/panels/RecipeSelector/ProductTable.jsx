import { memo, useState, useMemo, useCallback, useDeferredValue, useRef } from 'react'
import { TYPE_FILTERS } from './constants'
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

const ProductTable = memo(({ products, onSelect }) => {
  const [search,     setSearch]    = useState('')
  const [typeFilter, setType]      = useState('All')
  const [sort,       setSort]      = useState({ col: 'name', dir: 'asc' })
  const [scrollTop,  setScrollTop] = useState(0)
  const scrollRef                  = useRef(null)
  const viewHeight                 = scrollRef.current?.clientHeight ?? window.innerHeight * 0.75

  const handleSort = useCallback((col) => {
    setSort(prev => {
      if (prev.col !== col)   return { col, dir: 'asc' }
      if (prev.dir === 'asc') return { col, dir: 'desc' }
      return { col: null, dir: null }
    })
  }, [])

  const deferredSearch     = useDeferredValue(search)
  const deferredTypeFilter = useDeferredValue(typeFilter)
  const deferredSort       = useDeferredValue(sort)

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    return products
      .filter(p => (deferredTypeFilter === 'All' || p.type === deferredTypeFilter) && (!q || p.name.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (!deferredSort.col) return 0
        let cmp = 0
        if      (deferredSort.col === 'name')    cmp = a.name.localeCompare(b.name)
        else if (deferredSort.col === 'price')   cmp = a.sell_price - b.sell_price
        else if (deferredSort.col === 'rp_mult') cmp = a.rp_multiplier - b.rp_multiplier
        return deferredSort.dir === 'asc' ? cmp : -cmp
      })
  }, [products, deferredSearch, deferredTypeFilter, deferredSort])

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
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        <select className="ui-type-select" value={typeFilter} onChange={e => setType(e.target.value)}>
          {TYPE_FILTERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="ui-table-wrap" ref={scrollRef} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
        <table className="ui-table">
          <thead>
            <tr>
              <SortHeader label="Name"       col="name"    sortCol={sort.col} sortDir={sort.dir} onSort={handleSort} />
              <SortHeader label="Sell Price" col="price"   sortCol={sort.col} sortDir={sort.dir} onSort={handleSort} />
              <SortHeader label="RP Mult"    col="rp_mult" sortCol={sort.col} sortDir={sort.dir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={3} className="ui-table-empty">No products match</td></tr>
              : <>
                  {topPad > 0    && <tr><td colSpan={3} style={{ height: topPad,    padding: 0, border: 'none' }} /></tr>}
                  {visible.map(p => (
                    <tr key={p.id} className="ui-table-row ui-table-row--clickable" onClick={() => onSelect(p)}>
                      <td className="ui-table-td ui-table-td--name">{p.name}</td>
                      <td className="ui-table-td ui-table-td--num">{formatComma(p.sell_price)}</td>
                      <td className="ui-table-td ui-table-td--num">{formatComma(p.rp_multiplier)}</td>
                    </tr>
                  ))}
                  {bottomPad > 0 && <tr><td colSpan={3} style={{ height: bottomPad, padding: 0, border: 'none' }} /></tr>}
                </>
            }
          </tbody>
        </table>
      </div>
    </>
  )
})

export default ProductTable