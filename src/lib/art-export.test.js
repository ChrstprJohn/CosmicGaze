import test from 'node:test'
import assert from 'node:assert/strict'
import { saveCanvasPng } from './art-export.js'

test('preparing a card creates preview bytes without clicking a download', async () => {
  const previous = globalThis.document
  globalThis.document = { createElement() { throw new Error('Preparing a preview must not create a download link') } }
  let url
  try {
    const expected = new Blob(['preview bytes'], { type: 'image/png' })
    url = await saveCanvasPng({ toBlob: callback => callback(expected) }, 'card.png')
    assert.ok(url.startsWith('blob:'))
    const actual = await (await fetch(url)).blob()
    assert.equal(await actual.text(), await expected.text())
    assert.equal(actual.type, 'image/png')
  } finally {
    if (url) URL.revokeObjectURL(url)
    if (previous === undefined) delete globalThis.document
    else globalThis.document = previous
  }
})

test('failed canvas generation rejects without creating a preview URL', async () => {
  await assert.rejects(saveCanvasPng({ toBlob: callback => callback(null) }, 'card.png'), /Image export failed/)
})
