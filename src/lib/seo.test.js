import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import seoBuild from '../../scripts/seo-build.js'
import { SEO_PAGES, SITE_URL } from './seo.js'
import { EXTRA_DISCOVERIES } from './discoveries.js'

test('build inlines the entry stylesheet while preserving unknown external styles', () => {
  const output = {}
  const bundle = {
    'index.html': { source: '<head><link rel="stylesheet" crossorigin href="/assets/main.css"><link rel="stylesheet" href="https://example.com/theme.css"></head><div id="root"></div>' },
    'assets/main.css': { type: 'asset', fileName: 'assets/main.css', source: 'body{color:white}' },
    'assets/tool.css': { type: 'asset', fileName: 'assets/tool.css', source: '.moon-stage{display:grid}' },
  }
  seoBuild().generateBundle.call({ emitFile: asset => { output[asset.fileName] = asset.source } }, {}, bundle)
  assert.ok(bundle['index.html'].source.includes('<style>body{color:white}</style>'))
  assert.ok(!bundle['index.html'].source.includes('href="/assets/main.css"'))
  assert.ok(bundle['index.html'].source.includes('href="https://example.com/theme.css"'))
  assert.ok(!bundle['index.html'].source.includes('.moon-stage{display:grid}'))
  for (const [name, html] of Object.entries(output).filter(([name]) => name.endsWith('.html'))) {
    assert.ok(html.includes('<style>.moon-stage{display:grid}</style>'), `${name} needs styles before JavaScript`)
    assert.equal(html.split('body{color:white}').length - 1, 1)
  }
})

test('build emits distinct route metadata, discoverable links and matching sitemap', () => {
  const bundle = { 'index.html': { source: readFileSync(new URL('../../index.html', import.meta.url), 'utf8') } }
  const output = {}
  seoBuild().generateBundle.call({ emitFile: asset => { output[asset.fileName] = asset.source } }, {}, bundle)
  output['index.html'] = bundle['index.html'].source
  const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'))
  const routedPages = config.rewrites[0].source.match(/\((.*)\)/)[1].split('|')
  assert.deepEqual(routedPages.sort(), Object.keys(SEO_PAGES).filter(path => path !== '/').map(path => path.slice(1)).sort())
  for (const [path, page] of Object.entries(SEO_PAGES)) {
    const html = output[path === '/' ? 'index.html' : `${path.slice(1)}.html`]
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1)
    assert.ok(html.includes(`href="${SITE_URL}${path}"`))
    assert.ok(html.includes(`<title>${page.title.replaceAll('&', '&amp;')}</title>`))
    assert.ok(html.includes('<noscript><main><h1>'))
    const root = html.split('<div id="root">')[1].split('<noscript>')[0]
    assert.ok(root.includes('role="status"'))
    assert.ok(!root.includes('<nav'))
    assert.ok(html.includes(`href="${path}"`))
    assert.ok(output['sitemap.xml'].includes(`<loc>${SITE_URL}${path}</loc>`))
    const schema = JSON.parse(html.match(/application\/ld\+json">(.*?)<\/script>/s)[1])
    assert.equal(schema.url, `${SITE_URL}${path}`)
    assert.equal(schema.description, page.description)
  }
  for (const page of EXTRA_DISCOVERIES.filter(page => !page.enabled)) assert.ok(!output['sitemap.xml'].includes(page.href))
  assert.ok(output['robots.txt'].includes(`Sitemap: ${SITE_URL}/sitemap.xml`))
})
