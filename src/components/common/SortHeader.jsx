import { memo } from 'react'

const SortHeader = memo(({ label, col, sortCol, sortDir, onSort }) => {
  const active    = sortCol === col
  const indicator = !active || !sortDir ? '↕' : sortDir === 'asc' ? '↑' : '↓'
  return (
    <th
      className={`ui-table-th ui-table-th--sortable${active && sortDir ? ' ui-table-th--active' : ''}`}
      onClick={() => onSort(col)}
    >
      {label} <span className="ui-sort-indicator">{indicator}</span>
    </th>
  )
})

export default SortHeader