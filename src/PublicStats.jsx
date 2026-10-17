import { useEffect, useState } from 'react'
import './public-stats.css'

export default function PublicStats() {
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
        <div><dt>Cosmic explorers</dt><dd>{number(stats?.explorers)}</dd></div>
        <div><dt>Discovery page views</dt><dd>{number(stats?.pageviews)}</dd></div>
        <div title="Successful birthday lookups, Moon calculations, and cosmic shuffles since tracking began."><dt>Discoveries made</dt><dd>{number(stats?.discoveries)}</dd></div>
      </dl>
      <p className="public-stats-note" role="status">{status === 'loading' ? 'Gathering our little universe…' : status === 'unavailable' ? 'Community stats are taking a moment.' : 'Last 30 days · Refreshed hourly'}</p>
    </div>
  )
}
