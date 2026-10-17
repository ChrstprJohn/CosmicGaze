import test from 'node:test'
import assert from 'node:assert/strict'
import { planetLayout } from './planet-layout.js'

test('planet placeholders fit short mobile stages and use the same camera projection', () => {
  for (const [width, height] of [[327, 173], [342, 220], [640, 530], [200, 120]]) {
    for (const rings of [false, true]) for (const decorative of [false, true]) {
      const { distance, diameter } = planetLayout(width, height, rings, decorative)
      assert.ok(diameter > 0 && diameter <= Math.min(width, height))
      const projectedRadius = 1 / Math.sqrt(distance ** 2 - 1)
      assert.ok(Math.abs(diameter - projectedRadius * height / Math.tan(Math.PI / 10)) < 0.001)
      if (rings) assert.ok(diameter * 2.32 <= Math.min(width, height))
    }
  }
})
