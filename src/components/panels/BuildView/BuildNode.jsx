import { memo } from 'react'
import { BUILD_CELL_SIZE } from './constants'

// Stub — full machine footprint + port placement in BuildView feature step
const BuildNode = memo(({ data }) => {
  const { machine } = data
  if (!machine) return null
  const w = machine.size.x * BUILD_CELL_SIZE
  const h = machine.size.y * BUILD_CELL_SIZE
  return (
    <div className="bv-node" style={{ width: w, height: h }}>
      <span className="bv-node-name">{machine.name}</span>
    </div>
  )
})

export default BuildNode