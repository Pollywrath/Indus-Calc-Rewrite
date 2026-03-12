import { memo, useMemo, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { getHandleTop } from './nodeConstants'
import { useNodeActions } from '../../../contexts/NodeActionsContext'
import { CONTROLS, matches } from '../../../config/controls'

const NodeHandle = memo(({ nodeId, side, index, sideCount, maxCount }) => {
  const isInput = side === 'input'
  const nodeActions = useNodeActions()

  const style = useMemo(() => ({
    top: getHandleTop(index, sideCount, maxCount),
  }), [index, sideCount, maxCount])

  const handleClick = useCallback((e) => {
    if (matches(e, CONTROLS.CLEAR_HANDLE_EDGES)) {
      e.stopPropagation()
      nodeActions?.onClearHandle(nodeId, `${side}-${index}`)
    }
  }, [nodeId, side, index, nodeActions])

  return (
    <Handle
      type={isInput ? 'target' : 'source'}
      position={isInput ? Position.Left : Position.Right}
      id={`${side}-${index}`}
      className={`node-handle node-handle--${isInput ? 'input' : 'output'}`}
      style={style}
      onClick={handleClick}
    />
  )
})

export default NodeHandle