import { useEffect, useRef, useState } from 'react'
import { formatStat } from './lib/stat-format.js'
import './public-stats.css'

function StatNumber({ value, loading = false }) {
  return <dd><span className="sr-only">{loading ? 'Loading' : value == null ? 'Unavailable' : new Intl.NumberFormat('en').format(value)}</span><span className={`stat-number${loading ? ' stat-number-loading' : ''}`} aria-hidden="true">{loading ? '\u00a0' : [...formatStat(value)].map((character, index) => /[0-9]/.test(character) ? (
    <span className="stat-digit" data-digit={character} key={index}><span className="stat-digit-track" style={{ transform: `translateY(-${(10 + Number(character)) * 1.1}em)` }}>{Array.from({ length: 20 }, (_, digit) => <span key={digit}>{digit % 10}</span>)}</span></span>
  ) : <span key={index}>{character}</span>)}</span></dd>
}

export default function PublicStats({ totalCards }) {
  const row = useRef(null)
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
  useEffect(() => {
    if (status === 'loading' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let animations = []
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      animations = [...row.current.querySelectorAll('.stat-digit-track')].map(track => track.animate([
        { transform: 'translateY(0)' },
        { transform: track.style.transform },
      ], { duration: 1300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }))
      const startTime = document.timeline.currentTime
      animations.forEach(animation => { animation.startTime = startTime })
    }, { threshold: 0.5 })
    observer.observe(row.current)
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()) }
  }, [status, totalCards])
  return (
    <div className="public-stats" aria-label="CosmicGaze community statistics">
      <dl ref={row} className="public-stats-row" aria-busy={status === 'loading'}>
        <div><dt>Unique visitors</dt><StatNumber value={stats?.explorers} loading={status === 'loading'} /></div>
        <div><dt>Page views</dt><StatNumber value={stats?.pageviews} loading={status === 'loading'} /></div>
        <div><dt>Things to explore</dt><StatNumber value={totalCards} loading={status === 'loading'} /></div>
      </dl>
    </div>
  )
}
