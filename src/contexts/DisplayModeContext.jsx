import { createContext, useContext, useState, useCallback, useMemo } from 'react'

export const MODES        = ['cycle', 'second', 'minute', 'hour']
export const MODE_LABELS  = { cycle: '/cycle', second: '/sec', minute: '/min', hour: '/hr' }
export const MODE_SECONDS = { cycle: null, second: 1, minute: 60, hour: 3600 }
export const CYCLE_LABEL  = { cycle: null, second: '1s', minute: '1m', hour: '1h' }

const DisplayModeContext = createContext()

export const useDisplayMode = () => useContext(DisplayModeContext)

export const DisplayModeProvider = ({ children }) => {
  const [mode, setMode] = useState('cycle')
  const cycleNext = useCallback(
    () => setMode(prev => MODES[(MODES.indexOf(prev) + 1) % MODES.length]),
    []
  )
  const value = useMemo(() => ({ mode, cycleNext }), [mode, cycleNext])
  return (
    <DisplayModeContext.Provider value={value}>
      {children}
    </DisplayModeContext.Provider>
  )
}