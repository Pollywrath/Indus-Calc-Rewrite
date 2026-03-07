import productsData  from './products.json'
import machinesData  from './machines.json'
import recipesData   from './recipes.json'
import researchData  from './research.json'

export const products  = productsData
export const machines  = machinesData
export const recipes   = recipesData
export const research  = researchData

export const productsMap  = Object.fromEntries(productsData.map(p => [p.id, p]))
export const machinesMap  = Object.fromEntries(machinesData.map(m => [m.id, m]))
export const recipesMap   = Object.fromEntries(recipesData.map(r  => [r.id, r]))
export const researchMap  = Object.fromEntries(researchData.map(s => [s.id, s]))