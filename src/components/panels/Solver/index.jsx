import { useState } from 'react'
import { useSolver } from '../../../contexts/SolverContext'
import { SOLVER_STATUS } from '../../../contexts/SolverContext'

// Stub — full WASM wiring in Solver feature step
const Solver = ({ nodes, edges }) => {
  const { status, runSolver, clearResults } = useSolver()
  const running = status === SOLVER_STATUS.RUNNING

  return (
    <div className="rs-top-group">
      <button className="ui-btn-rect" onClick={() => runSolver(nodes, edges)} disabled={running}>
        {running ? 'Solving…' : 'Solve'}
      </button>
      {status === SOLVER_STATUS.DONE && (
        <button className="ui-btn-mode" onClick={clearResults}>Clear</button>
      )}
    </div>
  )
}

export default Solver