import { memo } from 'react'

const CanvasEntry = memo(({ canvas, onLoad, onLoadMerge, onDelete }) => (
  <div className="cm-entry">
    <div className="cm-entry-info">
      <span className="cm-entry-name">{canvas.name}</span>
      <span className="cm-entry-meta">{canvas.nodeCount} nodes · {new Date(canvas.savedAt).toLocaleDateString()}</span>
    </div>
    <div className="cm-entry-actions">
      <button className="ui-btn-rect" onClick={() => onLoad(canvas.id)}>Load</button>
      <button className="de-export-btn" onClick={() => onLoadMerge(canvas.id)}>Merge</button>
      <button className="de-arr-remove" onClick={() => onDelete(canvas.id)}>✕</button>
    </div>
  </div>
))

export default CanvasEntry