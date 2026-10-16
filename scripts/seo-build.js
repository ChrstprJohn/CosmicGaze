import { SEO_PAGES, SITE_URL, pageSchema } from '../src/lib/seo.js'

const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

// Generate route HTML from the finished Vite template so asset hashes stay correct.
export default function seoBuild() {
  return {
    name: 'cosmicgaze-seo',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const template = bundle['index.html'].source
      const links = Object.entries(SEO_PAGES).map(([path, page]) => `<li><a href="${path}">${escapeHtml(page.title.replace(' — Cosmicgaze', ''))}</a></li>`).join('')
      for (const [path, page] of Object.entries(SEO_PAGES)) {
        const url = `${SITE_URL}${path}`
        const title = escapeHtml(page.title)
        const description = escapeHtml(page.description)
        const metadata = `<link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cosmicgaze" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE_URL}/previews/cosmicgaze-showcase.webp" />
    <meta property="og:image:alt" content="Cosmicgaze astronomy tools and space experiences" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${SITE_URL}/previews/cosmicgaze-showcase.webp" />
    <script type="application/ld+json">${JSON.stringify(pageSchema(path)).replaceAll('<', '\\u003c')}</script>`
        const html = template.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
          .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
          .replace('</head>', `${metadata}\n  </head>`)
          .replace('<div id="root"></div>', `<div id="root"><main><h1>${title}</h1><p>${description}</p><nav aria-label="Explore Cosmicgaze"><ul>${links}</ul></nav><p>Enable JavaScript to use the interactive astronomy tools.</p></main></div>`)
        if (path === '/') bundle['index.html'].source = html
        else this.emitFile({ type: 'asset', fileName: `${path.slice(1)}.html`, source: html })
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(SEO_PAGES).map(path => `  <url><loc>${SITE_URL}${path}</loc></url>`).join('\n')}\n</urlset>\n` })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n` })
    },
  }
}
