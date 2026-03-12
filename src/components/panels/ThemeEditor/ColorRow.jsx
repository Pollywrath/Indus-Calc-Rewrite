import { memo } from 'react'

const ColorRow = memo(({ token, value, defaultValue, onChange }) => (
  <div className="te-row">
    <span className="te-token">{token}</span>
    <input className="te-color-input" type="color" value={value} onChange={e => onChange(token, e.target.value)} />
    <input className="te-hex-input"   type="text"  value={value} onChange={e => onChange(token, e.target.value)} />
    <button className="te-reset-btn" onClick={() => onChange(token, defaultValue)} disabled={value === defaultValue}>↺</button>
  </div>
))

export default ColorRow