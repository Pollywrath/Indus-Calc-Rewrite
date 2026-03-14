import { memo, useMemo, useCallback } from 'react'
import { Field, Inp, Sel } from '../../../../components/common/fields'
import { CYCLE_MODES } from '../constants'
import { buildAutoName } from '../helpers'
import ArraySection from '../ArraySection'
import { RecipeIORow } from '../rows'

const RESIDUE_REFINERY_ID = 'm_residue_refinery'

const getProductNodes = (machine) =>
  (machine?.nodes ?? [])
    .map((n, i) => ({ ...n, originalIndex: i }))
    .filter(n => n.type !== 'Power')

const validateIO = (items, productNodes, side, machineId, productsById) => {
  const errors = []
  const isResidue = machineId === RESIDUE_REFINERY_ID && side === 'output'

  items.forEach((item, i) => {
    const product = productsById[item.product_id]
    if (!product) return
    ;(item.nodes ?? []).forEach(nodeIdx => {
      const pNode = productNodes[nodeIdx]
      if (!pNode) {
        errors.push(`${side} #${i + 1}: node index ${nodeIdx} does not exist on this machine`)
        return
      }
      if (!isResidue && pNode.type !== product.type) {
        errors.push(`${side} #${i + 1}: product type "${product.type}" doesn't match node type "${pNode.type}"`)
      }
    })
  })
  return errors
}

const RecipeForm = memo(({ form, setForm, machineData, productData }) => {
  const productOptions = useMemo(() => productData.map(p => ({ value: p.id, label: p.name })), [productData])
  const machineOptions = useMemo(() => machineData.map(m => ({ value: m.id, label: m.name })), [machineData])
  const productsById   = useMemo(() => Object.fromEntries(productData.map(p => [p.id, p])), [productData])

  const selectedMachine = useMemo(() => machineData.find(m => m.id === form.machine_id), [machineData, form.machine_id])
  const productNodes    = useMemo(() => getProductNodes(selectedMachine), [selectedMachine])

  const nodeHint = useMemo(() => {
    if (!productNodes.length) return ''
    return productNodes.map((n, i) => `${i}:${n.type[0]}(${n.direction})`).join('  ')
  }, [productNodes])

  const powerTypeOptions = useMemo(() => {
    const opts = ['none', 'settings']
    const powerNodes = (selectedMachine?.nodes ?? []).filter(n => n.type === 'Power')
    if (powerNodes.some(n => n.power_type === 'MV' || n.power_type === 'both')) opts.push('MV')
    if (powerNodes.some(n => n.power_type === 'HV' || n.power_type === 'both')) opts.push('HV')
    return opts
  }, [selectedMachine])

  const validationErrors = useMemo(() => [
    ...validateIO(form.inputs,  productNodes, 'input',  form.machine_id, productsById),
    ...validateIO(form.outputs, productNodes, 'output', form.machine_id, productsById),
  ], [form.inputs, form.outputs, productNodes, form.machine_id, productsById])

  const updateIO = useCallback((ioKey, updater) => {
    setForm(f => {
      const updated = updater(f)
      if (updated[ioKey] === f[ioKey] || f.nameManual) return updated
      return { ...updated, name: buildAutoName(updated.inputs, updated.outputs, productsById) }
    })
  }, [setForm, productsById])

  const arrUpdate = useCallback((key, i, val) => updateIO(key, f => { const a = [...f[key]]; a[i] = val; return { ...f, [key]: a } }), [updateIO])
  const arrRemove = useCallback((key, i)      => updateIO(key, f => ({ ...f, [key]: f[key].filter((_, j) => j !== i) })), [updateIO])
  const arrAdd    = useCallback((key)         => updateIO(key, f => ({ ...f, [key]: [...f[key], { product_id: '', quantity: 1, quantity_mode: 'none', nodes: [] }] })), [updateIO])

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
      {nodeHint && (
        <div className="de-form-id" style={{ fontFamily: 'monospace', fontSize: 10 }}>
          Product nodes — {nodeHint}
        </div>
      )}
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
          <Sel value={form.power_type} onChange={v => setForm(f => ({ ...f, power_type: v }))} options={powerTypeOptions} placeholder="Select…" />
        </Field>
        <Field label="Pollution">
          <Inp value={form.pollution} onChange={v => setForm(f => ({ ...f, pollution: v }))} type="number" step={0.01} />
        </Field>
      </div>

      <ArraySection label="Inputs" onAdd={() => arrAdd('inputs')} colLabels={['Product', 'Qty', 'Mode', 'Nodes', '']}>
        {form.inputs.map((item, i) => (
          <RecipeIORow key={i} item={item} productOptions={productOptions}
            onChange={v => arrUpdate('inputs', i, v)} onRemove={() => arrRemove('inputs', i)} />
        ))}
      </ArraySection>

      <ArraySection label="Outputs" onAdd={() => arrAdd('outputs')} colLabels={['Product', 'Qty', 'Mode', 'Nodes', '']}>
        {form.outputs.map((item, i) => (
          <RecipeIORow key={i} item={item} productOptions={productOptions}
            onChange={v => arrUpdate('outputs', i, v)} onRemove={() => arrRemove('outputs', i)} />
        ))}
      </ArraySection>

      {validationErrors.length > 0 && (
        <div className="de-validation-errors">
          {validationErrors.map((e, i) => <div key={i} className="de-validation-error">⚠ {e}</div>)}
        </div>
      )}
    </>
  )
})

export default RecipeForm