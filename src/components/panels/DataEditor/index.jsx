import { memo, useState, useCallback, useMemo } from 'react'
import Modal from '../../../components/common/Modal'
import { useData } from '../../../contexts/DataContext'
import { TABS, DATA_KEY, FILE_KEY, DEFAULT, STICKY } from './constants'
import { autoId, exportJson } from './helpers'
import { ProductForm, MachineForm, RecipeForm, ResearchForm } from './forms'

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

  const key     = DATA_KEY[tab]
  const entries = data[key]

  const handleTabChange = useCallback((t) => { setTab(t); setSelected(null); setForm(null) }, [])
  const handleClose     = useCallback(() => { setOpen(false); setSelected(null); setForm(null) }, [])

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
    if (tab === 'Recipes') {
      delete entry.nameManual
    }
    if (tab === 'Research') {
      entry.prerequisites = entry.prerequisites.map(p => p.value).filter(Boolean)
    }

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

  const previewId = useMemo(() =>
    form ? (selected === 'new' ? autoId(tab, form, data) : selected) : null
  , [form, selected, tab, data])

  const headerRight = (
    <button className="de-export-btn" onClick={() => exportJson(FILE_KEY[tab], entries)}>
      Export {tab}
    </button>
  )

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

          <div className="de-body">
            <div className="de-list">
              <button className="de-new-btn" onClick={handleNew}>+ New</button>
              <div className="de-list-scroll">
                {entries.map(e => (
                  <div key={e.id} className={`de-list-item${selected === e.id ? ' de-list-item--active' : ''}`} onClick={() => handleSelect(e)}>
                    <div className="de-list-name">{e.name}</div>
                    <div className="de-list-id">{e.id}</div>
                    <button className="de-list-delete" onClick={ev => { ev.stopPropagation(); handleDelete(e.id) }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="de-form">
              {!form ? (
                <div className="de-form-empty">Select an entry or create a new one</div>
              ) : (
                <>
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