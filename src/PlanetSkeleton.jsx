import { useLayoutEffect, useRef } from 'react'
import { planetLayout } from './lib/planet-layout.js'

export default function PlanetSkeleton({ rings = false, decorative = false, label = 'Preparing your planet…' }) {
  const host = useRef(null)
  useLayoutEffect(() => {
    const element = host.current
    const resize = () => {
      const { width, height } = element.getBoundingClientRect()
      if (width && height) element.style.setProperty('--skeleton-diameter', `${planetLayout(width, height, rings, decorative).diameter}px`)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [rings, decorative])
  return <div ref={host} className={`planet-skeleton${rings ? ' planet-skeleton-ringed' : ''}`} role="status" aria-label={label}>
    <div className="planet-skeleton-disc media-skeleton" aria-hidden="true" />
    {rings && <div className="planet-skeleton-ring" aria-hidden="true" />}
  </div>
}
