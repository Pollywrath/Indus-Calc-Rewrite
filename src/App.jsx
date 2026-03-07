import { useCallback } from 'react'
import { ReactFlow, Background, BackgroundVariant, addEdge, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import CustomNode from './components/nodes/CustomNode'
import CustomEdge from './components/edges/CustomEdge'
import { DisplayModeProvider } from './contexts/DisplayModeContext'
import { useDashAnimation } from './hooks/useDashAnimation'

const nodeTypes          = { customNode: CustomNode }
const edgeTypes          = { customEdge: CustomEdge }
const defaultEdgeOptions = { type: 'customEdge' }
const canvasStyle        = { width: '100vw', height: '100vh', background: 'var(--bg-main)' }
const snapGrid           = [20, 20]

export default function App() {
  useDashAnimation()

  const [nodes, , onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect   = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])
  const onDragStart = useCallback(() => document.body.classList.add('is-dragging'), [])
  const onDragStop  = useCallback(() => document.body.classList.remove('is-dragging'), [])

  return (
    <DisplayModeProvider>
      <div style={canvasStyle}>
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
    </DisplayModeProvider>
  )
}