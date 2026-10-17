import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import seoBuild from './scripts/seo-build.js'
import publicStats from './api/public-stats.js'
import { SITE_URL } from './src/lib/seo.js'

// Run the same server-only handler during local dev/preview as Vercel runs in production.
function localStats() {
  let env
  let cached
  let expires = 0
  async function middleware(req, res, next) {
    if (req.url?.split('?')[0] !== '/api/public-stats') return next()
    if (req.method === 'GET' && cached && Date.now() < expires) {
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(cached))
    }
    // Only these private server variables are loaded; none are exposed to Vite clients.
    for (const key of ['POSTHOG_PROJECT_ID', 'POSTHOG_API_HOST', 'POSTHOG_PERSONAL_API_KEY']) {
      if (!process.env[key] && env[key]) process.env[key] = env[key]
    }
    const adapter = {
      setHeader: (key, value) => res.setHeader(key, value),
      status(code) { res.statusCode = code; return this },
      json(body) {
        if (res.statusCode === 200) { cached = body; expires = Date.now() + 3600000 }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      },
    }
    // Local previews can read public aggregates without a private analytics key.
    if (req.method === 'GET' && (!process.env.POSTHOG_PERSONAL_API_KEY?.trim() || !process.env.POSTHOG_PROJECT_ID?.trim())) {
      try {
        const response = await fetch(`${SITE_URL}/api/public-stats`, { signal: AbortSignal.timeout(12000) })
        if (!response.ok) throw new Error('Stats unavailable')
        const { explorers, pageviews } = await response.json()
        if (![explorers, pageviews].every(value => Number.isSafeInteger(value) && value >= 0)) throw new Error('Invalid counts')
        return adapter.status(200).json({ explorers, pageviews })
      } catch {
        return adapter.status(503).json({ error: 'Stats unavailable' })
      }
    }
    return publicStats(req, adapter).catch(next)
  }
  return {
    name: 'local-public-stats',
    configResolved(config) { env = loadEnv(config.mode, config.envDir, 'POSTHOG_') },
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoBuild(), localStats()],
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
})
