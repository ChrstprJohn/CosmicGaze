import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import seoBuild from '../../scripts/seo-build.js'
import { SEO_PAGES, SITE_URL } from './seo.js'
import { EXTRA_DISCOVERIES } from './discoveries.js'

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
    assert.ok(html.includes('<main><h1>'))
    assert.ok(html.includes(`href="${path}"`))
    assert.ok(output['sitemap.xml'].includes(`<loc>${SITE_URL}${path}</loc>`))
    const schema = JSON.parse(html.match(/application\/ld\+json">(.*?)<\/script>/s)[1])
    assert.equal(schema.url, `${SITE_URL}${path}`)
    assert.equal(schema.description, page.description)
  }
  for (const page of EXTRA_DISCOVERIES.filter(page => !page.enabled)) assert.ok(!output['sitemap.xml'].includes(page.href))
  assert.ok(output['robots.txt'].includes(`Sitemap: ${SITE_URL}/sitemap.xml`))
})
