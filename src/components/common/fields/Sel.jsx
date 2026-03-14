import { useState, useMemo, useEffect, useCallback, useRef, memo } from 'react'
import { createPortal } from 'react-dom'
import { matchesSearch } from '../../../utils/listUtils'

const Sel = memo(({ value, onChange, options, placeholder }) => {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const [rect,  setRect]  = useState(null)
  const ref      = useRef(null)
  const inputRef = useRef(null)

  const normalized = useMemo(() => {
    const opts = options.map(o => typeof o === 'object' ? o : { value: String(o), label: String(o) })
    return [...opts].sort((a, b) => a.label.localeCompare(b.label))
  }, [options])

  const current  = useMemo(() => normalized.find(o => String(o.value) === String(value ?? '')), [normalized, value])
  const filtered = useMemo(
    () => query.trim() ? normalized.filter(o => matchesSearch(o.label, query)) : normalized,
    [normalized, query]
  )

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery('') } }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = useCallback(() => {
    const r = inputRef.current?.getBoundingClientRect()
    if (r) setRect(r)
    setOpen(true)
    setQuery('')
  }, [])

  const select = useCallback((val) => { onChange(val === '' ? null : val); setOpen(false); setQuery('') }, [onChange])

  const cssVars = rect ? {
    '--sel-top':   `${rect.bottom + 3}px`,
    '--sel-left':  `${rect.left}px`,
    '--sel-width': `${rect.width}px`,
  } : {}

  return (
    <div className="de-sel" ref={ref}>
      <input
        ref={inputRef}
        className="de-sel-input"
        value={open ? query : (current?.label ?? '')}
        placeholder={placeholder ?? 'Select…'}
        onChange={e => setQuery(e.target.value)}
        onFocus={handleOpen}
      />
      {open && rect && createPortal(
        <div className="de-sel-dropdown" style={cssVars}>
          {placeholder && (
            <div className="de-sel-opt de-sel-opt--placeholder" onMouseDown={e => { e.preventDefault(); select('') }}>
              {placeholder}
            </div>
          )}
          {filtered.map(o => (
            <div
              key={o.value}
              className={`de-sel-opt${String(o.value) === String(value ?? '') ? ' de-sel-opt--active' : ''}`}
              onMouseDown={e => { e.preventDefault(); select(o.value) }}
            >
              {o.label}
            </div>
          ))}
          {filtered.length === 0 && <div className="de-sel-empty">No matches</div>}
        </div>,
        document.body
      )}
    </div>
  )
})

export default Sel