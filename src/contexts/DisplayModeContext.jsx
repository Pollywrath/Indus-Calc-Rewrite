import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { formatTime } from '../utils/formatters'
import { MODES, MODE_CONFIG } from '../config/displayModes'

export { MODE_CONFIG }

const DisplayModeContext = createContext()

export const useDisplayMode = () => {
  const { mode, cycleNext } = useContext(DisplayModeContext)
  const { seconds, windowLabel } = MODE_CONFIG[mode]
  const getMultiplier   = useCallback((cycleTime) => seconds != null ? seconds / cycleTime : null, [seconds])
  const getCycleDisplay = useCallback((cycleTime) => windowLabel ?? formatTime(cycleTime), [windowLabel])
  return { mode, cycleNext, getMultiplier, getCycleDisplay }
}

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