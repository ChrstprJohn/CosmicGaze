const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const assert = require('node:assert/strict')
;(async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4189'], { windowsHide: true, stdio: 'ignore' })
  let browser
  fs.mkdirSync('output/download-previews', { recursive: true })
  try {
    await new Promise(r => setTimeout(r, 800))
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      for (const path of ['moon', 'moon-match', 'cosmic-age', 'build-your-planet', 'pets', 'birthday', 'shuffle']) {
        const page = await browser.newPage({ viewport: { width, height }, isMobile: device === 'mobile', acceptDownloads: true, reducedMotion: 'reduce' })
        const errors = []
        const downloads = []
        page.on('pageerror', e => errors.push(e.message))
        page.on('download', d => downloads.push(d))
        await page.route('https://**/*', async route => {
          const url = route.request().url()
          if (url.includes('apod-basic')) return route.fulfill({ json: { date: new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }), title: 'NASA preview fixture', media_type: 'image', hdurl: 'https://assets.science.nasa.gov/fixture.webp', credit: 'NASA fixture' }, headers: { 'Access-Control-Allow-Origin': '*' } })
          if (url.includes('assets.science.nasa.gov')) return route.fulfill({ path: 'public/previews/galaxy.webp', contentType: 'image/webp', headers: { 'Access-Control-Allow-Origin': '*' } })
          return route.abort()
        })
        await page.goto(`http://127.0.0.1:4189/${path}`)
        const trigger = page.locator('button[aria-haspopup="dialog"]').filter({ hasText: /Preview/ }).first()
        await trigger.waitFor()
        await page.waitForFunction(() => [...document.querySelectorAll('button[aria-haspopup="dialog"]')].some(b => b.textContent.includes('Preview') && !b.disabled))
        await trigger.click()
        const dialog = page.locator('dialog[open]')
        await dialog.waitFor()
        const link = dialog.locator('a[download]')
        await link.waitFor({ timeout: 30000 })
        assert.equal(downloads.length, 0, 'Preview must never save automatically')
        const rect = await dialog.boundingBox()
        assert.ok(rect.y >= 0 && rect.y + rect.height <= height + 1, JSON.stringify(rect))
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
        assert.equal(await page.evaluate(() => document.activeElement?.closest('dialog') !== null), true)
        await page.screenshot({ path: `output/download-previews/${path}-${device}.png` })
        const blob = await dialog.locator('img').evaluate(async img => ({ width: img.naturalWidth, height: img.naturalHeight, text: await (await fetch(img.src)).text() }))
        if (['moon', 'moon-match', 'cosmic-age', 'build-your-planet'].includes(path)) assert.deepEqual([blob.width, blob.height], [1080, 1350])
        if (path === 'moon-match') { assert.ok(blob.text.includes('2005-09-05')); assert.ok(blob.text.includes('2006-05-15')) }
        const downloadEvent = page.waitForEvent('download')
        await link.click()
        const download = await downloadEvent
        assert.equal(downloads.length, 1)
        if (path === 'moon-match' && device === 'desktop') await download.saveAs('output/download-previews/moon-match-card.png')
        await page.keyboard.press('Escape')
        await dialog.waitFor({ state: 'detached' })
        assert.equal(await trigger.evaluate(e => e === document.activeElement), true, 'Focus must return to trigger')
        await trigger.click()
        await page.locator('dialog a[download]').waitFor()
        await page.getByRole('button', { name: 'Close preview', exact: true }).click()
        assert.equal(downloads.length, 1, 'Closing a preview must not save')
        assert.deepEqual(errors, [])
        console.log(device, path, 'preview, explicit download, close and focus passed')
        await page.close()
      }
    }
  } finally { await browser?.close(); server.kill() }
})().catch(e => { console.error(e); process.exitCode = 1 })
