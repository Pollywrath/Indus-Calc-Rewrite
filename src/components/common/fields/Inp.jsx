import { useState, memo } from 'react'

const Inp = memo(({ value, onChange, type = 'text', min, step, placeholder, wide }) => {
  const [raw, setRaw] = useState(null)
  const isNum = type === 'number'
  return (
    <input
      className={`de-input${wide ? ' de-input--wide' : ''}`}
      type="text"
      inputMode={isNum ? 'decimal' : undefined}
      min={min} step={step} placeholder={placeholder}
      value={raw ?? (value ?? '')}
      onChange={e => {
        const v = e.target.value
        if (isNum) {
          setRaw(v)
          const n = Number(v)
          if (v !== '' && v !== '-' && !isNaN(n)) onChange(n)
        } else {
          onChange(v)
        }
      }}
      onBlur={() => {
        if (isNum) {
          const n = Number(raw)
          if (raw !== null && !isNaN(n)) onChange(n)
          setRaw(null)
        }
      }}
    />
  )
})

export default Inp