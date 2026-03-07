import { memo, useMemo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { getHandleTop } from './nodeConstants'

const BASE = {
  width: 12, height: 12,
  border: '2px solid var(--bg-main)',
  borderRadius: '2px',
  position: 'absolute',
}

const INPUT_BASE  = { ...BASE, background: 'var(--handle-input-supplied)',   left:  0, transform: 'translate(-50%, -50%)' }
const OUTPUT_BASE = { ...BASE, background: 'var(--handle-output-connected)', right: 0, transform: 'translate(50%, -50%)'  }

const NodeHandle = memo(({ side, index, sideCount, maxCount }) => {
  const isInput = side === 'input'
  const style = useMemo(() => ({
    ...(isInput ? INPUT_BASE : OUTPUT_BASE),
    top: getHandleTop(index, sideCount, maxCount),
  }), [isInput, index, sideCount, maxCount])

  return (
    <Handle
      type={isInput ? 'target' : 'source'}
      position={isInput ? Position.Left : Position.Right}
      id={`${side}-${index}`}
      style={style}
    />
  )
})

export default NodeHandle