import { useState, useEffect } from 'react'

const mq = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)') : null

export const usePointerType = () => {
  const [coarse, setCoarse] = useState(() => mq?.matches ?? false)

  useEffect(() => {
    if (!mq) return
    const handler = (e) => setCoarse(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return coarse ? 'coarse' : 'fine'
}