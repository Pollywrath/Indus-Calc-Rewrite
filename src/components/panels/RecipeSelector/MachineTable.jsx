import { memo, useMemo, useState, useDeferredValue } from 'react'
import SortHeader from '../../../components/common/SortHeader'
import { formatComma } from '../../../utils/formatters'
import { matchesSearch, sortItems, useSortState, useSearchState, useVirtualScroll } from '../../../utils/listUtils'

const ROW_HEIGHT = 37

const SORT_GETTERS = {
  name: m => m.name,
  cost: m => m.cost,
}

const MachineTable = memo(({ machines, onSelect }) => {
  const { sort, handleSort }                  = useSortState('name', 'asc')
  const { search, setSearch, deferredSearch } = useSearchState()
  const [catFilter,    setCat]                = useState('All')
  const [subcatFilter, setSubcat]             = useState('All')
  const [tierFilter,   setTier]               = useState('All')
  const { scrollRef, onScroll, calcWindow }   = useVirtualScroll(ROW_HEIGHT)

  const deferredCatFilter    = useDeferredValue(catFilter)
  const deferredSubcatFilter = useDeferredValue(subcatFilter)
  const deferredTierFilter   = useDeferredValue(tierFilter)
  const deferredSort         = useDeferredValue(sort)

  const categories = useMemo(
    () => ['All', ...new Set(machines.map(m => m.category))].sort(),
    [machines]
  )
  const tiers = useMemo(
    () => ['All', ...new Set(machines.map(m => m.tier))].sort((a, b) => a === 'All' ? -1 : Number(a) - Number(b)),
    [machines]
  )
  const subcats = useMemo(() => {
    if (catFilter === 'All') return ['All']
    return ['All', ...new Set(machines.filter(m => m.category === catFilter).map(m => m.subcategory))].sort()
  }, [machines, catFilter])

  const filtered = useMemo(() => {
    const q = deferredSearch.trim()
    return sortItems(
      machines.filter(m =>
        (deferredCatFilter    === 'All' || m.category    === deferredCatFilter)    &&
        (deferredSubcatFilter === 'All' || m.subcategory === deferredSubcatFilter) &&
        (deferredTierFilter   === 'All' || m.tier        === Number(deferredTierFilter)) &&
        matchesSearch(m.name, q)
      ),
      deferredSort.col,
      deferredSort.dir,
      SORT_GETTERS
    )
  }, [machines, deferredSearch, deferredCatFilter, deferredSubcatFilter, deferredTierFilter, deferredSort])

  const { visible, topPad, bottomPad } = calcWindow(filtered)

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
      <div className="ui-table-wrap" ref={scrollRef} onScroll={onScroll}>
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