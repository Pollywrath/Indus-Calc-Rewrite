import { useState, useCallback, useMemo, useDeferredValue } from 'react'
import Modal from '../../../components/common/Modal'
import { useData } from '../../../contexts/DataContext'
import { TABS, DATA_KEY, FILE_KEY, DEFAULT, STICKY } from './constants'
import { autoId, exportJson } from './helpers'
import { ProductForm, MachineForm, RecipeForm, ResearchForm } from './forms'
import { matchesSearch, useSearchState } from '../../../utils/listUtils'

const DE_ROLE_FILTERS = ['Producers', 'Consumers']

const normaliseForEdit = (tab, entry) => {
  const clone = structuredClone(entry)
  if (tab === 'Research') {
    clone.prerequisites = (clone.prerequisites ?? []).map(p =>
      typeof p === 'string' && p.startsWith('s_')
        ? { type: 'id',    value: p }
        : { type: 'string', value: p }
    )
  }
  return clone
}

const DataEditor = () => {
  const { products, machines, recipes, research, saveEntry, deleteEntry } = useData()
  const data = useMemo(() => ({ products, machines, recipes, research }), [products, machines, recipes, research])

  const [open,     setOpen]     = useState(false)
  const [tab,      setTab]      = useState('Products')
  const [selected, setSelected] = useState(null)
  const [form,     setForm]     = useState(null)

  const { search, setSearch, deferredSearch } = useSearchState()

  const [recipeMode,      setRecipeMode]      = useState('product')
  const [recipeQuery,     setRecipeQuery]     = useState('')
  const [recipeSelection, setRecipeSelection] = useState(null)
  const [roleFilter,      setRoleFilter]      = useState(new Set())
  const deferredRecipeQuery                   = useDeferredValue(recipeQuery)

  const resetRecipeNav = useCallback(() => {
    setRecipeMode('product'); setRecipeQuery(''); setRecipeSelection(null); setRoleFilter(new Set())
  }, [])

  const handleTabChange = useCallback((t) => {
    setTab(t); setSelected(null); setForm(null); setSearch(''); resetRecipeNav()
  }, [setSearch, resetRecipeNav])

  const handleClose = useCallback(() => {
    setOpen(false); setSelected(null); setForm(null); setSearch(''); resetRecipeNav()
  }, [setSearch, resetRecipeNav])

  const key     = DATA_KEY[tab]
  const entries = data[key]

  const handleNew = useCallback(() => {
    setSelected('new')
    setForm(prev => {
      const base = { ...DEFAULT[tab] }
      if (prev) STICKY[tab].forEach(k => { if (prev[k] !== undefined) base[k] = prev[k] })
      return base
    })
  }, [tab])

  const handleSave = useCallback(() => {
    if (!form) return
    const isNew = selected === 'new'
    const id    = isNew ? autoId(tab, form, data) : selected
    if (isNew && entries.some(e => e.id === id))
      return alert(`ID "${id}" already exists. Rename the entry to generate a unique ID.`)

    const entry = { ...form, id }
    if (tab === 'Recipes')  delete entry.nameManual
    if (tab === 'Research') entry.prerequisites = entry.prerequisites.map(p => p.value).filter(Boolean)

    saveEntry(tab, entry)
    setSelected(id)
    setForm(f => ({ ...f, id }))
  }, [form, selected, tab, entries, data, saveEntry])

  const handleDelete = useCallback((id) => {
    deleteEntry(tab, id)
    if (selected === id) { setSelected(null); setForm(null) }
  }, [tab, selected, deleteEntry])

  const handleSelect = useCallback((entry) => {
    setSelected(entry.id)
    setForm(normaliseForEdit(tab, entry))
  }, [tab])

  const handleFormBack = useCallback(() => { setSelected(null); setForm(null) }, [])

  const handleRecipeModeChange = useCallback((mode) => {
    setRecipeMode(mode); setRecipeQuery(''); setRecipeSelection(null); setRoleFilter(new Set())
  }, [])

  const handlePickerSelect = useCallback((type, item) => {
    setRecipeSelection({ type, item }); setRecipeQuery(''); setRoleFilter(new Set())
  }, [])

  const handlePickerBack = useCallback(() => {
    setRecipeSelection(null); setRecipeQuery(''); setRoleFilter(new Set())
  }, [])

  const toggleRole = useCallback((r) => {
    setRoleFilter(prev => { const next = new Set(prev); next.has(r) ? next.delete(r) : next.add(r); return next })
  }, [])

  const pickerItems = useMemo(() => {
    if (tab !== 'Recipes' || recipeSelection) return []
    const source = recipeMode === 'product' ? products : machines
    return source
      .filter(item => matchesSearch(item.name, deferredRecipeQuery))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [tab, recipeMode, recipeSelection, products, machines, deferredRecipeQuery])

  const filteredEntries = useMemo(() => {
    if (tab === 'Recipes') {
      if (!recipeSelection) return entries
      if (recipeSelection.type === 'product') {
        const pid = recipeSelection.item.id
        if (roleFilter.size === 0) {
          return entries.filter(r =>
            r.inputs?.some(i  => i.product_id === pid) ||
            r.outputs?.some(o => o.product_id === pid)
          )
        }
        return entries.filter(r => {
          if (roleFilter.has('Producers') && r.outputs?.some(o => o.product_id === pid)) return true
          if (roleFilter.has('Consumers') && r.inputs?.some(i  => i.product_id === pid)) return true
          return false
        })
      }
      if (recipeSelection.type === 'machine') {
        return entries.filter(r => r.machine_id === recipeSelection.item.id)
      }
      return entries
    }
    const q = deferredSearch.trim()
    return q ? entries.filter(e => matchesSearch(e.name, q)) : entries
  }, [entries, tab, recipeSelection, roleFilter, deferredSearch])

  const previewId = useMemo(() =>
    form ? (selected === 'new' ? autoId(tab, form, data) : selected) : null
  , [form, selected, tab, data])

  const headerRight = (
    <button className="de-export-btn" onClick={() => exportJson(FILE_KEY[tab], entries)}>
      Export {tab}
    </button>
  )

  const bodyClass = `de-body${form ? ' de-body--editing' : ''}`

  return (
    <>
      <button className="ui-btn-rect" onClick={() => setOpen(o => !o)}>Data</button>

      {open && (
        <Modal title="Data Editor" onClose={handleClose} className="de-modal" headerRight={headerRight}>
          <div className="ui-tabs">
            {TABS.map(t => (
              <button key={t} className={`ui-tab${tab === t ? ' ui-tab--active' : ''}`} onClick={() => handleTabChange(t)}>{t}</button>
            ))}
          </div>

          <div className={bodyClass}>

            {/* ─── List panel ─── */}
            <div className="de-list">
              <button className="de-new-btn" onClick={handleNew}>+ New</button>

              {tab === 'Recipes' ? (
                <>
                  <div className="de-list-nav">
                    {(['product', 'machine']).map(m => (
                      <button
                        key={m}
                        className={`de-nav-btn${recipeMode === m ? ' de-nav-btn--active' : ''}`}
                        onClick={() => handleRecipeModeChange(m)}
                      >
                        {m === 'product' ? 'Product' : 'Machine'}
                      </button>
                    ))}
                  </div>

                  {!recipeSelection ? (
                    <>
                      <div className="de-list-search">
                        <input
                          className="de-list-search-input"
                          type="text"
                          placeholder={recipeMode === 'product' ? 'Search products…' : 'Search machines…'}
                          value={recipeQuery}
                          onChange={e => setRecipeQuery(e.target.value)}
                        />
                      </div>
                      <div className="de-list-scroll">
                        {pickerItems.length === 0 && (
                          <div className="de-list-empty">
                            {recipeQuery.trim() ? 'No matches' : `No ${recipeMode}s`}
                          </div>
                        )}
                        {pickerItems.map(item => (
                          <div
                            key={item.id}
                            className="de-list-picker-item"
                            onClick={() => handlePickerSelect(recipeMode, item)}
                          >
                            <div className="de-list-name">{item.name}</div>
                            {recipeMode === 'product' && (
                              <div className="de-list-id">{item.type}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="de-list-picker-back" onClick={handlePickerBack}>
                        ← {recipeSelection.item.name}
                      </button>

                      {recipeSelection.type === 'product' && (
                        <div className="de-list-role-filter">
                          {DE_ROLE_FILTERS.map(r => (
                            <button
                              key={r}
                              className={`de-role-btn${roleFilter.has(r) ? ' de-role-btn--active' : ''}`}
                              onClick={() => toggleRole(r)}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="de-list-scroll">
                        {filteredEntries.length === 0 && (
                          <div className="de-list-empty">No recipes</div>
                        )}
                        {filteredEntries.map(e => (
                          <div
                            key={e.id}
                            className={`de-list-item${selected === e.id ? ' de-list-item--active' : ''}`}
                            onClick={() => handleSelect(e)}
                          >
                            <div className="de-list-name">{e.name}</div>
                            <div className="de-list-id">{e.id}</div>
                            <button className="de-list-delete" onClick={ev => { ev.stopPropagation(); handleDelete(e.id) }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="de-list-search">
                    <input
                      className="de-list-search-input"
                      type="text"
                      placeholder="Search…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="de-list-scroll">
                    {filteredEntries.length === 0 && (
                      <div className="de-list-empty">No matches</div>
                    )}
                    {filteredEntries.map(e => (
                      <div
                        key={e.id}
                        className={`de-list-item${selected === e.id ? ' de-list-item--active' : ''}`}
                        onClick={() => handleSelect(e)}
                      >
                        <div className="de-list-name">{e.name}</div>
                        <div className="de-list-id">{e.id}</div>
                        <button className="de-list-delete" onClick={ev => { ev.stopPropagation(); handleDelete(e.id) }}>✕</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ─── Form panel ─── */}
            <div className="de-form">
              {!form ? (
                <div className="de-form-empty">Select an entry or create a new one</div>
              ) : (
                <>
                  {/* Mobile back button — hidden on desktop via CSS */}
                  <button className="de-form-back" onClick={handleFormBack}>← Back</button>

                  <div className="de-form-id">ID: <span className="de-form-id-value">{previewId}</span></div>
                  <div className="de-form-scroll">
                    {tab === 'Products' && <ProductForm form={form} setForm={setForm} />}
                    {tab === 'Machines' && <MachineForm form={form} setForm={setForm} researchData={data.research} machineData={data.machines} />}
                    {tab === 'Recipes'  && <RecipeForm  form={form} setForm={setForm} machineData={data.machines} productData={data.products} />}
                    {tab === 'Research' && <ResearchForm form={form} setForm={setForm} researchData={data.research.filter(r => r.id !== selected)} />}
                  </div>
                  <div className="de-form-footer">
                    <button className="ui-btn-rect" onClick={handleSave}>{selected === 'new' ? 'Create' : 'Save'}</button>
                    <button className="de-cancel-btn" onClick={() => { setSelected(null); setForm(null) }}>Cancel</button>
                  </div>
                </>
              )}
            </div>

          </div>
        </Modal>
      )}
    </>
  )
}

export default DataEditor