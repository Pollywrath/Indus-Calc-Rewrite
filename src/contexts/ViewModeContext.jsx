import { createContext, useContext, useState, useCallback, useMemo } from 'react'

export const VIEW_MODES = ['recipe', 'build']

const ViewModeContext = createContext(null)

export const ViewModeProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState('recipe')
  const toggleViewMode = useCallback(
    () => setViewMode(prev => prev === 'recipe' ? 'build' : 'recipe'),
    []
  )
  const value = useMemo(() => ({ viewMode, toggleViewMode }), [viewMode, toggleViewMode])
  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>
}

export const useViewMode = () => useContext(ViewModeContext)