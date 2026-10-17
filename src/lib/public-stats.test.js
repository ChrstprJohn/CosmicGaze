import { test } from 'node:test'
import assert from 'node:assert/strict'
import handler from '../../api/public-stats.js'

test('public stats exposes only aggregates, combines both site tags, and handles failures privately', async () => {
  const saved = { ...process.env }
  const originalFetch = globalThis.fetch
  const response = () => ({ headers: {}, setHeader(k, v) { this.headers[k] = v }, status(code) { this.code = code; return this }, json(body) { this.body = body; return this } })
  try {
    delete process.env.POSTHOG_PERSONAL_API_KEY
    let res = response()
    await handler({ method: 'GET' }, res)
    assert.equal(res.code, 503)
    process.env.POSTHOG_PERSONAL_API_KEY = 'private-test-key'
    process.env.POSTHOG_PROJECT_ID = '643035'
    process.env.POSTHOG_API_HOST = 'https://us.posthog.com'
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://us.posthog.com/api/projects/643035/query/')
      const sql = JSON.parse(options.body).query.query
      assert.ok(sql.includes("properties.site_name IN ('cosmicgaze', 'celestial')"))
      assert.ok(!sql.includes('properties.$current_url'))
      assert.ok(!sql.includes('timestamp'))
      assert.ok(sql.includes("countIf(event = '$pageview')"))
      assert.ok(!sql.includes('properties.$pathname'))
      assert.equal((sql.match(/FROM events/g) || []).length, 1)
      assert.ok(!sql.includes('UNION'))
      return { ok: true, json: async () => ({ results: [[42, 32]] }) }
    }
    res = response()
    await handler({ method: 'GET' }, res)
    assert.deepEqual(res.body, { explorers: 42, pageviews: 32 })
    assert.ok(res.headers['Cache-Control'].includes('s-maxage=3600'))
    globalThis.fetch = async () => { throw new Error('secret upstream detail') }
    res = response()
    await handler({ method: 'GET' }, res)
    assert.deepEqual(res.body, { error: 'Stats unavailable' })
    assert.equal(res.headers['Cache-Control'], 'no-store')
    res = response()
    await handler({ method: 'POST' }, res)
    assert.equal(res.code, 405)
  } finally {
    globalThis.fetch = originalFetch
    for (const key of ['POSTHOG_PERSONAL_API_KEY', 'POSTHOG_PROJECT_ID', 'POSTHOG_API_HOST']) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
  }
})
