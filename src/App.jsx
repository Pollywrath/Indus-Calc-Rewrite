import { useCallback, useState, useMemo, useRef, useEffect } from 'react'
import { ReactFlow, Background, BackgroundVariant, addEdge, useNodesState, useEdgesState, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes, edgeTypes, defaultEdgeOptions } from './components/flow/registry'
import { NODE_WIDTH, RECT_STEP, NODE_GAP, getNodeHeight } from './components/flow/nodes/nodeConstants'
import { DisplayModeProvider } from './contexts/DisplayModeContext'
import { DataProvider }        from './contexts/DataContext'
import { ViewModeProvider }    from './contexts/ViewModeContext'
import { SolverProvider }      from './contexts/SolverContext'
import NodeActionsContext       from './contexts/NodeActionsContext'
import { useData }             from './contexts/DataContext'
import RecipeSelector          from './components/panels/RecipeSelector'
import DataEditor              from './components/panels/DataEditor'

const SNAP_X   = NODE_WIDTH / 20
const SNAP_Y   = RECT_STEP  / 4
const snapGrid = [SNAP_X, SNAP_Y]
const snapVal  = (val, grid) => Math.round(val / grid) * grid
const snapPos  = (x, y) => ({ x: snapVal(x, SNAP_X), y: snapVal(y, SNAP_Y) })

// Sits inside ReactFlow so it can call useReactFlow
const SelectRecipeBridge = ({ machinesMap, recipeTrigger, setNodes, onReadyRef }) => {
  const { screenToFlowPosition } = useReactFlow()

  const onSelectRecipe = useCallback((recipe) => {
    const machine = machinesMap[recipe.machine_id] ?? null
    const newH    = getNodeHeight(recipe.inputs.length, recipe.outputs.length)
    setNodes(ns => {
      const source = recipeTrigger?.sourceNodeId
        ? ns.find(n => n.id === recipeTrigger.sourceNodeId)
        : null
      let position
      if (source) {
        const srcH    = getNodeHeight(source.data.recipe.inputs.length, source.data.recipe.outputs.length)
        const centerY = source.position.y + srcH / 2
        const toRight = recipeTrigger.role === 'Consumers'
        const rawX    = toRight
          ? source.position.x + NODE_WIDTH + NODE_GAP
          : source.position.x - NODE_WIDTH - NODE_GAP
        position = snapPos(rawX, centerY - newH / 2)
      } else {
        const fp = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
        position = snapPos(fp.x - NODE_WIDTH / 2, fp.y - newH / 2)
      }
      return [...ns, { id: crypto.randomUUID(), type: 'customNode', position, data: { recipe, machine } }]
    })
  }, [machinesMap, recipeTrigger, setNodes, screenToFlowPosition])

  useEffect(() => { onReadyRef.current = onSelectRecipe }, [onSelectRecipe, onReadyRef])

  return null
}

const AppInner = () => {
  const { machinesMap }                  = useData()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [recipeTrigger, setRecipeTrigger] = useState(null)
  const onSelectRecipeRef                = useRef(null)

  const onConnect   = useCallback((params) => setEdges(eds => addEdge(params, eds)), [setEdges])
  const onDragStart = useCallback(() => document.body.classList.add('is-dragging'), [])
  const onDragStop  = useCallback(() => document.body.classList.remove('is-dragging'), [])

  const onProductClick = useCallback((productId, role, sourceNodeId) => {
    setRecipeTrigger({ productId, role, sourceNodeId, ts: Date.now() })
  }, [])

  const onDeleteNode = useCallback((nodeId) => {
    setNodes(ns => ns.filter(n => n.id !== nodeId))
    setEdges(es => es.filter(e => e.source !== nodeId && e.target !== nodeId))
  }, [setNodes, setEdges])

  const onClearHandle = useCallback((nodeId, handleId) => {
    setEdges(es => es.filter(e =>
      !(e.source === nodeId && e.sourceHandle === handleId) &&
      !(e.target === nodeId && e.targetHandle === handleId)
    ))
  }, [setEdges])

  const nodeActions = useMemo(
    () => ({ onProductClick, onDeleteNode, onClearHandle }),
    [onProductClick, onDeleteNode, onClearHandle]
  )

  const onSelectRecipe = useCallback((recipe) => {
    onSelectRecipeRef.current?.(recipe)
  }, [])

  return (
    <NodeActionsContext.Provider value={nodeActions}>
      <div className="ui-top-bar">
        <RecipeSelector onSelectRecipe={onSelectRecipe} trigger={recipeTrigger} />
        <DataEditor />
      </div>
      <div className="flow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          snapToGrid
          snapGrid={snapGrid}
          nodesFocusable={false}
          edgesFocusable={false}
          edgesReconnectable={false}
          elevateNodesOnSelect={false}
          onlyRenderVisibleElements
          onNodeDragStart={onDragStart}
          onNodeDragStop={onDragStop}
        >
          <Background variant={BackgroundVariant.Dots} color="var(--border-light)" gap={24} size={1.5} />
          <SelectRecipeBridge
            machinesMap={machinesMap}
            recipeTrigger={recipeTrigger}
            setNodes={setNodes}
            onReadyRef={onSelectRecipeRef}
          />
        </ReactFlow>
      </div>
    </NodeActionsContext.Provider>
  )
}

export default function App() {
  return (
    <DataProvider>
      <ViewModeProvider>
        <SolverProvider>
          <DisplayModeProvider>
            <AppInner />
          </DisplayModeProvider>
        </SolverProvider>
      </ViewModeProvider>
    </DataProvider>
  )
}