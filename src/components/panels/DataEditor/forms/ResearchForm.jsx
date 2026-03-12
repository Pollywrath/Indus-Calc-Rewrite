import { memo, useMemo, useCallback } from 'react'
import { Field, Inp, Sel } from '../../../../components/common/fields'
import { RESEARCH_CATEGORIES } from '../constants'
import { useArrayField } from '../helpers'
import ArraySection from '../ArraySection'
import { PrereqRow } from '../rows'

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

export default ResearchForm