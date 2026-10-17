const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const assert = require('node:assert/strict')
;(async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4189'], { windowsHide: true, stdio: 'ignore' })
  let browser
  try {
    await new Promise(r => setTimeout(r, 800))
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    const page = await browser.newPage({ viewport: { width: 390, height: 568 }, acceptDownloads: true })
    let fail = true, gate, release
    const downloads = []
    page.on('download', d => downloads.push(d))
    await page.route('https://**/*', async route => {
      const url = route.request().url()
      if (url.includes('apod-basic')) return route.fulfill({ json: { date: new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }), title: 'NASA original fixture', media_type: 'image', hdurl: 'https://assets.science.nasa.gov/fixture.webp' }, headers: { 'Access-Control-Allow-Origin': '*' } })
      if (url.includes('assets.science.nasa.gov')) {
        if (route.request().resourceType() === 'xhr') { if (fail) return route.abort(); if (gate) await gate }
        return route.fulfill({ path: 'public/previews/galaxy.webp', contentType: 'image/webp', headers: { 'Access-Control-Allow-Origin': '*' } })
      }
      return route.abort()
    })
    await page.goto('http://127.0.0.1:4189/birthday')
    const trigger = page.getByRole('button', { name: 'Preview download', exact: true })
    await trigger.click()
    await page.getByRole('alert').waitFor()
    assert.equal(downloads.length, 0)
    assert.equal(await page.locator('dialog a[download]').count(), 0)
    fail = false
    await page.getByRole('button', { name: 'Try again', exact: true }).click()
    const save = page.locator('dialog a[download]')
    await save.waitFor()
    for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); assert.ok(await page.evaluate(() => !!document.activeElement.closest('dialog'))) }
    const d = page.waitForEvent('download')
    await save.click()
    const download = await d
    await download.saveAs('output/download-previews/nasa-original.webp')
    assert.deepEqual(fs.readFileSync('output/download-previews/nasa-original.webp'), fs.readFileSync('public/previews/galaxy.webp'))
    await page.getByRole('button', { name: 'Close preview', exact: true }).click()
    gate = new Promise(r => { release = r })
    await trigger.click()
    await page.getByText('Preparing your preview…').waitFor()
    await page.keyboard.press('Escape')
    release()
    await page.waitForTimeout(500)
    assert.equal(await page.locator('dialog').count(), 0)
    assert.equal(await page.evaluate(() => document.body.style.overflow), '')
    assert.equal(downloads.length, 1)
    console.log('Failure/retry, exact original bytes, keyboard focus trap, small-phone controls, and pending-request cancellation passed')
  } finally { await browser?.close(); server.kill() }
})().catch(e => { console.error(e); process.exitCode = 1 })
