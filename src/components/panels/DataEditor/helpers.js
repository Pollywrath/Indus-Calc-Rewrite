import { useCallback } from 'react'
import { DATA_KEY } from './constants'

export const slugify = (s) => s.toLowerCase()
  .replace(/&/g, 'and')
  .replace(/\+/g, 'plus')
  .replace(/[^a-z0-9\s_]/g, '')
  .replace(/\s+/g, '_')
  .replace(/__+/g, '_')
  .replace(/^_|_$/g, '')

export const autoId = (tab, form, data) => {
  const slug = slugify(form.name || 'unnamed')
  if (tab === 'Products') return `p_${slug}`
  if (tab === 'Machines') return `m_${slug}`
  if (tab === 'Research') return `s_${slugify(form.category || 'unknown')}_${slug}`
  const key   = DATA_KEY[tab]
  const base  = (form.machine_id || 'm_unknown').replace('m_', '')
  const count = data[key].filter(r => r.machine_id === form.machine_id).length
  return `r_${base}_${String(count + 1).padStart(2, '0')}`
}

export const exportJson = (filename, data) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  Object.assign(document.createElement('a'), { href: url, download: filename }).click()
  URL.revokeObjectURL(url)
}

export const buildAutoName = (inputs, outputs, productsMap) => {
  const names = outputs.map(o => productsMap[o.product_id]?.name).filter(Boolean)
  if (!names.length) return ''
  const prefix = inputs.length === 0 ? 'Extracts' : 'Makes'
  return `${prefix} ${names.join(', ')}`
}

export const useArrayField = (setForm) => ({
  update: useCallback((key, i, val) => setForm(f => { const a = [...f[key]]; a[i] = val; return { ...f, [key]: a } }), [setForm]),
  remove: useCallback((key, i)      => setForm(f => ({ ...f, [key]: f[key].filter((_, j) => j !== i) })), [setForm]),
  add:    useCallback((key, val)    => setForm(f => ({ ...f, [key]: [...f[key], val] })), [setForm]),
})