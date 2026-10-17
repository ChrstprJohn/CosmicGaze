import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatStat } from './stat-format.js'

test('stat counts use compact lower bounds without rounding up milestones', () => {
  for (const [value, expected] of [[null, '—'], [0, '0'], [8, '8'], [999, '999'], [1000, '1K+'], [2499, '2.4K+'], [2500, '2.5K+'], [2599, '2.5K+'], [999999, '999.9K+'], [1000000, '1M+']]) {
    assert.equal(formatStat(value), expected)
  }
})
