import { useEffect, useState } from 'react'
import './public-stats.css'

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
  const number = value => value == null ? '—' : new Intl.NumberFormat('en').format(value)
  return (
    <div className="public-stats" aria-label="CosmicGaze community statistics">
      <dl className="public-stats-row" aria-busy={status === 'loading'}>
        <div><dt>Unique visitors</dt><dd>{number(stats?.explorers)}</dd></div>
        <div title="All pageviews, including the homepage and repeat views, in the last 30 days."><dt>Page views</dt><dd>{number(stats?.pageviews)}</dd></div>
        <div title="Experiences currently available in Explore."><dt>Things to explore</dt><dd>{number(totalCards)}</dd></div>
      </dl>
      <p className="public-stats-note" role="status">{status === 'loading' ? 'Gathering our little universe…' : status === 'unavailable' ? 'Community stats are taking a moment.' : 'Traffic: last 30 days · Refreshed hourly'}</p>
    </div>
  )
}
