import { useEffect, useRef } from 'react'

const DASH_CYCLE = 12
const DASH_SPEED = 0.08

export const useDashAnimation = () => {
  const raf    = useRef(null)
  const offset = useRef(0)

  useEffect(() => {
    const tick = () => {
      offset.current = (offset.current - DASH_SPEED) % DASH_CYCLE
      document.documentElement.style.setProperty('--dash-offset', `${offset.current}px`)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])
}