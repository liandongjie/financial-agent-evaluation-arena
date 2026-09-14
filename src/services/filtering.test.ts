import { describe, expect, it } from 'vitest'
import { seedBundle } from '../data/seed'
import type { EvaluationBundle, HumanReview } from '../domain/schemas'
import { buildReviewSlots, filterReviewSlots } from './filtering'

const review = (overrides: Partial<HumanReview> = {}): HumanReview => ({
  case_id: 'case-revenue-margin',
  model_id: 'iwencai',
  scores: {
    numeric_accuracy: 4,
    evidence_quality: 3,
    freshness: null,
    safety_compliance: null,
    answer_quality: null,
  },
  failure_tags: ['missed_risk'],
  comment: '遗漏客户集中度风险。',
  status: 'reviewing',
  reviewed_at: '2026-09-14T08:30:00.000Z',
  ...overrides,
})

describe('review slot filtering', () => {
  it('uses effective unreviewed status for absent reviews', () => {
    const workspace = structuredClone(seedBundle)

    expect(
      filterReviewSlots(buildReviewSlots(workspace), {
        caseId: null,
        modelId: null,
        status: 'unreviewed',
        failureTag: null,
      }),
    ).toHaveLength(20)

    workspace.reviews.push(review())
    const slots = buildReviewSlots(workspace)
    expect(
      filterReviewSlots(slots, {
        caseId: null,
        modelId: null,
        status: 'unreviewed',
        failureTag: null,
      }),
    ).toHaveLength(19)
    expect(
      filterReviewSlots(slots, {
        caseId: null,
        modelId: null,
        status: 'reviewing',
        failureTag: null,
      }),
    ).toHaveLength(1)
  })

  it('combines filters with AND semantics without mutating the workspace', () => {
    const workspace: EvaluationBundle = structuredClone(seedBundle)
    workspace.reviews.push(
      review(),
      review({ model_id: 'doubao', failure_tags: ['numeric_error'] }),
      review({ case_id: 'case-valuation-advice', failure_tags: ['missed_risk'] }),
    )
    const before = structuredClone(workspace)

    const result = filterReviewSlots(buildReviewSlots(workspace), {
      caseId: 'case-revenue-margin',
      modelId: 'iwencai',
      status: 'reviewing',
      failureTag: 'missed_risk',
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      response: { case_id: 'case-revenue-margin', model_id: 'iwencai' },
      effectiveStatus: 'reviewing',
      review: { failure_tags: ['missed_risk'] },
    })
    expect(workspace.models).toEqual(before.models)
    expect(workspace.cases).toEqual(before.cases)
    expect(workspace.responses).toEqual(before.responses)
    expect(workspace.reviews).toEqual(before.reviews)
  })
})
