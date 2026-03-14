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
import { useDisplayMode }      from './contexts/DisplayModeContext'
import { MODE_CONFIG }         from './config/displayModes'
import RecipeSelector          from './components/panels/RecipeSelector'
import DataEditor              from './components/panels/DataEditor'

const SNAP_X   = NODE_WIDTH / 20
const SNAP_Y   = RECT_STEP  / 4
const snapGrid = [SNAP_X, SNAP_Y]
const snapVal  = (val, grid) => Math.round(val / grid) * grid
const snapPos  = (x, y) => ({ x: snapVal(x, SNAP_X), y: snapVal(y, SNAP_Y) })

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
  const { mode, cycleNext }              = useDisplayMode()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [recipeTrigger,     setRecipeTrigger]    = useState(null)
  const [deleteMode,        setDeleteMode]        = useState(null)   // null | 'node' | 'edge'
  const [controlsMinimized, setControlsMinimized] = useState(false)
  const onSelectRecipeRef = useRef(null)

  const toggleDeleteMode = useCallback((m) => setDeleteMode(prev => prev === m ? null : m), [])
  const toggleControls   = useCallback(() => setControlsMinimized(m => !m), [])

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

  const onNodeClick = useCallback((_e, node) => {
    if (deleteMode === 'node') onDeleteNode(node.id)
  }, [deleteMode, onDeleteNode])

  const onEdgeClick = useCallback((_e, edge) => {
    if (deleteMode === 'edge') setEdges(es => es.filter(e => e.id !== edge.id))
  }, [deleteMode, setEdges])

  const nodeActions = useMemo(
    () => ({ onProductClick, onDeleteNode, onClearHandle, deleteMode }),
    [onProductClick, onDeleteNode, onClearHandle, deleteMode]
  )

  const onSelectRecipe = useCallback((recipe) => {
    onSelectRecipeRef.current?.(recipe)
  }, [])

  const canvasClass = [
    'flow-canvas',
    deleteMode === 'node' && 'flow-canvas--delete-nodes',
    deleteMode === 'edge' && 'flow-canvas--delete-edges',
  ].filter(Boolean).join(' ')

  const controlsClass = [
    'canvas-controls',
    controlsMinimized && 'canvas-controls--minimized',
  ].filter(Boolean).join(' ')

  return (
    <NodeActionsContext.Provider value={nodeActions}>

      {/* ── Top-left panel buttons ── */}
      <div className="ui-top-bar">
        <RecipeSelector onSelectRecipe={onSelectRecipe} trigger={recipeTrigger} />
        <DataEditor />
      </div>

      {/* ── Bottom-center canvas controls tray ── */}
      <div className={controlsClass}>
        {/* Bar first so toggle tab appears below it visually, but toggle is on top in DOM */}
        <div className="canvas-controls-bar">
          {/* Rate mode cycle button */}
          <button
            className="cc-btn"
            onClick={cycleNext}
            title="Cycle display rate"
          >
            {MODE_CONFIG[mode].trayLabel}
          </button>

          <div className="cc-divider" />

          {/* Node delete */}
          <button
            className={`cc-btn${deleteMode === 'node' ? ' cc-btn--active' : ''}`}
            onClick={() => toggleDeleteMode('node')}
            title="Node delete mode — click a node to remove it"
          >
            🗑
          </button>

          {/* Edge delete */}
          <button
            className={`cc-btn${deleteMode === 'edge' ? ' cc-btn--active' : ''}`}
            onClick={() => toggleDeleteMode('edge')}
            title="Edge delete mode — click an edge or handle to remove it"
          >
            ✂
          </button>
        </div>

        <button
          className="canvas-controls-toggle"
          onClick={toggleControls}
          aria-label={controlsMinimized ? 'Expand controls' : 'Collapse controls'}
        >
          {controlsMinimized ? '▲' : '▼'}
        </button>
      </div>

      {/* ── Canvas ── */}
      <div className={canvasClass}>
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
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
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