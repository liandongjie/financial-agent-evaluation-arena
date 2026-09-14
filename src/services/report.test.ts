import { describe, expect, it } from 'vitest'
import { createAnalyticsFixture } from '../test/analyticsFixture'
import { generateMarkdownReport } from './report'

describe('Markdown report', () => {
  it('renders the shared analytics values with an injected timestamp', () => {
    const report = generateMarkdownReport(
      createAnalyticsFixture(),
      '2026-09-14T12:00:00.000Z',
    )

    expect(report).toContain('Generation timestamp: 2026-09-14T12:00:00.000Z')
    expect(report).toContain('Schema version: 1.0')
    expect(report).toContain('Input source: Financial Agent Evaluation Arena Seed')
    expect(report).toContain('Completed-review coverage: 4 / 20 (20.00%)')
    expect(report).toContain('| 1 | 豆包 | doubao | 1 | 92.00 |')
    expect(report).toContain('| 2 | 同花顺问财 | iwencai | 2 | 80.00 |')
    expect(report).toContain('| iwencai | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 |')
    expect(report).toContain('| iwencai | 2 | 1 | 1 | 2 | 1 | 1 | 1 |')
    expect(report).toContain('| case-revenue-margin | iwencai | completed | 84.00 |')
    expect(report).toContain('| case-dividend-cutoff | iwencai | reviewing | N/A |')
    expect(report).toContain('Only completed reviews contribute to ranking and analytics.')
  })
})
