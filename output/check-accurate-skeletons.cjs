const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const routes = { moon: 'MoonPage', birthday: 'BirthdayPage', shuffle: 'ShufflePage', 'solar-system': 'SolarSystemPage', pets: 'PetsPage', 'moon-match': 'MoonMatchPage', 'cosmic-age': 'CosmicAgePage', 'build-your-planet': 'BuildPlanetPage', 'gravity-playground': 'GravityPage' }
const selectors = ['h1', '.back-link', '.date-trigger', '.discovery-description', '.moon-description', '.birthday-description', '.planet-description', '.planet-stage', '.moon-stage', '.moon-match-visual', '.match-score', '.gravity-stage', '.gravity-results', '.age-number', '.art-caption', '.builder-actions', '.world-selector', '.palette-selector', '.world-custom-colors', '.world-sliders', '.check-control', '.planet-facts', '.pet-portrait', '.cosmic-pet h2', '.pet-download', '.pets-heading-row', '.art-download-wrap', '.text-field']
;(async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4187'], { windowsHide: true, stdio: 'ignore' })
  let browser
  const results = []
  fs.mkdirSync('output/accurate-skeletons', { recursive: true })
  try {
    await new Promise(r => setTimeout(r, 800))
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) for (const [path, chunk] of Object.entries(routes)) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: device === 'mobile', reducedMotion: 'reduce' })
      const errors = []
      page.on('pageerror', e => errors.push(e.message))
      await page.route('https://**/*', r => r.abort())
      let release
      const gate = new Promise(r => { release = r })
      await page.route(new RegExp(`/assets/${chunk}-.*\\.js`), async route => { await gate; await route.continue() })
      await page.goto(`http://127.0.0.1:4187/${path}`, { waitUntil: 'commit' })
      await page.locator('.page-skeleton').waitFor()
      await page.evaluate(() => document.fonts.ready)
      const capture = () => page.evaluate(selectors => Object.fromEntries(selectors.map(s => [s, [...document.querySelectorAll(`main ${s}`)].map(e => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height } })])), selectors)
      const before = await capture()
      await page.screenshot({ path: `output/accurate-skeletons/${path}-${device}-skeleton.png`, fullPage: true })
      if (path === 'build-your-planet') { await page.evaluate(() => scrollTo(0, 650)); await page.screenshot({ path: `output/accurate-skeletons/${path}-${device}-scrolled.png` }); await page.evaluate(() => scrollTo(0, 0)) }
      release()
      await page.locator('.page-skeleton').waitFor({ state: 'detached' })
      await page.waitForTimeout(600)
      await page.evaluate(() => document.fonts.ready)
      const after = await capture()
      const diffs = []
      for (const s of selectors) if (before[s].length && after[s].length) {
        for (let i = 0; i < Math.min(before[s].length, after[s].length); i++) {
          const a = before[s][i], b = after[s][i]
          const delta = Math.max(...Object.keys(a).map(k => Math.abs(a[k] - b[k])))
          if (delta > 2) diffs.push({ selector: s, index: i, delta: Math.round(delta), before: a, after: b })
        }
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
      results.push({ path, device, diffs, errors, overflow })
      await page.screenshot({ path: `output/accurate-skeletons/${path}-${device}-loaded.png`, fullPage: true })
      console.log(device, path, 'differences:', diffs.map(d => `${d.selector}[${d.index}]:${d.delta}`).join(', ') || 'none', 'errors:', errors.length, 'overflow:', overflow)
      await page.close()
    }
    fs.writeFileSync('output/accurate-skeletons/layout-comparison.json', JSON.stringify(results, null, 2))
  } finally { await browser?.close(); server.kill() }
})().catch(e => { console.error(e); process.exitCode = 1 })
