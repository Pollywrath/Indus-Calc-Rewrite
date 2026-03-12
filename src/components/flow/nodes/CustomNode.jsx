import { memo, useMemo, useCallback } from 'react'
import IORect from './IORect'
import NodeHandle from './NodeHandle'
import { NODE_WIDTH, TOP_SECTION_HEIGHT, SIDE_PADDING, COL_WIDTH, getNodeHeight } from './nodeConstants'
import { formatMetric, formatMachineCount } from '../../../utils/formatters'
import { useDisplayMode } from '../../../contexts/DisplayModeContext'
import { useNodeActions } from '../../../contexts/NodeActionsContext'
import { CONTROLS, matches } from '../../../config/controls'

const infoAreaStyle  = { height: TOP_SECTION_HEIGHT }
const getIoColumnsStyle = (inputCount, outputCount) =>
  inputCount && outputCount
    ? { display: 'grid', gridTemplateColumns: `${COL_WIDTH}px 1fr ${COL_WIDTH}px`, padding: `0 ${SIDE_PADDING}px` }
    : { display: 'flex', padding: `0 ${SIDE_PADDING}px` }

const CustomNode = memo(({ id, data }) => {
  const { recipe, machine } = data
  const { mode, getMultiplier, getCycleDisplay } = useDisplayMode()
  const nodeActions = useNodeActions()

  const handleClick = useCallback((e) => {
    if (matches(e, CONTROLS.DELETE_NODE)) {
      e.stopPropagation()
      nodeActions?.onDeleteNode(id)
    }
  }, [id, nodeActions])

  const derived = useMemo(() => {
    if (!recipe || !machine) return null
    const inputCount  = recipe.inputs.length
    const outputCount = recipe.outputs.length
    return {
      inputCount,
      outputCount,
      maxCount:         Math.max(inputCount, outputCount, 1),
      nodeStyle:        { width: NODE_WIDTH, height: getNodeHeight(inputCount, outputCount) },
      ioColumnsStyle:   getIoColumnsStyle(inputCount, outputCount),
      tierStyle:        { color: `var(--tier-${machine.tier}-color)` },
      cycleDisplay:     getCycleDisplay(recipe.cycle_time),
      powerDisplay:     formatMetric(recipe.power_consumption),
      pollutionDisplay: formatMetric(recipe.pollution),
      multiplier:       getMultiplier(recipe.cycle_time),
    }
  }, [recipe, machine, mode, getMultiplier, getCycleDisplay])

  if (!derived) return null

  const { inputCount, outputCount, maxCount, nodeStyle, ioColumnsStyle, tierStyle, cycleDisplay, powerDisplay, pollutionDisplay, multiplier } = derived

  return (
    <div className="custom-node" style={nodeStyle} onClick={handleClick}>
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
          <div className="node-machine-count">×{formatMachineCount(1)}</div>
          </div>
        </div>
      </div>
      <div className="node-io-area">
        <div className="node-io-columns" style={ioColumnsStyle}>
          {inputCount  > 0 && <div className="node-io-column node-io-left" style={!outputCount ? { width: '100%' } : undefined}>
            {recipe.inputs.map((item, i)  => <IORect key={i} item={item} side="input"  multiplier={multiplier} nodeId={id} fullWidth={!outputCount} />)}
          </div>}
          {inputCount  > 0 && outputCount > 0 && <div className="node-io-gap" />}
          {outputCount > 0 && <div className="node-io-column node-io-left" style={!inputCount ? { width: '100%' } : undefined}>
            {recipe.outputs.map((item, i) => <IORect key={i} item={item} side="output" multiplier={multiplier} nodeId={id} fullWidth={!inputCount} />)}
          </div>}
        </div>
        <div className="node-handles-container">
          {recipe.inputs.map((_, i)  => <NodeHandle key={i} nodeId={id} side="input"  index={i} sideCount={inputCount}  maxCount={maxCount} />)}
          {recipe.outputs.map((_, i) => <NodeHandle key={i} nodeId={id} side="output" index={i} sideCount={outputCount} maxCount={maxCount} />)}
        </div>
      </div>
    </div>
  )
}, (prev, next) =>
  prev.id === next.id &&
  prev.data.recipe === next.data.recipe &&
  prev.data.machine === next.data.machine
)

export default CustomNode