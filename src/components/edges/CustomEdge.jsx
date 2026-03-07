import { memo, useMemo } from 'react'
import { BaseEdge, getStraightPath } from '@xyflow/react'

const edgeStyle = { pointerEvents: 'none', strokeDashoffset: 'var(--dash-offset)' }

const CustomEdge = memo(({ id, sourceX, sourceY, targetX, targetY }) => {
  const [edgePath] = useMemo(
    () => getStraightPath({ sourceX, sourceY, targetX, targetY }),
    [sourceX, sourceY, targetX, targetY]
  )
  return <BaseEdge id={id} path={edgePath} className="custom-edge" style={edgeStyle} />
})

export default CustomEdge