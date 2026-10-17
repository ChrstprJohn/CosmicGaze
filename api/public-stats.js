const productionFilter = "properties.site_name = 'cosmicgaze' AND properties.$current_url LIKE 'https://cosmicgaze.chrbuilds.dev/%' AND timestamp >= now() - INTERVAL 30 DAY"
const query = `SELECT
  uniqExactIf(distinct_id, event = '$pageview'),
  countIf(event = '$pageview')
FROM events WHERE ${productionFilter} AND event = '$pageview'`

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
    const row = data.results[0]
    if (!Array.isArray(row) || row.length !== 2) throw new Error('Invalid aggregate result')
    const count = index => {
      const value = Number(row[index])
      if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid count')
      return value
    }
    const result = { explorers: count(0), pageviews: count(1) }
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json(result)
  } catch {
    return res.status(503).json({ error: 'Stats unavailable' })
  }
}
