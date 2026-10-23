import { readFile, writeFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToReadableStream } from 'react-dom/server'
import { createServer } from 'vite'
import { SEO_PAGES } from '../src/lib/seo.js'

// Compile every enabled page without opening a server or starting a watcher.
const compiler = await createServer({
  server: { middlewareMode: true, watch: null, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
})
try {
  const { default: App } = await compiler.ssrLoadModule('/src/App.jsx')
  for (const path of Object.keys(SEO_PAGES)) {
    let renderError
    const stream = await renderToReadableStream(createElement(App, { initialPath: path }), {
      onError(error) { renderError = error },
    })
    await stream.allReady
    if (renderError) throw renderError
    const markup = await new Response(stream).text()
    if (!/<h1\b/.test(markup)) throw new Error(`Missing page content for ${path}`)
    const file = new URL(`../dist/${path === '/' ? 'index' : path.slice(1)}.html`, import.meta.url)
    const html = await readFile(file, 'utf8')
    const boot = /<div id="root">[\s\S]*?<\/div><\/div>(?=<noscript>)/
    if (!boot.test(html)) throw new Error(`Boot container was not found for ${path}`)
    // Tool pages remount so date, query and motion preferences use the visitor's state.
    const attributes = path === '/' ? ' data-prerendered' : ''
    await writeFile(file, html.replace(boot, () => `<div id="root"${attributes}>${markup}</div>`))
    console.log(`Prerendered ${path}`)
  }
} finally {
  await compiler.close()
}
