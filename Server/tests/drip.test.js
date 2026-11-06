import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('Weekly Drip Engine Math', () => {
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

  it('correctly increments week every 7 days', () => {
    const start = new Date('2026-01-01T00:00:00.000Z').getTime()

    // Day 0
    let now = start
    let week = Math.floor((now - start) / MS_PER_WEEK) + 1
    assert.strictEqual(week, 1)

    // Day 6
    now = start + 6 * 24 * 60 * 60 * 1000
    week = Math.floor((now - start) / MS_PER_WEEK) + 1
    assert.strictEqual(week, 1)

    // Day 7 (Week 2 starts)
    now = start + 7 * 24 * 60 * 60 * 1000
    week = Math.floor((now - start) / MS_PER_WEEK) + 1
    assert.strictEqual(week, 2)

    // Day 14 (Week 3 starts)
    now = start + 14 * 24 * 60 * 60 * 1000
    week = Math.floor((now - start) / MS_PER_WEEK) + 1
    assert.strictEqual(week, 3)
  })

  it('admin extraMs delay extends the current week', () => {
    const start = new Date('2026-01-01T00:00:00.000Z').getTime()
    const now = start + 8 * 24 * 60 * 60 * 1000 // Normally week 2
    const extraMs = 3 * 24 * 60 * 60 * 1000 // 3 extra days given

    const week = Math.floor((now - start - extraMs) / MS_PER_WEEK) + 1
    assert.strictEqual(week, 1) // Remains in week 1
  })
})

