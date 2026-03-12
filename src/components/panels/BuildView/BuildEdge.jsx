import { memo } from 'react'
import { BaseEdge, getStraightPath } from '@xyflow/react'

// Stub — orthogonal routing added in BuildView feature step
const BuildEdge = memo(({ id, sourceX, sourceY, targetX, targetY }) => {
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  return <BaseEdge id={id} path={path} style={{ stroke: 'var(--border-primary)', strokeWidth: 3 }} />
})

export default BuildEdge