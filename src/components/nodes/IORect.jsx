import { memo, useMemo } from 'react'
import { RECT_HEIGHT, COL_WIDTH } from './nodeConstants'
import { formatQuantity } from '../../utils/formatters'
import { productsMap } from '../../data/store'

const rectStyle = { width: COL_WIDTH, height: RECT_HEIGHT }

const IORect = memo(({ item, side, multiplier }) => {
  const display = useMemo(() => {
    const qty  = multiplier != null ? item.quantity * multiplier : item.quantity
    const name = productsMap[item.product_id]?.name ?? item.product_id
    return `${formatQuantity(qty)}x ${name}`
  }, [item.quantity, item.product_id, multiplier])

  return (
    <div className={`node-rect ${side}`} style={rectStyle}>
      <span className="node-rect-text">{display}</span>
    </div>
  )
})

export default IORect