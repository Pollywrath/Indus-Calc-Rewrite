import { memo, useMemo, useState, useDeferredValue } from 'react'
import SortHeader from '../../../components/common/SortHeader'
import { TYPE_FILTERS } from './constants'
import { formatComma } from '../../../utils/formatters'
import { matchesSearch, sortItems, useSortState, useSearchState, useVirtualScroll } from '../../../utils/listUtils'

const ROW_HEIGHT = 37

const SORT_GETTERS = {
  name:    p => p.name,
  price:   p => p.sell_price,
  rp_mult: p => p.rp_multiplier,
}

const ProductTable = memo(({ products, onSelect }) => {
  const { sort, handleSort }                  = useSortState('name', 'asc')
  const { search, setSearch, deferredSearch } = useSearchState()
  const [typeFilter, setType]                 = useState('All')
  const { scrollRef, onScroll, calcWindow }   = useVirtualScroll(ROW_HEIGHT)

  const deferredTypeFilter = useDeferredValue(typeFilter)
  const deferredSort       = useDeferredValue(sort)

  const filtered = useMemo(() => {
    const q = deferredSearch.trim()
    return sortItems(
      products.filter(p =>
        (deferredTypeFilter === 'All' || p.type === deferredTypeFilter) &&
        matchesSearch(p.name, q)
      ),
      deferredSort.col,
      deferredSort.dir,
      SORT_GETTERS
    )
  }, [products, deferredSearch, deferredTypeFilter, deferredSort])

  const { visible, topPad, bottomPad } = calcWindow(filtered)

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
      <div className="ui-table-wrap" ref={scrollRef} onScroll={onScroll}>
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