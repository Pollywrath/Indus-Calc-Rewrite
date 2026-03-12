import { memo } from 'react'
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'

// Stub — full build view canvas in BuildView feature step
const BuildView = memo(({ nodes, edges }) => (
  <div className="flow-canvas">
    <ReactFlow nodes={nodes} edges={edges} fitView>
      <Background variant={BackgroundVariant.Lines} color="var(--border-light)" gap={48} />
    </ReactFlow>
  </div>
))

export default BuildView