const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const { spawn } = require('node:child_process')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const routes = { moon: 'MoonPage', birthday: 'BirthdayPage', shuffle: 'ShufflePage', 'solar-system': 'SolarSystemPage', pets: 'PetsPage', 'moon-match': 'MoonMatchPage', 'cosmic-age': 'CosmicAgePage', 'build-your-planet': 'BuildPlanetPage', 'gravity-playground': 'GravityPage' }
;(async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4186'], { windowsHide: true, stdio: 'ignore' })
  let browser
  fs.mkdirSync('output/explorer-skeletons', { recursive: true })
  try {
    await new Promise(r => setTimeout(r, 800))
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    for (const [device, width, height] of [['mobile', 390, 844], ['desktop', 1440, 1000]]) {
      for (const [path, chunk] of Object.entries(routes)) {
        const page = await browser.newPage({ viewport: { width, height }, isMobile: device === 'mobile', reducedMotion: 'reduce' })
        const errors = []
        page.on('pageerror', e => errors.push(e.message))
        await page.route('https://**/*', r => r.abort())
        let release
        const gate = new Promise(r => { release = r })
        await page.route(new RegExp(`/assets/${chunk}-.*\\.js`), async route => { await gate; await route.continue() })
        await page.goto(`http://127.0.0.1:4186/${path}`, { waitUntil: 'commit' })
        await page.locator('.page-skeleton').waitFor()
        assert.ok((await page.locator('.page-skeleton h1').innerText()).length > 0)
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
        await page.screenshot({ path: `output/explorer-skeletons/${path}-${device}-route.png` })
        release()
        await page.locator('.page-skeleton').waitFor({ state: 'detached' })
        assert.deepEqual(errors, [])
        await page.close()
        console.log(device, path, 'route skeleton passed')
      }
      for (const path of ['moon', 'moon-match', 'cosmic-age', 'build-your-planet', 'solar-system']) {
        const page = await browser.newPage({ viewport: { width, height }, isMobile: device === 'mobile', reducedMotion: 'reduce' })
        const errors = []
        page.on('pageerror', e => errors.push(e.message))
        await page.route('https://**/*', r => r.abort())
        let release
        const gate = new Promise(r => { release = r })
        await page.route(/\/textures\//, async route => { await gate; await route.continue() })
        await page.goto(`http://127.0.0.1:4186/${path}`, { waitUntil: 'commit' })
        const skeleton = page.locator('.planet-stage-feedback .planet-skeleton, .moon-workspace .moon-stage .result-skeleton, .moon-match-visual .match-moon .result-skeleton').first()
        await skeleton.waitFor()
        await page.waitForTimeout(100)
        const bounds = await page.evaluate(() => {
          const stage = document.querySelector('.planet-stage, .moon-stage, .match-moon')
          const disc = stage.querySelector('.planet-skeleton-disc, .result-skeleton-shape')
          const a = stage.getBoundingClientRect(), b = disc.getBoundingClientRect()
          return { stage: { x: a.x, y: a.y, width: a.width, height: a.height }, disc: { x: b.x, y: b.y, width: b.width, height: b.height } }
        })
        assert.ok(bounds.disc.width > 0, JSON.stringify(bounds))
        assert.ok(bounds.disc.y >= bounds.stage.y - 1 && bounds.disc.y + bounds.disc.height <= bounds.stage.y + bounds.stage.height + 1, JSON.stringify(bounds))
        assert.ok(bounds.disc.x >= bounds.stage.x - 1 && bounds.disc.x + bounds.disc.width <= bounds.stage.x + bounds.stage.width + 1, JSON.stringify(bounds))
        await page.screenshot({ path: `output/explorer-skeletons/${path}-${device}-visual.png` })
        release()
        await skeleton.waitFor({ state: 'detached', timeout: 30000 })
        if (path !== 'moon-match') {
          const stage = await page.locator('.planet-stage, .moon-stage').first().boundingBox()
          assert.ok(Math.abs(stage.height - bounds.stage.height) < 1, 'stage resized after loading')
        }
        assert.deepEqual(errors, [])
        console.log(device, path, JSON.stringify(bounds), 'visual skeleton passed')
        await page.close()
      }
    }
  } finally { await browser?.close(); server.kill() }
})().catch(e => { console.error(e); process.exitCode = 1 })
