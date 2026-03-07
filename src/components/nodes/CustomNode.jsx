import { memo, useMemo } from 'react'
import IORect from './IORect'
import NodeHandle from './NodeHandle'
import { NODE_WIDTH, TOP_SECTION_HEIGHT, SIDE_PADDING, COL_WIDTH, TIER_COLORS, getNodeHeight } from './nodeConstants'
import { formatMetric, formatTime } from '../../utils/formatters'
import { useDisplayMode, MODE_SECONDS, CYCLE_LABEL } from '../../contexts/DisplayModeContext'

const infoAreaStyle  = { height: TOP_SECTION_HEIGHT }
const ioColumnsStyle = { gridTemplateColumns: `${COL_WIDTH}px 1fr ${COL_WIDTH}px`, padding: `0 ${SIDE_PADDING}px` }

const CustomNode = memo(({ data }) => {
  const { recipe, machine } = data
  const { mode } = useDisplayMode()

  const inputCount  = recipe?.inputs.length  ?? 0
  const outputCount = recipe?.outputs.length ?? 0

  const derived = useMemo(() => {
    if (!recipe || !machine) return null
    const secs = MODE_SECONDS[mode]
    return {
      maxCount:            Math.max(inputCount, outputCount, 1),
      nodeStyle:           { width: NODE_WIDTH, height: getNodeHeight(inputCount, outputCount) },
      tierStyle:           { color: TIER_COLORS[machine.tier] || 'var(--text-primary)' },
      cycleDisplay:     CYCLE_LABEL[mode] ?? formatTime(recipe.cycle_time),
      powerDisplay:     formatMetric(recipe.power_consumption),
      pollutionDisplay: formatMetric(recipe.pollution),
      multiplier:       secs != null ? secs / recipe.cycle_time : null,
    }
  }, [inputCount, outputCount, recipe, machine, mode])

  if (!derived) return null

  const { maxCount, nodeStyle, tierStyle, cycleDisplay, powerDisplay, pollutionDisplay, multiplier } = derived

  return (
    <div className="custom-node" style={nodeStyle}>
      <div className="node-info-area" style={infoAreaStyle}>
        <div className="node-recipe-name">{recipe.name}</div>
        <div className="node-stats-row">
          <div className="node-stats">
            <div className="node-stat-row"><span className="node-stat-label">Cycle:</span> {cycleDisplay}</div>
            <div className="node-stat-row"><span className="node-stat-label">Power:</span> {powerDisplay}</div>
            <div className="node-stat-row"><span className="node-stat-label">Pollution:</span> {pollutionDisplay}</div>
          </div>
          <div className="node-machine-info">
            <div className="node-machine-name" style={tierStyle}>{machine.name}</div>
          </div>
        </div>
      </div>
      <div className="node-io-area">
        <div className="node-io-columns" style={ioColumnsStyle}>
          <div className="node-io-column node-io-left">
            {recipe.inputs.map((item, i)  => <IORect key={i} item={item} side="input"  multiplier={multiplier} />)}
          </div>
          <div className="node-io-gap" />
          <div className="node-io-column node-io-right">
            {recipe.outputs.map((item, i) => <IORect key={i} item={item} side="output" multiplier={multiplier} />)}
          </div>
        </div>
        <div className="node-handles-container">
          {recipe.inputs.map((_, i)  => <NodeHandle key={i} side="input"  index={i} sideCount={inputCount}  maxCount={maxCount} />)}
          {recipe.outputs.map((_, i) => <NodeHandle key={i} side="output" index={i} sideCount={outputCount} maxCount={maxCount} />)}
        </div>
      </div>
    </div>
  )
}, (prev, next) =>
  prev.data.recipe === next.data.recipe &&
  prev.data.machine === next.data.machine
)

export default CustomNode