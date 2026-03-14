import { memo, useMemo } from 'react'
import { Field, Inp, Sel } from '../../../../components/common/fields'
import { CATEGORIES, SUBCATEGORIES, TIERS } from '../constants'
import { useArrayField } from '../helpers'
import ArraySection from '../ArraySection'
import { ProductNodeRow } from '../rows'

const MachineForm = memo(({ form, setForm, researchData, machineData }) => {
  const subcats         = SUBCATEGORIES[form.category] ?? []
  const variantOptions  = useMemo(() => machineData.map(m => ({ value: m.id, label: m.name })), [machineData])
  const researchOptions = useMemo(() => researchData.map(r => ({ value: r.id, label: r.name })), [researchData])
  const { update, remove, add } = useArrayField(setForm)

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
      <ArraySection label="Product Nodes" onAdd={() => add('nodes', { x: 0, y: 0, face: 'N', type: 'Item', direction: 'input' })}
        colLabels={['X', 'Y', 'Face', 'Type', 'Dir', '']}>
        {form.nodes.map((n, i) => n.type !== 'Power' && (
          <ProductNodeRow key={i} node={n} onChange={v => update('nodes', i, v)} onRemove={() => remove('nodes', i)} />
        ))}
      </ArraySection>
    </>
  )
})

export default MachineForm