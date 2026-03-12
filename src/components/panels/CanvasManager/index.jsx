import { useState, useEffect, useCallback } from 'react'
import Modal from '../../../components/common/Modal'
import { listCanvases, getCanvas, saveCanvas, deleteCanvas } from '../../../db/canvases'
import { MAX_CANVAS_NAME_LENGTH } from './constants'
import CanvasEntry from './CanvasEntry'

// Stub — receives nodes/edges/setNodes/setEdges as props, wired in App in CanvasManager feature step
const CanvasManager = ({ nodes, edges, setNodes, setEdges }) => {
  const [open,     setOpen]     = useState(false)
  const [canvases, setCanvases] = useState([])

  const refresh = useCallback(() => listCanvases().then(setCanvases), [])

  useEffect(() => { if (open) refresh() }, [open, refresh])

  const handleSave = useCallback(async () => {
    const name = prompt('Canvas name:', `Canvas ${canvases.length + 1}`)
    if (!name) return
    await saveCanvas(name.slice(0, MAX_CANVAS_NAME_LENGTH), nodes, edges)
    refresh()
  }, [nodes, edges, canvases.length, refresh])

  const handleLoad = useCallback(async (id) => {
    const canvas = await getCanvas(id)
    setNodes(canvas.nodes)
    setEdges(canvas.edges)
    setOpen(false)
  }, [setNodes, setEdges])

  const handleDelete = useCallback(async (id) => {
    await deleteCanvas(id)
    refresh()
  }, [refresh])

  return (
    <>
      <button className="ui-btn-rect" onClick={() => setOpen(o => !o)}>Canvases</button>
      {open && (
        <Modal
          title="Canvas Manager"
          onClose={() => setOpen(false)}
          headerRight={<button className="de-export-btn" onClick={handleSave}>Save Current</button>}
        >
          <div className="de-form-scroll">
            {canvases.length === 0
              ? <div className="de-form-empty">No saved canvases</div>
              : canvases.map(c => (
                  <CanvasEntry
                    key={c.id}
                    canvas={c}
                    onLoad={handleLoad}
                    onLoadMerge={() => {}} // wired in feature step
                    onDelete={handleDelete}
                  />
                ))
            }
          </div>
        </Modal>
      )}
    </>
  )
}

export default CanvasManager