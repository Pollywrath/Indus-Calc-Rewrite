import { memo } from 'react'
import { useDisplayMode } from '../../../contexts/DisplayModeContext'
import { formatQuantity } from '../../../utils/formatters'
import { ROLE_FILTERS } from './constants'

const RecipeEntry = memo(({ recipe, machinesMap, productsMap, onSelectRecipe, onClose }) => {
  const { getMultiplier, getCycleDisplay } = useDisplayMode()
  const machine      = machinesMap[recipe.machine_id]
  const multiplier   = getMultiplier(recipe.cycle_time)
  const cycleDisplay = getCycleDisplay(recipe.cycle_time)

  return (
    <div className="ui-recipe-entry" onClick={() => { onSelectRecipe(recipe); onClose() }}>
      <div className="ui-recipe-entry-header">
        <span className="ui-recipe-entry-name">{recipe.name}</span>
        <span className="ui-recipe-entry-meta">{machine?.name ?? recipe.machine_id} · {cycleDisplay}</span>
      </div>
      <div className="ui-recipe-io">
        <div className="ui-recipe-col">
          {recipe.inputs.map((item, i) => (
            <div key={i} className="ui-recipe-item ui-recipe-item--input">
              <span className="ui-recipe-qty">{formatQuantity(multiplier != null ? item.quantity * multiplier : item.quantity)}x</span>
              <span className="ui-recipe-item-name">{productsMap[item.product_id]?.name ?? item.product_id}</span>
            </div>
          ))}
        </div>
        <div className="ui-recipe-arrow">→</div>
        <div className="ui-recipe-col">
          {recipe.outputs.map((item, i) => (
            <div key={i} className="ui-recipe-item ui-recipe-item--output">
              <span className="ui-recipe-qty">{formatQuantity(multiplier != null ? item.quantity * multiplier : item.quantity)}x</span>
              <span className="ui-recipe-item-name">{productsMap[item.product_id]?.name ?? item.product_id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

const RecipeList = memo(({ recipes, activeSelection, roleFilter, setRoleFilter, isProduct, machinesMap, productsMap, onSelectRecipe, onClose, onBack }) => (
  <div className="ui-recipe-list">
    <button className="ui-recipe-back" onClick={onBack}>← {activeSelection.name}</button>
    {isProduct && (
      <div className="ui-role-filter">
        {ROLE_FILTERS.map(r => (
          <button
            key={r}
            className={`ui-role-btn${roleFilter.has(r) ? ' ui-role-btn--active' : ''}`}
            onClick={() => setRoleFilter(prev => {
              const next = new Set(prev)
              next.has(r) ? next.delete(r) : next.add(r)
              return next
            })}
          >
            {r}
          </button>
        ))}
      </div>
    )}
    {recipes.length === 0
      ? <div className="ui-recipe-list-empty">No recipes found</div>
      : recipes.map(r => (
          <RecipeEntry
            key={r.id}
            recipe={r}
            machinesMap={machinesMap}
            productsMap={productsMap}
            onSelectRecipe={onSelectRecipe}
            onClose={onClose}
          />
        ))
    }
  </div>
))

export default RecipeList