import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { products as initProducts, machines as initMachines, recipes as initRecipes, research as initResearch } from '../../data/store'

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = ['Products', 'Machines', 'Recipes', 'Research']

const CATEGORIES = ['Extractor', 'Factory', 'Logic', 'Miscellaneous', 'Modular', 'Pipes', 'Power', 'Storage Silo']

const SUBCATEGORIES = {
  Extractor:      ['Fluid Extractor', 'Item Extractor'],
  Factory:        ['Assembler', 'Furnace', 'Misc', 'Molder', 'Plant', 'Processor', 'Refinery', 'Separator'],
  Logic:          ['Logic Gate', 'Logic Input', 'Logic Output', 'Miscellaneous'],
  Miscellaneous:  ['Decoration', 'Depot', 'Other', 'Research'],
  Modular:        ['Modular Diesel Engine', 'Modular Turbine', 'Tree Farm'],
  Pipes:          ['Pipe', 'Intersection', 'Special'],
  Power:          ['Battery', 'Large Power Plant', 'Misc', 'Non-Renewable', 'Power Rate Calculators', 'Renewable', 'Transfer Pole'],
  'Storage Silo': ['Fluid Silo', 'Item Silo'],
}

const CYCLE_MODES    = ['none', 'steam_temp', 'settings']
const QUANTITY_MODES = ['none', 'steam_temp', 'settings', 'pollution']
const POWER_TYPES    = ['MV', 'HV', 'both']
const NODE_DIRS  = ['input', 'output', 'both']
const NODE_TYPES = ['Item', 'Fluid', 'Power']
const PRODUCT_TYPES  = ['Item', 'Fluid']
const TIERS          = [1, 2, 3, 4]

const DATA_KEY = { Products: 'products', Machines: 'machines', Recipes: 'recipes', Research: 'research' }
const FILE_KEY = { Products: 'products.json', Machines: 'machines.json', Recipes: 'recipes.json', Research: 'research.json' }

const RESEARCH_CATEGORIES = ['Production', 'Energy', 'Utility']

const DEFAULT = {
  Products: { name: '', sell_price: 0, rp_multiplier: 1, type: 'Item' },
  Machines: { name: '', cost: 0, category: 'Factory', subcategory: 'Assembler', tier: 1, size: { x: 2, y: 2 }, nodes: [], variant: null, limited: false, research: null },
  Recipes:  { name: '', nameManual: false, machine_id: '', cycle_time: 1, cycle_mode: 'none', power_consumption: 0, power_type: null, pollution: 0, inputs: [], outputs: [] },
  Research: { name: '', rp_cost: 100, category: 'Production', prerequisites: [] },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const slugify = (s) => s.toLowerCase()
  .replace(/&/g, 'and')
  .replace(/\+/g, 'plus')
  .replace(/[^a-z0-9\s_]/g, '')
  .replace(/\s+/g, '_')
  .replace(/__+/g, '_')
  .replace(/^_|_$/g, '')

const autoId = (tab, form, data) => {
  const slug = slugify(form.name || 'unnamed')
  if (tab === 'Products') return `p_${slug}`
  if (tab === 'Machines') return `m_${slug}`
  if (tab === 'Research') return `s_${slugify(form.category || 'unknown')}_${slug}`
  const base  = (form.machine_id || 'm_unknown').replace('m_', '')
  const count = data.recipes.filter(r => r.machine_id === form.machine_id).length
  return `r_${base}_${String(count + 1).padStart(2, '0')}`
}

const exportJson = (filename, data) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  Object.assign(document.createElement('a'), { href: url, download: filename }).click()
  URL.revokeObjectURL(url)
}

// ── Primitive field components ─────────────────────────────────────────────────

const Field = ({ label, children }) => (
  <div className="de-field">
    <label className="de-label">{label}</label>
    {children}
  </div>
)

const Sel = ({ value, onChange, options, placeholder }) => {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const [rect,  setRect]  = useState(null)
  const ref     = useRef(null)
  const inputRef = useRef(null)

  const normalized = useMemo(() => {
    const opts = options.map(o => typeof o === 'object' ? o : { value: String(o), label: String(o) })
    return [...opts].sort((a, b) => a.label.localeCompare(b.label))
  }, [options])

  const current = useMemo(() => normalized.find(o => String(o.value) === String(value ?? '')), [normalized, value])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? normalized.filter(o => o.label.toLowerCase().includes(q)) : normalized
  }, [normalized, query])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery('') } }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = useCallback(() => {
    const r = inputRef.current?.getBoundingClientRect()
    if (r) setRect(r)
    setOpen(true)
    setQuery('')
  }, [])

  const select = useCallback((val) => { onChange(val === '' ? null : val); setOpen(false); setQuery('') }, [onChange])

  const cssVars = rect ? {
    '--sel-top':   `${rect.bottom + 3}px`,
    '--sel-left':  `${rect.left}px`,
    '--sel-width': `${rect.width}px`,
  } : {}

  return (
    <div className="de-sel" ref={ref}>
      <input
        ref={inputRef}
        className="de-sel-input"
        value={open ? query : (current?.label ?? '')}
        placeholder={placeholder ?? 'Select…'}
        onChange={e => setQuery(e.target.value)}
        onFocus={handleOpen}
      />
      {open && rect && createPortal(
        <div className="de-sel-dropdown" style={cssVars}>
          {placeholder && (
            <div className="de-sel-opt de-sel-opt--placeholder" onMouseDown={e => { e.preventDefault(); select('') }}>
              {placeholder}
            </div>
          )}
          {filtered.map(o => (
            <div
              key={o.value}
              className={`de-sel-opt${String(o.value) === String(value ?? '') ? ' de-sel-opt--active' : ''}`}
              onMouseDown={e => { e.preventDefault(); select(o.value) }}
            >
              {o.label}
            </div>
          ))}
          {filtered.length === 0 && <div className="de-sel-empty">No matches</div>}
        </div>,
        document.body
      )}
    </div>
  )
}

const Inp = ({ value, onChange, type = 'text', min, step, placeholder, wide }) => {
  const [raw, setRaw] = useState(null)
  const isNum = type === 'number'
  return (
    <input
      className={`de-input${wide ? ' de-input--wide' : ''}`}
      type="text"
      inputMode={isNum ? 'decimal' : undefined}
      min={min} step={step} placeholder={placeholder}
      value={raw ?? (value ?? '')}
      onChange={e => {
        const v = e.target.value
        if (isNum) {
          setRaw(v)
          const n = Number(v)
          if (v !== '' && v !== '-' && !isNaN(n)) onChange(n)
        } else {
          onChange(v)
        }
      }}
      onBlur={() => {
        if (isNum) {
          const n = Number(raw)
          if (raw !== null && !isNaN(n)) onChange(n)
          setRaw(null)
        }
      }}
    />
  )
}

// ── Array row components ───────────────────────────────────────────────────────

const RemoveBtn = ({ onClick }) => <button className="de-arr-remove" onClick={onClick}>✕</button>

const NodeRow = memo(({ node, onChange, onRemove }) => {
  const isPower = node.type === 'Power'
  const handleTypeChange = (v) => {
    const base = { x: node.x, y: node.y, type: v, direction: node.direction }
    onChange(isPower && v !== 'Power' ? base : v === 'Power'
      ? { ...base, power_type: 'MV', capacity: 100, transfer_rate: 10 }
      : base
    )
  }
  return (
    <div className="de-arr-row">
      <Inp value={node.x}         onChange={v => onChange({ ...node, x: v })}         type="number" min={0} placeholder="X" />
      <Inp value={node.y}         onChange={v => onChange({ ...node, y: v })}         type="number" min={0} placeholder="Y" />
      <Sel value={node.type}      onChange={handleTypeChange}                          options={NODE_TYPES} />
      <Sel value={node.direction} onChange={v => onChange({ ...node, direction: v })} options={NODE_DIRS} />
      {isPower && <>
        <Sel value={node.power_type}    onChange={v => onChange({ ...node, power_type: v })}    options={POWER_TYPES} />
        <Inp value={node.capacity}      onChange={v => onChange({ ...node, capacity: v })}      type="number" min={0} placeholder="MF" />
        <Inp value={node.transfer_rate} onChange={v => onChange({ ...node, transfer_rate: v })} type="number" min={0} step={0.1} placeholder="MF/s" />
      </>}
      <RemoveBtn onClick={onRemove} />
    </div>
  )
})

const RecipeIORow = memo(({ item, onChange, onRemove, productOptions }) => (
  <div className="de-arr-row">
    <Sel value={item.product_id}    onChange={v => onChange({ ...item, product_id: v })}    options={productOptions} placeholder="Product…" />
    <Inp value={item.quantity}      onChange={v => onChange({ ...item, quantity: v })}      type="number" min={0} step={0.01} placeholder="Qty" />
    <Sel value={item.quantity_mode} onChange={v => onChange({ ...item, quantity_mode: v })} options={QUANTITY_MODES} />
    <RemoveBtn onClick={onRemove} />
  </div>
))

const PrereqRow = memo(({ prereq, onChange, onRemove, researchOptions }) => (
  <div className="de-arr-row">
    <Sel
      value={prereq.type}
      onChange={v => onChange({ ...prereq, type: v, value: '' })}
      options={[{ value: 'id', label: 'Research' }, { value: 'string', label: 'Note' }]}
    />
    {prereq.type === 'id'
      ? <Sel value={prereq.value} onChange={v => onChange({ ...prereq, value: v })} options={researchOptions} placeholder="Research…" />
      : <Inp value={prereq.value} onChange={v => onChange({ ...prereq, value: v })} placeholder="Note text…" wide />
    }
    <RemoveBtn onClick={onRemove} />
  </div>
))

// ── Array section wrapper ─────────────────────────────────────────────────────

const ArraySection = ({ label, onAdd, colLabels, children }) => (
  <div className="de-array-section">
    <div className="de-array-header">
      <span>{label}</span>
      <button className="de-arr-add" onClick={onAdd}>+ Add</button>
    </div>
    {colLabels && <div className="de-array-col-labels">{colLabels.map((l, i) => <span key={i}>{l}</span>)}</div>}
    {children}
  </div>
)

// ── Forms ─────────────────────────────────────────────────────────────────────

const useArrayField = (setForm) => ({
  update: useCallback((key, i, val) => setForm(f => { const a = [...f[key]]; a[i] = val; return { ...f, [key]: a } }), [setForm]),
  remove: useCallback((key, i)      => setForm(f => ({ ...f, [key]: f[key].filter((_, j) => j !== i) })), [setForm]),
  add:    useCallback((key, val)    => setForm(f => ({ ...f, [key]: [...f[key], val] })), [setForm]),
})

const ProductForm = memo(({ form, setForm }) => (
  <>
    <Field label="Name">
      <Inp value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Iron Plate" wide />
    </Field>
    <div className="de-row">
      <Field label="Sell Price">
        <Inp value={form.sell_price}    onChange={v => setForm(f => ({ ...f, sell_price: v }))}    type="number" step={0.01} />
      </Field>
      <Field label="RP Multiplier">
        <Inp value={form.rp_multiplier} onChange={v => setForm(f => ({ ...f, rp_multiplier: v }))} type="number" min={0} step={0.1} />
      </Field>
      <Field label="Type">
        <Sel value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={PRODUCT_TYPES} />
      </Field>
    </div>
  </>
))

const MachineForm = memo(({ form, setForm, researchData, machineData }) => {
  const subcats         = SUBCATEGORIES[form.category] ?? []
  const variantOptions  = useMemo(() => machineData.map(m => ({ value: m.id, label: m.name })), [machineData])
  const researchOptions = useMemo(() => researchData.map(r => ({ value: r.id, label: r.name })), [researchData])

  const { update: arrUpdate, remove: arrRemove, add: arrAdd } = useArrayField(setForm)

  return (
    <>
      <Field label="Name">
        <Inp value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Assembler Mk1" wide />
      </Field>
      <div className="de-row">
        <Field label="Cost">
          <Inp value={form.cost} onChange={v => setForm(f => ({ ...f, cost: v }))} type="number" min={0} />
        </Field>
        <Field label="Tier">
          <Sel value={form.tier} onChange={v => setForm(f => ({ ...f, tier: Number(v) }))} options={TIERS} />
        </Field>
        <Field label="Limited">
          <label className="de-checkbox">
            <input type="checkbox" checked={form.limited} onChange={e => setForm(f => ({ ...f, limited: e.target.checked }))} />
            <span>Yes</span>
          </label>
        </Field>
      </div>
      <div className="de-row">
        <Field label="Category">
          <Sel value={form.category} onChange={v => setForm(f => ({ ...f, category: v, subcategory: SUBCATEGORIES[v]?.[0] ?? '' }))} options={CATEGORIES} />
        </Field>
        <Field label="Subcategory">
          <Sel value={form.subcategory} onChange={v => setForm(f => ({ ...f, subcategory: v }))} options={subcats} />
        </Field>
      </div>
      <div className="de-row">
        <Field label="Size X">
          <Inp value={form.size.x} onChange={v => setForm(f => ({ ...f, size: { ...f.size, x: v } }))} type="number" min={1} />
        </Field>
        <Field label="Size Y">
          <Inp value={form.size.y} onChange={v => setForm(f => ({ ...f, size: { ...f.size, y: v } }))} type="number" min={1} />
        </Field>
      </div>
      <div className="de-row">
        <Field label="Variant">
          <Sel value={form.variant}  onChange={v => setForm(f => ({ ...f, variant: v }))}  options={variantOptions}  placeholder="None" />
        </Field>
        <Field label="Research Unlock">
          <Sel value={form.research} onChange={v => setForm(f => ({ ...f, research: v }))} options={researchOptions} placeholder="None" />
        </Field>
      </div>

      <ArraySection label="Nodes" onAdd={() => arrAdd('nodes', { x: 0, y: 0, type: 'Item', direction: 'input' })}
        colLabels={['X', 'Y', 'Type', 'Dir', 'P.Type', 'Cap', 'Rate', '']}>
        {form.nodes.map((n, i) => (
          <NodeRow key={i} node={n} onChange={v => arrUpdate('nodes', i, v)} onRemove={() => arrRemove('nodes', i)} />
        ))}
      </ArraySection>
    </>
  )
})

const buildAutoName = (inputs, outputs, productsMap) => {
  const names = outputs.map(o => productsMap[o.product_id]?.name).filter(Boolean)
  if (!names.length) return ''
  const prefix = inputs.length === 0 ? 'Extracts' : 'Makes'
  return `${prefix} ${names.join(', ')}`
}

const RecipeForm = memo(({ form, setForm, machineData, productData }) => {
  const productOptions = useMemo(() => productData.map(p => ({ value: p.id, label: p.name })), [productData])
  const machineOptions = useMemo(() => machineData.map(m => ({ value: m.id, label: m.name })), [machineData])
  const productsById   = useMemo(() => Object.fromEntries(productData.map(p => [p.id, p])), [productData])

  const updateIO = useCallback((ioKey, updater) => {
    setForm(f => {
      const updated = updater(f)
      if (updated[ioKey] === f[ioKey] || f.nameManual) return updated
      return { ...updated, name: buildAutoName(updated.inputs, updated.outputs, productsById) }
    })
  }, [setForm, productsById])

  const arrUpdate = useCallback((key, i, val) => updateIO(key, f => { const a = [...f[key]]; a[i] = val; return { ...f, [key]: a } }), [updateIO])
  const arrRemove = useCallback((key, i)      => updateIO(key, f => ({ ...f, [key]: f[key].filter((_, j) => j !== i) })), [updateIO])
  const arrAdd    = useCallback((key)         => updateIO(key, f => ({ ...f, [key]: [...f[key], { product_id: '', quantity: 1, quantity_mode: 'none', node: f[key].length }] })), [updateIO])

  return (
    <>
      <Field label="Name">
        <Inp
          value={form.name}
          onChange={v => setForm(f => ({ ...f, name: v, nameManual: v !== '' }))}
          placeholder="Auto-generated from outputs…"
          wide
        />
      </Field>
      <Field label="Machine">
        <Sel value={form.machine_id} onChange={v => setForm(f => ({ ...f, machine_id: v }))} options={machineOptions} placeholder="Select machine…" />
      </Field>
      <div className="de-row">
        <Field label="Cycle Time (s)">
          <Inp value={form.cycle_time} onChange={v => setForm(f => ({ ...f, cycle_time: v }))} type="number" min={0} step={0.1} />
        </Field>
        <Field label="Cycle Mode">
          <Sel value={form.cycle_mode} onChange={v => setForm(f => ({ ...f, cycle_mode: v }))} options={CYCLE_MODES} />
        </Field>
      </div>
      <div className="de-row">
        <Field label="Power (MF/s)">
          <Inp value={form.power_consumption} onChange={v => setForm(f => ({ ...f, power_consumption: v }))} type="number" min={0} />
        </Field>
        <Field label="Power Type">
          <Sel value={form.power_type} onChange={v => setForm(f => ({ ...f, power_type: v }))} options={['MV', 'HV']} placeholder="None" />
        </Field>
        <Field label="Pollution">
          <Inp value={form.pollution} onChange={v => setForm(f => ({ ...f, pollution: v }))} type="number" step={0.01} />
        </Field>
      </div>

      <ArraySection label="Inputs" onAdd={() => arrAdd('inputs')} colLabels={['Product', 'Qty', 'Mode', '']}>
        {form.inputs.map((item, i) => (
          <RecipeIORow key={i} item={item} productOptions={productOptions}
            onChange={v => arrUpdate('inputs', i, { ...v, node: i })} onRemove={() => arrRemove('inputs', i)} />
        ))}
      </ArraySection>

      <ArraySection label="Outputs" onAdd={() => arrAdd('outputs')} colLabels={['Product', 'Qty', 'Mode', '']}>
        {form.outputs.map((item, i) => (
          <RecipeIORow key={i} item={item} productOptions={productOptions}
            onChange={v => arrUpdate('outputs', i, { ...v, node: i })} onRemove={() => arrRemove('outputs', i)} />
        ))}
      </ArraySection>
    </>
  )
})

const ResearchForm = memo(({ form, setForm, researchData }) => {
  const researchOptions = useMemo(() => researchData.map(r => ({ value: r.id, label: r.name })), [researchData])

  const { update, remove, add } = useArrayField(setForm)
  const arrUpdate = useCallback((i, val) => update('prerequisites', i, val), [update])
  const arrRemove = useCallback((i)      => remove('prerequisites', i),      [remove])
  const arrAdd    = useCallback(()       => add('prerequisites', { type: 'id', value: '' }), [add])

  return (
    <>
      <Field label="Name">
        <Inp value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Basic Assembly" wide />
      </Field>
      <div className="de-row">
        <Field label="RP Cost">
          <Inp value={form.rp_cost} onChange={v => setForm(f => ({ ...f, rp_cost: v }))} type="number" min={0} />
        </Field>
        <Field label="Category">
          <Sel value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} options={RESEARCH_CATEGORIES} />
        </Field>
      </div>
      <ArraySection label="Prerequisites" onAdd={arrAdd}>
        {form.prerequisites.map((p, i) => (
          <PrereqRow key={i} prereq={p} researchOptions={researchOptions}
            onChange={v => arrUpdate(i, v)} onRemove={() => arrRemove(i)} />
        ))}
      </ArraySection>
    </>
  )
})

// ── Main component ────────────────────────────────────────────────────────────

const DataEditor = () => {
  const [open, setOpen]         = useState(false)
  const [tab, setTab]           = useState('Products')
  const [selected, setSelected] = useState(null)
  const [form, setForm]         = useState(null)
  const [data, setData]         = useState({
    products: [...initProducts],
    machines: [...initMachines],
    recipes:  [...initRecipes],
    research: [...initResearch],
  })

  const key     = DATA_KEY[tab]
  const entries = data[key]

  const handleTabChange = useCallback((t) => { setTab(t); setSelected(null); setForm(null) }, [])
  const handleClose     = useCallback(() => { setOpen(false); setSelected(null); setForm(null) }, [])

  const STICKY = {
    Products: ['type'],
    Machines: ['tier', 'limited', 'category', 'subcategory', 'variant'],
    Recipes:  ['machine_id', 'cycle_time', 'cycle_mode', 'power_consumption', 'power_type', 'pollution'],
    Research: ['category'],
  }

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
    if (isNew && data[key].some(e => e.id === id)) return alert(`ID "${id}" already exists. Rename the entry to generate a unique ID.`)
    const entry = { ...form, id }
    if (tab === 'Recipes') {
      entry.inputs  = entry.inputs.map((item, i)  => ({ ...item, node: i }))
      entry.outputs = entry.outputs.map((item, i) => ({ ...item, node: i }))
      delete entry.nameManual
    }
    if (tab === 'Research') {
      entry.prerequisites = entry.prerequisites.map(p => p.value).filter(Boolean)
    }
    setData(d => ({
      ...d,
      [key]: isNew ? [...d[key], entry] : d[key].map(e => e.id === selected ? entry : e),
    }))
    setSelected(id)
    setForm(f => ({ ...f, id }))
  }, [form, selected, tab, key, data])

  const handleDelete = useCallback((id) => {
    setData(d => ({ ...d, [key]: d[key].filter(e => e.id !== id) }))
    if (selected === id) { setSelected(null); setForm(null) }
  }, [key, selected])

  const handleSelectNormalised = useCallback((entry) => {
    const clone = structuredClone(entry)
    if (tab === 'Research') {
      clone.prerequisites = (clone.prerequisites ?? []).map(p =>
        typeof p === 'string' && p.startsWith('s_')
          ? { type: 'id', value: p }
          : { type: 'string', value: p }
      )
    }
    setSelected(clone.id)
    setForm(clone)
  }, [tab])

  const previewId = useMemo(() =>
    form ? (selected === 'new' ? autoId(tab, form, data) : selected) : null
  , [form, selected, tab, data])

  return (
    <>
      <button className="ui-btn-rect" onClick={() => setOpen(o => !o)}>Data</button>

      {open && (
        <div className="ui-modal-overlay" onClick={handleClose}>
          <div className="ui-modal de-modal" onClick={e => e.stopPropagation()}>

            <div className="ui-modal-header">
              <span className="ui-modal-title">Data Editor</span>
              <div className="de-header-right">
                <button className="de-export-btn" onClick={() => exportJson(FILE_KEY[tab], data[key])}>
                  Export {tab}
                </button>
                <button className="ui-modal-close" onClick={handleClose}>✕</button>
              </div>
            </div>

            <div className="ui-tabs">
              {TABS.map(t => (
                <button key={t} className={`ui-tab${tab === t ? ' ui-tab--active' : ''}`} onClick={() => handleTabChange(t)}>{t}</button>
              ))}
            </div>

            <div className="de-body">

              {/* ── List panel ── */}
              <div className="de-list">
                <button className="de-new-btn" onClick={handleNew}>+ New</button>
                <div className="de-list-scroll">
                  {entries.map(e => (
                    <div key={e.id} className={`de-list-item${selected === e.id ? ' de-list-item--active' : ''}`} onClick={() => handleSelectNormalised(e)}>
                      <div className="de-list-name">{e.name}</div>
                      <div className="de-list-id">{e.id}</div>
                      <button className="de-list-delete" onClick={ev => { ev.stopPropagation(); handleDelete(e.id) }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Form panel ── */}
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
          </div>
        </div>
      )}
    </>
  )
}

export default DataEditor