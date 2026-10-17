import { useEffect, useRef, useState } from 'react'
import { formatStat } from './lib/stat-format.js'
import './public-stats.css'

function StatNumber({ value, loading = false }) {
  const number = useRef(null)
  useEffect(() => {
    if (value == null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const reveal = () => number.current.animate([
      { opacity: 0.3, filter: 'blur(5px)', transform: 'translateY(5px)', clipPath: 'inset(0 0 50% 0)' },
      { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)', clipPath: 'inset(0)' },
    ], { duration: 900, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
    let animation = reveal()
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      if (animation.playState === 'finished') animation = reveal()
    }, { threshold: 0.5 })
    observer.observe(number.current)
    return () => { observer.disconnect(); animation?.cancel() }
  }, [value])
  return <dd aria-label={loading ? 'Loading' : value == null ? 'Unavailable' : new Intl.NumberFormat('en').format(value)}><span ref={number} className={`stat-number${loading ? ' stat-number-loading' : ''}`} aria-hidden="true">{loading ? '\u00a0' : formatStat(value)}</span></dd>
}

export default function PublicStats({ totalCards }) {
  const [stats, setStats] = useState(null)
  const [status, setStatus] = useState('loading')
  useEffect(() => {
    let disposed = false
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    fetch('/api/public-stats', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Unavailable')
        return response.json()
      })
      .then(data => { if (!disposed) { setStats(data); setStatus('ready') } })
      .catch(() => { if (!disposed) setStatus('unavailable') })
      .finally(() => clearTimeout(timeout))
    return () => { disposed = true; controller.abort(); clearTimeout(timeout) }
  }, [])
  return (
    <div className="public-stats" aria-label="CosmicGaze community statistics">
      <dl className="public-stats-row" aria-busy={status === 'loading'}>
        <div><dt>Unique visitors</dt><StatNumber value={stats?.explorers} loading={status === 'loading'} /></div>
        <div><dt>Page views</dt><StatNumber value={stats?.pageviews} loading={status === 'loading'} /></div>
        <div><dt>Things to explore</dt><StatNumber value={totalCards} /></div>
      </dl>
    </div>
  )
}
