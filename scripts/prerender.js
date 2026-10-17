import { readFile, writeFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'

// Compile the existing homepage without opening a server or starting a watcher.
const compiler = await createServer({
  server: { middlewareMode: true, watch: null, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
})
try {
  const { default: App } = await compiler.ssrLoadModule('/src/App.jsx')
  const markup = renderToString(createElement(App))
  const file = new URL('../dist/index.html', import.meta.url)
  const html = await readFile(file, 'utf8')
  const boot = /<div id="root">[\s\S]*?<\/div><\/div>(?=<noscript>)/
  if (!boot.test(html)) throw new Error('Homepage boot container was not found.')
  await writeFile(file, html.replace(boot, `<div id="root" data-prerendered>${markup}</div>`))
  console.log('Prerendered the homepage for immediate first paint.')
} finally {
  await compiler.close()
}
