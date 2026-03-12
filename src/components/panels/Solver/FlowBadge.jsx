import { memo } from 'react'
import { FLOW_COLORS } from './constants'

// Stub — rendered as overlay on nodes in Solver feature step
const FlowBadge = memo(({ state, delta }) => (
  <div className="sv-badge" style={{ background: FLOW_COLORS[state] }}>
    {delta > 0 ? `+${delta}` : delta}
  </div>
))

export default FlowBadge