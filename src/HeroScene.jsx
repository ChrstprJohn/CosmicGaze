import { useEffect, useRef, useState } from 'react'
import './hero-comets.css'

export default function HeroScene() {
  const layer = useRef(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let inView = false
    const update = () => setRunning(inView && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    })
    observer.observe(layer.current)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return (
    <div ref={layer} className={`hero-scene${running ? ' is-running' : ''}`} aria-hidden="true">
      <div className="galaxy-scene"><picture>
        <source media="(max-width: 767px)" type="image/avif" srcSet="/previews/hero-galaxy-640.avif" />
        <source media="(max-width: 767px)" srcSet="/previews/hero-galaxy-640.webp" />
        <source type="image/avif" srcSet="/previews/hero-galaxy-1100.avif 1100w, /previews/hero-galaxy-1600.avif 1600w" sizes="1100px" />
        <img src="/previews/hero-galaxy-1100.webp" srcSet="/previews/hero-galaxy-1100.webp 1100w, /previews/hero-galaxy-1600.webp 1600w" sizes="1100px" alt="" width="1600" height="1612" decoding="async" fetchPriority="high" />
      </picture></div>
    </div>
  )
}
