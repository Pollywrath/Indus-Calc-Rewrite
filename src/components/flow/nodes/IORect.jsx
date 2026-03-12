import { memo, useMemo, useCallback } from 'react'
import { RECT_HEIGHT, COL_WIDTH } from './nodeConstants'
import { formatQuantity } from '../../../utils/formatters'
import { useData } from '../../../contexts/DataContext'
import { useNodeActions } from '../../../contexts/NodeActionsContext'

const rectStyle     = { width: COL_WIDTH, height: RECT_HEIGHT }
const rectStyleFull = { width: '100%',    height: RECT_HEIGHT }

const IORect = memo(({ item, side, multiplier, nodeId, fullWidth }) => {
  const { productsMap } = useData()
  const nodeActions = useNodeActions()
  const display = useMemo(() => {
    const qty  = multiplier != null ? item.quantity * multiplier : item.quantity
    const name = productsMap[item.product_id]?.name ?? item.product_id
    return `${formatQuantity(qty)}x ${name}`
  }, [item.quantity, item.product_id, multiplier])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    const role = side === 'input' ? 'Producers' : 'Consumers'
    nodeActions?.onProductClick(item.product_id, role, nodeId)
  }, [side, item.product_id, nodeId, nodeActions])

  return (
    <div className={`node-rect ${side}`} style={fullWidth ? rectStyleFull : rectStyle} onClick={handleClick}>
      <span className="node-rect-text">{display}</span>
    </div>
  )
})

export default IORect