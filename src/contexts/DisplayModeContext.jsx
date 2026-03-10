import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { formatTime } from '../utils/formatters'

const MODES = ['cycle', 'second', 'minute', 'hour']

export const MODE_CONFIG = {
  cycle:  { label: '/cycle', seconds: null, windowLabel: null  },
  second: { label: '/sec',   seconds: 1,    windowLabel: '1s'  },
  minute: { label: '/min',   seconds: 60,   windowLabel: '1m'  },
  hour:   { label: '/hr',    seconds: 3600, windowLabel: '1h'  },
}

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