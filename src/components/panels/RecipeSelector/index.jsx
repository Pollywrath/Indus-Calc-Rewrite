import { useState, useMemo, useCallback, useEffect, useTransition } from 'react'
import Modal from '../../../components/common/Modal'
import { useData } from '../../../contexts/DataContext'
import { useDisplayMode, MODE_CONFIG } from '../../../contexts/DisplayModeContext'
import { TABS } from './constants'
import ProductTable from './ProductTable'
import MachineTable from './MachineTable'
import RecipeList   from './RecipeList'

const matchesRole = (recipe, productId, role) => {
  if (role === 'Producers') return recipe.outputs.some(o => o.product_id === productId)
  if (role === 'Consumers') return recipe.inputs.some(i  => i.product_id === productId)
  return false
}

const RecipeSelector = ({ onSelectRecipe, trigger }) => {
  const { products, machines, recipes, productsMap, machinesMap } = useData()
  const { mode, cycleNext } = useDisplayMode()

  const [open,            setOpen]            = useState(false)
  const [tab,             setTab]             = useState('Product')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [roleFilter,      setRoleFilter]      = useState(new Set())
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!trigger) return
    const product = productsMap[trigger.productId]
    if (!product) return
    setTab('Product')
    setSelectedProduct(product)
    setSelectedMachine(null)
    setRoleFilter(new Set([trigger.role]))
    setOpen(true)
  }, [trigger, productsMap])

  const handleClose = useCallback(() => {
    setOpen(false)
    setSelectedProduct(null)
    setSelectedMachine(null)
    setRoleFilter(new Set())
  }, [])

  const handleBack = useCallback(() => {
    setSelectedProduct(null)
    setSelectedMachine(null)
    setRoleFilter(new Set())
  }, [])

  const handleTabChange = useCallback((t) => {
    startTransition(() => {
      setTab(t)
      setSelectedProduct(null)
      setSelectedMachine(null)
      setRoleFilter(new Set())
    })
  }, [startTransition])

  const activeSelection = selectedProduct ?? selectedMachine

  const activeRecipes = useMemo(() => {
    if (selectedProduct) {
      if (roleFilter.size === 0)
        return recipes.filter(r =>
          r.inputs.some(i  => i.product_id === selectedProduct.id) ||
          r.outputs.some(o => o.product_id === selectedProduct.id)
        )
      return recipes.filter(r => [...roleFilter].some(role => matchesRole(r, selectedProduct.id, role)))
    }
    if (selectedMachine) return recipes.filter(r => r.machine_id === selectedMachine.id)
    return []
  }, [selectedProduct, selectedMachine, roleFilter, recipes])

  return (
    <>
      <div className="rs-top-group">
        <button className="ui-btn-rect" onClick={() => {
          startTransition(() => {
            setOpen(o => !o)
            setSelectedProduct(null)
            setSelectedMachine(null)
            setRoleFilter(new Set())
          })
        }}>Select Recipe</button>
        <button className="ui-btn-mode" onClick={cycleNext}>
          {MODE_CONFIG[mode].label}
        </button>
      </div>

      {open && (
        <Modal title="Select Recipe" onClose={handleClose}>
          <div className="ui-tabs">
            {TABS.map(t => (
              <button key={t} className={`ui-tab${tab === t ? ' ui-tab--active' : ''}`} onClick={() => handleTabChange(t)}>{t}</button>
            ))}
          </div>

          {!activeSelection ? (
            tab === 'Product'
              ? <ProductTable products={products} onSelect={setSelectedProduct} />
              : <MachineTable machines={machines} onSelect={setSelectedMachine} />
          ) : (
            <RecipeList
              recipes={activeRecipes}
              activeSelection={activeSelection}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              isProduct={!!selectedProduct}
              machinesMap={machinesMap}
              productsMap={productsMap}
              onSelectRecipe={onSelectRecipe}
              onClose={handleClose}
              onBack={handleBack}
            />
          )}
        </Modal>
      )}
    </>
  )
}

export default RecipeSelector