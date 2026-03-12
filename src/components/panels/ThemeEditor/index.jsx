import { useState, useCallback } from 'react'
import Modal from '../../../components/common/Modal'
import { DEFAULT_THEME } from '../../../config/theme'
import { TOKEN_GROUPS, STORAGE_KEY } from './constants'
import ColorRow from './ColorRow'

// Stub — full implementation in ThemeEditor feature step
const ThemeEditor = () => {
  const [open, setOpen] = useState(false)
  const [overrides, setOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
    catch { return {} }
  })

  const getValue = useCallback((token) => overrides[token] ?? DEFAULT_THEME[token], [overrides])

  const handleChange = useCallback((token, value) => {
    document.documentElement.style.setProperty(token, value)
    setOverrides(prev => {
      const next = { ...prev, [token]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    Object.keys(DEFAULT_THEME).forEach(token =>
      document.documentElement.style.removeProperty(token)
    )
    localStorage.removeItem(STORAGE_KEY)
    setOverrides({})
  }, [])

  return (
    <>
      <button className="ui-btn-rect" onClick={() => setOpen(o => !o)}>Theme</button>
      {open && (
        <Modal
          title="Theme Editor"
          onClose={() => setOpen(false)}
          headerRight={<button className="de-export-btn" onClick={handleReset}>Reset All</button>}
        >
          <div className="de-form-scroll">
            {Object.entries(TOKEN_GROUPS).map(([group, tokens]) => (
              <div key={group}>
                <div className="de-array-header"><span>{group}</span></div>
                {tokens.map(token => (
                  <ColorRow
                    key={token}
                    token={token}
                    value={getValue(token)}
                    defaultValue={DEFAULT_THEME[token]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  )
}

export default ThemeEditor