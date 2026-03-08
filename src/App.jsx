import { useCallback, useState } from 'react'
import { ReactFlow, Background, BackgroundVariant, addEdge, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import CustomNode from './components/nodes/CustomNode'
import CustomEdge from './components/edges/CustomEdge'
import { DisplayModeProvider } from './contexts/DisplayModeContext'
import NodeActionsContext from './contexts/NodeActionsContext'
import { useDashAnimation } from './hooks/useDashAnimation'
import RecipeSelector from './components/ui/RecipeSelector'
import { machinesMap } from './data/store'

const nodeTypes          = { customNode: CustomNode }
const edgeTypes          = { customEdge: CustomEdge }
const defaultEdgeOptions = { type: 'customEdge' }
const snapGrid           = [20, 20]

export default function App() {
  useDashAnimation()

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [recipeTrigger, setRecipeTrigger] = useState(null)

  const onConnect        = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])
  const onDragStart      = useCallback(() => document.body.classList.add('is-dragging'), [])
  const onDragStop       = useCallback(() => document.body.classList.remove('is-dragging'), [])
  const onProductClick   = useCallback((productId, role) => {
    setRecipeTrigger({ productId, role, ts: Date.now() })
  }, [])

  const nodeActions = { onProductClick }

  const onSelectRecipe   = useCallback((recipe) => {
    const machine = machinesMap[recipe.machine_id] ?? null
    setNodes(ns => [...ns, {
      id:       crypto.randomUUID(),
      type:     'customNode',
      position: { x: 60 + (ns.length % 5) * 440, y: 60 + Math.floor(ns.length / 5) * 320 },
      data:     { recipe, machine },
    }])
  }, [setNodes])

  return (
    <DisplayModeProvider>
      <NodeActionsContext.Provider value={nodeActions}>
      <RecipeSelector onSelectRecipe={onSelectRecipe} trigger={recipeTrigger} />
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
          snapToGrid={true}
          snapGrid={snapGrid}
          nodesFocusable={false}
          edgesFocusable={false}
          edgesReconnectable={false}
          elevateNodesOnSelect={false}
          onlyRenderVisibleElements={true}
          onNodeDragStart={onDragStart}
          onNodeDragStop={onDragStop}
        >
          <Background variant={BackgroundVariant.Dots} color="var(--border-light)" gap={24} size={1.5} />
        </ReactFlow>
      </div>
    </NodeActionsContext.Provider>
    </DisplayModeProvider>
  )
}