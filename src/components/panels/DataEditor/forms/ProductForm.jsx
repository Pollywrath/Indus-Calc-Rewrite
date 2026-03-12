import { memo } from 'react'
import { Field, Inp, Sel } from '../../../../components/common/fields'
import { PRODUCT_TYPES } from '../constants'

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

export default ProductForm