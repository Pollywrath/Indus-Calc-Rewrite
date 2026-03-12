import { createContext, useContext, useState, useCallback, useMemo } from 'react'

export const SOLVER_STATUS = { IDLE: 'idle', RUNNING: 'running', DONE: 'done', ERROR: 'error' }

const SolverContext = createContext(null)

export const SolverProvider = ({ children }) => {
  const [status,          setStatus]          = useState(SOLVER_STATUS.IDLE)
  const [results,         setResults]         = useState(null)
  const [machineOverrides, setMachineOverrides] = useState({})

  const runSolver = useCallback((_nodes, _edges) => {
    setStatus(SOLVER_STATUS.RUNNING)
    setTimeout(() => setStatus(SOLVER_STATUS.IDLE), 500)
  }, [])

  const cancelSolver = useCallback(() => setStatus(SOLVER_STATUS.IDLE), [])
  const clearResults = useCallback(() => { setResults(null); setStatus(SOLVER_STATUS.IDLE) }, [])

  const value = useMemo(() => ({
    status, results, machineOverrides,
    runSolver, cancelSolver, clearResults,
    setMachineOverrides,
  }), [status, results, machineOverrides, runSolver, cancelSolver, clearResults])

  return <SolverContext.Provider value={value}>{children}</SolverContext.Provider>
}

export const useSolver = () => useContext(SolverContext)