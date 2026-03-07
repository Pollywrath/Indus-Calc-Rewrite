import { memo, useMemo } from 'react'
import { RECT_HEIGHT, COL_WIDTH } from './nodeConstants'
import { formatQuantity } from '../../utils/formatters'

const rectStyle = { width: COL_WIDTH, height: RECT_HEIGHT }

const IORect = memo(({ item, side, multiplier }) => {
  const display = useMemo(() => {
    const qty = multiplier != null ? item.quantity * multiplier : item.quantity
    return `${formatQuantity(qty)}x ${item.name}`
  }, [item.quantity, item.name, multiplier])

  return (
    <div className={`node-rect ${side}`} style={rectStyle}>
      <span className="node-rect-text">{display}</span>
    </div>
  )
})

export default IORect