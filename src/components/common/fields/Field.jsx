import { memo } from 'react'

const Field = memo(({ label, children }) => (
  <div className="de-field">
    <label className="de-label">{label}</label>
    {children}
  </div>
))

export default Field