import { memo } from 'react'
import { Sel, Inp, RemoveBtn } from '../../../components/common/fields'
import { NODE_TYPES, NODE_DIRS, NODE_FACES, POWER_TYPES, QUANTITY_MODES } from './constants'

export const ProductNodeRow = memo(({ node, onChange, onRemove }) => (
  <div className="de-arr-row">
    <Inp value={node.x}         onChange={v => onChange({ ...node, x: v })}         type="number" min={0} placeholder="X" />
    <Inp value={node.y}         onChange={v => onChange({ ...node, y: v })}         type="number" min={0} placeholder="Y" />
    <Sel value={node.face}      onChange={v => onChange({ ...node, face: v })}      options={NODE_FACES} />
    <Sel value={node.type}      onChange={v => onChange({ ...node, type: v })}      options={NODE_TYPES.filter(t => t !== 'Power')} />
    <Sel value={node.direction} onChange={v => onChange({ ...node, direction: v })} options={NODE_DIRS} />
    <RemoveBtn onClick={onRemove} />
  </div>
))

export const PowerNodeRow = memo(({ node, onChange, onRemove }) => (
  <div className="de-arr-row">
    <Inp value={node.x}             onChange={v => onChange({ ...node, x: v })}             type="number" min={0} placeholder="X" />
    <Inp value={node.y}             onChange={v => onChange({ ...node, y: v })}             type="number" min={0} placeholder="Y" />
    <Sel value={node.direction}     onChange={v => onChange({ ...node, direction: v })}     options={NODE_DIRS} />
    <Sel value={node.power_type}    onChange={v => onChange({ ...node, power_type: v })}    options={POWER_TYPES} />
    <Inp value={node.capacity}      onChange={v => onChange({ ...node, capacity: v })}      type="number" min={0} placeholder="MF" />
    <Inp value={node.transfer_rate} onChange={v => onChange({ ...node, transfer_rate: v })} type="number" min={0} step={0.1} placeholder="MF/s" />
    <RemoveBtn onClick={onRemove} />
  </div>
))

const parseNodes = (csv) =>
  csv.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))

const nodesToCsv = (nodes) =>
  (nodes ?? []).join(', ')

export const RecipeIORow = memo(({ item, onChange, onRemove, productOptions }) => (
  <div className="de-arr-row">
    <Sel value={item.product_id}    onChange={v => onChange({ ...item, product_id: v })}    options={productOptions} placeholder="Product…" />
    <Inp value={item.quantity}      onChange={v => onChange({ ...item, quantity: v })}      type="number" min={0} step={0.01} placeholder="Qty" />
    <Sel value={item.quantity_mode} onChange={v => onChange({ ...item, quantity_mode: v })} options={QUANTITY_MODES} />
    <input
      className="de-input"
      style={{ flex: 1, minWidth: 0, width: 'auto' }}
      placeholder="0, 1…"
      value={nodesToCsv(item.nodes)}
      onChange={e => onChange({ ...item, nodes: parseNodes(e.target.value) })}
    />
    <RemoveBtn onClick={onRemove} />
  </div>
))

export const PrereqRow = memo(({ prereq, onChange, onRemove, researchOptions }) => (
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