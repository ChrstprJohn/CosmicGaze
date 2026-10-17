const productionFilter = "properties.site_name IN ('cosmicgaze', 'celestial')"
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
  const key = process.env.POSTHOG_PERSONAL_API_KEY?.trim()
  const project = process.env.POSTHOG_PROJECT_ID?.trim()
  const host = (process.env.POSTHOG_API_HOST || 'https://us.posthog.com').trim().replace(/\/+$/, '')
  if (!key || !/^\d+$/.test(project || '') || !['https://us.posthog.com', 'https://eu.posthog.com'].includes(host)) {
    console.error('[public-stats] Invalid server configuration', {
      keyPresent: Boolean(key), projectValid: /^\d+$/.test(project || ''),
      hostValid: ['https://us.posthog.com', 'https://eu.posthog.com'].includes(host),
    })
    return res.status(503).json({ error: 'Stats unavailable' })
  }
  try {
    const response = await fetch(`${host}/api/projects/${project}/query/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query }, name: 'CosmicGaze public hero stats' }),
      signal: AbortSignal.timeout(12000),
    })
    if (!response.ok) {
      console.error('[public-stats] PostHog request rejected', { status: response.status })
      throw new Error('Query failed')
    }
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
  } catch (error) {
    console.error('[public-stats] Unable to load counts', { reason: error.name === 'TimeoutError' ? 'timeout' : error.message === 'Query failed' ? 'upstream request rejected' : 'network or invalid response' })
    return res.status(503).json({ error: 'Stats unavailable' })
  }
}
