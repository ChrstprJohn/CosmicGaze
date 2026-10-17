import { test } from 'node:test'
import assert from 'node:assert/strict'
import config from '../../vite.config.js'

test('local preview loads and caches public counts without private settings, and rejects invalid responses', async () => {
  const originalFetch = globalThis.fetch
  const keys = ['POSTHOG_PERSONAL_API_KEY', 'POSTHOG_PROJECT_ID']
  const saved = keys.map(key => process.env[key])
  const plugin = config.plugins.find(plugin => plugin.name === 'local-public-stats')
  let middleware
  try {
    keys.forEach(key => { process.env[key] = ' ' })
    plugin.configResolved({ mode: 'test', envDir: process.cwd() })
    plugin.configureServer({ middlewares: { use(handler) { middleware = handler } } })
    const request = async (method = 'GET') => {
      const res = { statusCode: 200, setHeader() {}, end(body) { this.body = JSON.parse(body) } }
      await middleware({ method, url: '/api/public-stats' }, res, error => { throw error })
      return res
    }
    for (const [ok, body] of [[false, {}], [true, { explorers: -1, pageviews: 42 }], [true, { explorers: 42 }]]) {
      globalThis.fetch = async () => ({ ok, json: async () => body })
      const res = await request()
      assert.equal(res.statusCode, 503)
      assert.deepEqual(res.body, { error: 'Stats unavailable' })
    }
    let calls = 0
    globalThis.fetch = async (url, options) => {
      calls++
      assert.equal(url, 'https://cosmicgaze.chrbuilds.dev/api/public-stats')
      assert.equal(options.headers, undefined)
      return { ok: true, json: async () => ({ explorers: 110, pageviews: 2733, privateField: 'excluded' }) }
    }
    for (let index = 0; index < 2; index++) {
      const res = await request()
      assert.equal(res.statusCode, 200)
      assert.deepEqual(res.body, { explorers: 110, pageviews: 2733 })
    }
    assert.equal(calls, 1)
    assert.equal((await request('POST')).statusCode, 405)
  } finally {
    globalThis.fetch = originalFetch
    keys.forEach((key, index) => {
      if (saved[index] === undefined) delete process.env[key]
      else process.env[key] = saved[index]
    })
  }
})
