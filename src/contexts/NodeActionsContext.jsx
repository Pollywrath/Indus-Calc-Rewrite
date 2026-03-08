import { createContext, useContext } from 'react'

const NodeActionsContext = createContext(null)
export const useNodeActions = () => useContext(NodeActionsContext)
export default NodeActionsContext