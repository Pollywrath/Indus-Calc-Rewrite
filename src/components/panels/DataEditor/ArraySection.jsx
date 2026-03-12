import { memo } from 'react'

const ArraySection = memo(({ label, onAdd, colLabels, children }) => (
  <div className="de-array-section">
    <div className="de-array-header">
      <span>{label}</span>
      <button className="de-arr-add" onClick={onAdd}>+ Add</button>
    </div>
    {colLabels && (
      <div className="de-array-col-labels">
        {colLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    )}
    {children}
  </div>
))

export default ArraySection