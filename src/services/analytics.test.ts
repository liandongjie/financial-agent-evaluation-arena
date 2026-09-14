import { describe, expect, it } from 'vitest'
import { FAILURE_TAGS } from '../domain/constants'
import { createAnalyticsFixture } from '../test/analyticsFixture'
import { buildAnalyticsSnapshot, calculateTotalScore } from './analytics'

describe('analytics', () => {
  it('calculates a completed review total with equal weights', () => {
    expect(calculateTotalScore({
      numeric_accuracy: 5,
      evidence_quality: 4,
      freshness: 3,
      safety_compliance: 5,
      answer_quality: 4,
    })).toBe(84)
  })

  it('uses only completed reviews for model analytics', () => {
    const analytics = buildAnalyticsSnapshot(createAnalyticsFixture())
    const iwencai = analytics.models.find((item) => item.model.model_id === 'iwencai')!

    expect(iwencai.completedReviewCount).toBe(2)
    expect(iwencai.overallScore).toBe(80)
    expect(iwencai.dimensionAverages).toEqual({
      numeric_accuracy: 4,
      evidence_quality: 4,
      freshness: 4,
      safety_compliance: 4,
      answer_quality: 4,
    })
    expect(iwencai.failureTagCounts.numeric_error).toBe(2)
    expect(iwencai.failureTagCounts.unit_error).toBe(1)
  })

  it('ranks raw scores deterministically and places N/A models last', () => {
    const analytics = buildAnalyticsSnapshot(createAnalyticsFixture())

    expect(analytics.models.map((item) => ({
      id: item.model.model_id,
      score: item.overallScore,
      rank: item.rank,
    }))).toEqual([
      { id: 'doubao', score: 92, rank: 1 },
      { id: 'iwencai', score: 80, rank: 2 },
      { id: 'qwen', score: 80, rank: 3 },
      { id: 'yuanbao', score: null, rank: null },
    ])
    expect(analytics.models[3].dimensionAverages).toEqual({
      numeric_accuracy: null,
      evidence_quality: null,
      freshness: null,
      safety_compliance: null,
      answer_quality: null,
    })
  })

  it('counts all seven failure tags from completed reviews only', () => {
    const analytics = buildAnalyticsSnapshot(createAnalyticsFixture())
    const iwencai = analytics.models.find((item) => item.model.model_id === 'iwencai')!

    expect(FAILURE_TAGS.map((tag) => [tag, iwencai.failureTagCounts[tag]])).toEqual([
      ['numeric_error', 2],
      ['unit_error', 1],
      ['invalid_citation', 1],
      ['future_data', 2],
      ['missed_risk', 1],
      ['unsupported_trading_advice', 1],
      ['improper_causality', 1],
    ])
  })

  it('builds coverage and case comparisons without partial totals', () => {
    const analytics = buildAnalyticsSnapshot(createAnalyticsFixture())
    const byCaseAndModel = new Map(
      analytics.cases.flatMap((item) => item.models.map((model) => [
        `${item.caseId}/${model.model.model_id}`,
        model,
      ] as const)),
    )

    expect(analytics.coverage).toEqual({ totalSlots: 20, completedSlots: 4, rate: 0.2 })
    expect(byCaseAndModel.get('case-revenue-margin/iwencai')).toMatchObject({
      status: 'completed',
      totalScore: 84,
    })
    expect(byCaseAndModel.get('case-dividend-cutoff/iwencai')).toMatchObject({
      status: 'reviewing',
      totalScore: null,
    })
    expect(byCaseAndModel.get('case-valuation-advice/doubao')).toMatchObject({
      status: 'unreviewed',
      totalScore: null,
    })
    expect(byCaseAndModel.get('case-revenue-margin/yuanbao')).toMatchObject({
      status: 'unreviewed',
      totalScore: null,
    })
  })
})
