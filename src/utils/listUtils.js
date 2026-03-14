import { useState, useDeferredValue, useCallback, useRef } from 'react'

export const matchesSearch = (text, query) => {
  if (!query) return true
  return String(text ?? '').toLowerCase().includes(query.toLowerCase().trim())
}

export const sortItems = (arr, col, dir, getters) => {
  if (!col || !dir || !getters[col]) return arr
  const get = getters[col]
  return [...arr].sort((a, b) => {
    const av = get(a)
    const bv = get(b)
    const cmp = typeof av === 'string'
      ? (av ?? '').localeCompare(bv ?? '')
      : (av ?? 0) - (bv ?? 0)
    return dir === 'asc' ? cmp : -cmp
  })
}

export const calcVirtualWindow = (arr, scrollTop, viewHeight, rowHeight, overscan = 5) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endIndex   = Math.min(arr.length - 1, Math.ceil((scrollTop + viewHeight) / rowHeight) + overscan)
  return {
    visible:   arr.slice(startIndex, endIndex + 1),
    topPad:    startIndex * rowHeight,
    bottomPad: Math.max(0, (arr.length - endIndex - 1) * rowHeight),
  }
}

export const useSortState = (defaultCol = null, defaultDir = null) => {
  const [sort, setSort] = useState({ col: defaultCol, dir: defaultDir })
  const handleSort = useCallback((col) => {
    setSort(prev => {
      if (prev.col !== col)   return { col, dir: 'asc' }
      if (prev.dir === 'asc') return { col, dir: 'desc' }
      return { col: null, dir: null }
    })
  }, [])
  return { sort, handleSort }
}

export const useSearchState = () => {
  const [search, setSearch] = useState('')
  const deferredSearch      = useDeferredValue(search)
  return { search, setSearch, deferredSearch }
}

export const useVirtualScroll = (rowHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef(null)
  const onScroll  = useCallback((e) => setScrollTop(e.currentTarget.scrollTop), [])
  const calcWindow = (arr) => {
    const viewHeight = scrollRef.current?.clientHeight ?? window.innerHeight * 0.75
    return calcVirtualWindow(arr, scrollTop, viewHeight, rowHeight, overscan)
  }

  return { scrollRef, onScroll, calcWindow }
}