import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SEO_PAGES } from './seo.js'

test('HTML opts out of CDN script injection without changing immutable asset caching', () => {
  const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'))
  const cache = rule => rule.headers.find(header => header.key.toLowerCase() === 'cache-control')?.value
  const html = config.headers.filter(rule => cache(rule)?.includes('no-transform'))
  assert.ok(html.some(rule => rule.source === '/'))
  const clean = html.find(rule => rule.source.startsWith('/:page(') && !rule.source.endsWith('.html'))
  const files = html.find(rule => rule.source.endsWith('.html'))
  const choices = rule => rule.source.match(/\(([^)]+)\)/)[1].split('|')
  for (const path of Object.keys(SEO_PAGES).filter(path => path !== '/')) {
    assert.ok(choices(clean).includes(path.slice(1)), `${path} needs the HTML delivery policy`)
    assert.ok(choices(files).includes(path.slice(1)), `${path}.html needs the HTML delivery policy`)
  }
  assert.ok(choices(files).includes('index'))
  for (const rule of html) {
    assert.ok(cache(rule).includes('max-age=0'))
    assert.ok(cache(rule).includes('must-revalidate'))
    assert.ok(!rule.source.includes('api'))
  }
  const assets = config.headers.find(rule => rule.source === '/assets/(.*)')
  assert.ok(cache(assets).includes('max-age=31536000'))
  assert.ok(cache(assets).includes('immutable'))
})
