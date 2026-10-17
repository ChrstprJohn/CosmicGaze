// Run against a production build: node scripts/check-performance.cjs [label]
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const { spawn } = require('node:child_process')
const fs = require('node:fs')

;(async () => {
  const label = process.argv[2] || 'after'
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4188'], { windowsHide: true, stdio: 'ignore' })
  let browser
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    for (const [name, width, height] of [['mobile', 390, 844], ['desktop', 1440, 1000]]) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: name === 'mobile', deviceScaleFactor: name === 'mobile' ? 3 : 1 })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.route('**/api/public-stats', route => route.fulfill({ json: { explorers: 123, pageviews: 456 } }))
      const session = await page.context().newCDPSession(page)
      await session.send('Network.enable')
      await session.send('Network.setCacheDisabled', { cacheDisabled: true })
      await session.send('Emulation.setCPUThrottlingRate', { rate: name === 'mobile' ? 4 : 1 })
      await session.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750 })
      await page.addInitScript(() => {
        window.metrics = { cls: 0, blockingMs: 0 }
        new PerformanceObserver(list => list.getEntries().forEach(e => { window.metrics.lcp = { ms: e.startTime, url: e.url, element: e.element?.tagName } })).observe({ type: 'largest-contentful-paint', buffered: true })
        new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.metrics.cls += e.value })).observe({ type: 'layout-shift', buffered: true })
        new PerformanceObserver(list => list.getEntries().forEach(e => { window.metrics.blockingMs += Math.max(0, e.duration - 50) })).observe({ type: 'longtask', buffered: true })
      })
      await page.goto('http://127.0.0.1:4188/', { waitUntil: 'load' })
      await page.waitForTimeout(6000)
      const report = await page.evaluate(() => ({ metrics: window.metrics, resources: performance.getEntriesByType('resource').map(e => ({ url: e.name, bytes: e.encodedBodySize, duration: e.duration })), hero: document.querySelector('.galaxy-scene img').currentSrc, heroLoaded: document.querySelector('.galaxy-scene img').naturalWidth > 0, overflow: document.documentElement.scrollWidth > innerWidth }))
      report.errors = errors
      fs.mkdirSync('output/performance', { recursive: true })
      fs.writeFileSync(`output/performance/${label}-${name}.json`, JSON.stringify(report, null, 2))
      await page.screenshot({ path: `output/performance/${label}-${name}.png` })
      console.log(name, JSON.stringify(report.metrics), 'hero loaded:', report.heroLoaded, 'overflow:', report.overflow, 'errors:', errors.length)
      await page.locator('.explore-button').click()
      await page.locator('#services').waitFor()
      await page.waitForTimeout(1500)
      await page.screenshot({ path: `output/performance/${label}-${name}-explore.png` })
      await page.close()
    }
  } finally { await browser?.close(); server.kill() }
})().catch(error => { console.error(error); process.exitCode = 1 })
