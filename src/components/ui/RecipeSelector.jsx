import { memo, useState, useMemo, useCallback, useEffect } from 'react'
import { recipes, products, machines, productsMap, machinesMap } from '../../data/store'
import { useDisplayMode, MODE_CONFIG } from '../../contexts/DisplayModeContext'
import { formatQuantity } from '../../utils/formatters'

const TYPE_FILTERS = ['All', 'Item', 'Fluid']
const ROLE_FILTERS = ['Producers', 'Consumers', 'Disposal', 'Heat Source', 'Depot']

const matchesRole = (recipe, productId, role) => {
  if (role === 'Producers') return recipe.outputs.some(o => o.product_id === productId)
  if (role === 'Consumers') return recipe.inputs.some(i  => i.product_id === productId)
  return false
}
const TABS         = ['Product', 'Machine']

const SortHeader = memo(({ label, col, sortCol, sortDir, onSort }) => {
  const active    = sortCol === col
  const indicator = !active || !sortDir ? '↕' : sortDir === 'asc' ? '↑' : '↓'
  return (
    <th className={`ui-table-th ui-table-th--sortable${active && sortDir ? ' ui-table-th--active' : ''}`} onClick={() => onSort(col)}>
      {label} <span className="ui-sort-indicator">{indicator}</span>
    </th>
  )
})

const ProductRow = memo(({ product, onSelect }) => (
  <tr className="ui-table-row ui-table-row--clickable" onClick={() => onSelect(product)}>
    <td className="ui-table-td ui-table-td--name">{product.name}</td>
    <td className="ui-table-td ui-table-td--num">{product.sell_price}</td>
    <td className="ui-table-td ui-table-td--num">{product.rp_multiplier}</td>
  </tr>
))

const MachineRow = memo(({ machine, onSelect }) => (
  <tr className="ui-table-row ui-table-row--clickable" onClick={() => onSelect(machine)}>
    <td className="ui-table-td ui-table-td--name">{machine.name}</td>
    <td className="ui-table-td ui-table-td--num">{machine.cost}</td>
  </tr>
))

const RecipeEntry = memo(({ recipe, onSelectRecipe, onClose }) => {
  const { getMultiplier, getCycleDisplay } = useDisplayMode()
  const machine      = machinesMap[recipe.machine_id]
  const multiplier   = getMultiplier(recipe.cycle_time)
  const cycleDisplay = getCycleDisplay(recipe.cycle_time)

  return (
    <div className="ui-recipe-entry" onClick={() => { onSelectRecipe(recipe); onClose() }}>
      <div className="ui-recipe-entry-header">
        <span className="ui-recipe-entry-name">{recipe.name}</span>
        <span className="ui-recipe-entry-meta">{machine?.name ?? recipe.machine_id} · {cycleDisplay}</span>
      </div>
      <div className="ui-recipe-io">
        <div className="ui-recipe-col">
          {recipe.inputs.map((item, i) => (
            <div key={i} className="ui-recipe-item ui-recipe-item--input">
              <span className="ui-recipe-qty">{formatQuantity(multiplier != null ? item.quantity * multiplier : item.quantity)}x</span>
              <span className="ui-recipe-item-name">{productsMap[item.product_id]?.name ?? item.product_id}</span>
            </div>
          ))}
        </div>
        <div className="ui-recipe-arrow">→</div>
        <div className="ui-recipe-col">
          {recipe.outputs.map((item, i) => (
            <div key={i} className="ui-recipe-item ui-recipe-item--output">
              <span className="ui-recipe-qty">{formatQuantity(multiplier != null ? item.quantity * multiplier : item.quantity)}x</span>
              <span className="ui-recipe-item-name">{productsMap[item.product_id]?.name ?? item.product_id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

const machineCategories = ['All', ...new Set(machines.map(m => m.category))].sort()
const machineTiers      = ['All', ...new Set(machines.map(m => m.tier))].sort((a, b) => a === 'All' ? -1 : a - b)

const RecipeSelector = ({ onSelectRecipe, trigger }) => {
  const [open, setOpen]                       = useState(false)
  const [tab, setTab]                         = useState('Product')
  const [search, setSearch]                   = useState('')
  const [typeFilter, setType]                 = useState('All')
  const [catFilter, setCat]                   = useState('All')
  const [subcatFilter, setSubcat]             = useState('All')
  const [tierFilter, setTier]                 = useState('All')
  const [sort, setSort]                       = useState({ col: null, dir: null })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [roleFilter, setRoleFilter]           = useState(new Set())
  const { mode, cycleNext } = useDisplayMode()

  useEffect(() => {
    if (!trigger) return
    const product = productsMap[trigger.productId]
    if (!product) return
    setTab('Product')
    setSearch('')
    setSort({ col: null, dir: null })
    setSelectedProduct(product)
    setSelectedMachine(null)
    setRoleFilter(new Set([trigger.role]))
    setOpen(true)
  }, [trigger])

  const handleClose = useCallback(() => { setOpen(false); setSelectedProduct(null); setSelectedMachine(null); setRoleFilter(new Set()) }, [])
  const handleBack  = useCallback(() => { setSelectedProduct(null); setSelectedMachine(null); setRoleFilter(new Set()) }, [])

  const handleTabChange = useCallback((t) => {
    setTab(t)
    setSearch('')
    setSort({ col: null, dir: null })
    setSelectedProduct(null)
    setSelectedMachine(null)
    setRoleFilter(new Set())
    setCat('All')
    setSubcat('All')
    setTier('All')
  }, [])

  const handleSort = useCallback((col) => {
    setSort(prev => {
      if (prev.col !== col)   return { col, dir: 'asc' }
      if (prev.dir === 'asc') return { col, dir: 'desc' }
      return { col: null, dir: null }
    })
  }, [])

  const activeSelection = selectedProduct ?? selectedMachine

  const activeRecipes = useMemo(() => {
    if (selectedProduct) {
      if (roleFilter.size === 0)
        return recipes.filter(r =>
          r.inputs.some(i  => i.product_id === selectedProduct.id) ||
          r.outputs.some(o => o.product_id === selectedProduct.id)
        )
      return recipes.filter(r =>
        [...roleFilter].some(role => matchesRole(r, selectedProduct.id, role))
      )
    }
    if (selectedMachine) return recipes.filter(r => r.machine_id === selectedMachine.id)
    return []
  }, [selectedProduct, selectedMachine, roleFilter])

  const filteredProducts = useMemo(() => {
    if (tab !== 'Product' || activeSelection) return []
    const q = search.trim().toLowerCase()
    return products
      .filter(p => (typeFilter === 'All' || p.type === typeFilter) && (!q || p.name.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (!sort.col) return 0
        let cmp = 0
        if      (sort.col === 'name')    cmp = a.name.localeCompare(b.name)
        else if (sort.col === 'price')   cmp = a.sell_price - b.sell_price
        else if (sort.col === 'rp_mult') cmp = a.rp_multiplier - b.rp_multiplier
        return sort.dir === 'asc' ? cmp : -cmp
      })
  }, [tab, search, typeFilter, sort, selectedProduct])

  const machineSubcategories = useMemo(() => {
    if (catFilter === 'All') return ['All']
    return ['All', ...new Set(machines.filter(m => m.category === catFilter).map(m => m.subcategory))].sort()
  }, [catFilter])

  const filteredMachines = useMemo(() => {
    if (tab !== 'Machine' || activeSelection) return []
    const q = search.trim().toLowerCase()
    return machines
      .filter(m =>
        (catFilter    === 'All' || m.category    === catFilter)    &&
        (subcatFilter === 'All' || m.subcategory === subcatFilter) &&
        (tierFilter   === 'All' || m.tier        === Number(tierFilter)) &&
        (!q || m.name.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        if (!sort.col) return 0
        const cmp = sort.col === 'name' ? a.name.localeCompare(b.name) : a.cost - b.cost
        return sort.dir === 'asc' ? cmp : -cmp
      })
  }, [tab, search, catFilter, subcatFilter, tierFilter, sort, selectedMachine])

  return (
    <>
      <div className="rs-top-group">
        <button className="ui-btn-rect" onClick={() => {
          setOpen(o => !o)
          setSelectedProduct(null)
          setSelectedMachine(null)
          setRoleFilter(new Set())
        }}>Select Recipe</button>
        <button className="ui-btn-mode" onClick={cycleNext}>
          {MODE_CONFIG[mode].label}
        </button>
      </div>

      {open && (
        <div className="ui-modal-overlay" onClick={handleClose}>
          <div className="ui-modal" onClick={e => e.stopPropagation()}>
            <div className="ui-modal-header">
              <span className="ui-modal-title">Select Recipe</span>
              <button className="ui-modal-close" onClick={handleClose}>✕</button>
            </div>

            <div className="ui-tabs">
              {TABS.map(t => (
                <button key={t} className={`ui-tab${tab === t ? ' ui-tab--active' : ''}`} onClick={() => handleTabChange(t)}>{t}</button>
              ))}
            </div>

            {!activeSelection ? (
              <>
                <div className="ui-modal-controls">
                  <input
                    className="ui-search"
                    type="text"
                    placeholder={`Search ${tab === 'Product' ? 'products' : 'machines'}…`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                  />
                  {tab === 'Product' && (
                    <select className="ui-type-select" value={typeFilter} onChange={e => setType(e.target.value)}>
                      {TYPE_FILTERS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  )}
                </div>
                {tab === 'Machine' && (
                  <div className="ui-modal-filters">
                    <select className="ui-type-select" value={catFilter} onChange={e => { setCat(e.target.value); setSubcat('All') }}>
                      {machineCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="ui-type-select" value={subcatFilter} onChange={e => setSubcat(e.target.value)} disabled={catFilter === 'All'}>
                      {machineSubcategories.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="ui-type-select" value={tierFilter} onChange={e => setTier(e.target.value)}>
                      {machineTiers.map(t => <option key={t} value={t}>{t === 'All' ? 'All Tiers' : `Tier ${t}`}</option>)}
                    </select>
                  </div>
                )}
                <div className="ui-table-wrap">
                  {tab === 'Product' ? (
                    <table className="ui-table">
                      <thead>
                        <tr>
                          <SortHeader label="Name"       col="name"    sortCol={sort.col} sortDir={sort.dir} onSort={handleSort} />
                          <SortHeader label="Sell Price" col="price"   sortCol={sort.col} sortDir={sort.dir} onSort={handleSort} />
                          <SortHeader label="RP Mult"    col="rp_mult" sortCol={sort.col} sortDir={sort.dir} onSort={handleSort} />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(p => <ProductRow key={p.id} product={p} onSelect={setSelectedProduct} />)}
                        {filteredProducts.length === 0 && (
                          <tr><td colSpan={3} className="ui-table-empty">No products match</td></tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="ui-table ui-table--machines">
                      <thead>
                        <tr>
                          <SortHeader label="Name" col="name" sortCol={sort.col} sortDir={sort.dir} onSort={handleSort} />
                          <SortHeader label="Cost" col="cost" sortCol={sort.col} sortDir={sort.dir} onSort={handleSort} />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMachines.map(m => <MachineRow key={m.id} machine={m} onSelect={setSelectedMachine} />)}
                        {filteredMachines.length === 0 && (
                          <tr><td colSpan={2} className="ui-table-empty">No machines match</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            ) : (
              <div className="ui-recipe-list">
                <button className="ui-recipe-back" onClick={handleBack}>← {activeSelection.name}</button>
              {selectedProduct && (
                <div className="ui-role-filter">
                  {ROLE_FILTERS.map(r => {
                    const active = roleFilter.has(r)
                    return (
                      <button
                        key={r}
                        className={`ui-role-btn${active ? ' ui-role-btn--active' : ''}`}
                        onClick={() => setRoleFilter(prev => {
                          const next = new Set(prev)
                          next.has(r) ? next.delete(r) : next.add(r)
                          return next
                        })}
                      >
                        {r}
                      </button>
                    )
                  })}
                </div>
              )}
                {activeRecipes.length === 0
                  ? <div className="ui-recipe-list-empty">No recipes found</div>
                  : activeRecipes.map(r => (
                      <RecipeEntry
                        key={r.id}
                        recipe={r}
                        onSelectRecipe={onSelectRecipe}
                        onClose={handleClose}
                      />
                    ))
                }
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default RecipeSelector