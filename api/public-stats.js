import { EXTRA_DISCOVERIES } from '../src/lib/discoveries.js'

const pages = Object.fromEntries([
  ['/birthday', 'Birthday sky'], ['/moon', 'Moon phase'], ['/shuffle', 'Cosmic shuffle'],
  ['/solar-system', 'Solar System'], ['/pets', 'Cosmic pets'],
  ...EXTRA_DISCOVERIES.filter(page => page.enabled).map(page => [page.href, page.title]),
])
const productionFilter = "properties.site_name = 'cosmicgaze' AND properties.$current_url LIKE 'https://cosmicgaze.chrbuilds.dev/%' AND timestamp >= now() - INTERVAL 30 DAY"
const paths = Object.keys(pages).map(path => `'${path}'`).join(', ')
const query = `SELECT 'explorers', '', toFloat(uniqExact(distinct_id)) FROM events WHERE event = '$pageview' AND ${productionFilter}
UNION ALL SELECT 'discoveries', '', toFloat(count()) FROM events WHERE event = 'discovery_completed' AND properties.discovery IN ('birthday', 'moon', 'shuffle') AND ${productionFilter}
UNION ALL SELECT 'pageviews', '', toFloat(count()) FROM events WHERE event = '$pageview' AND properties.$pathname IN (${paths}) AND ${productionFilter}`

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { POSTHOG_PERSONAL_API_KEY: key, POSTHOG_PROJECT_ID: project, POSTHOG_API_HOST: host = 'https://us.posthog.com' } = process.env
  if (!key || !/^\d+$/.test(project || '') || !['https://us.posthog.com', 'https://eu.posthog.com'].includes(host)) {
    return res.status(503).json({ error: 'Stats unavailable' })
  }
  try {
    const response = await fetch(`${host}/api/projects/${project}/query/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query }, name: 'CosmicGaze public hero stats' }),
      signal: AbortSignal.timeout(12000),
    })
    if (!response.ok) throw new Error('Query failed')
    const data = await response.json()
    if (!Array.isArray(data.results)) throw new Error('Missing results')
    const rows = data.results
    const count = type => {
      const value = Number(rows.find(row => row[0] === type)?.[2])
      if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid count')
      return value
    }
    const result = { explorers: count('explorers'), pageviews: count('pageviews'), discoveries: count('discoveries') }
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json(result)
  } catch {
    return res.status(503).json({ error: 'Stats unavailable' })
  }
}
