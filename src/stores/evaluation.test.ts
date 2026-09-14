import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createEmptyReviewScores, useEvaluationStore } from './evaluation'
import type { ReviewDraft } from './evaluation'

const reviewingDraft = (): ReviewDraft => ({
  case_id: 'case-revenue-margin',
  model_id: 'iwencai',
  scores: {
    ...createEmptyReviewScores(),
    numeric_accuracy: 4,
    evidence_quality: 3,
  },
  failure_tags: ['missed_risk'],
  comment: '遗漏客户集中度风险。',
  status: 'reviewing',
})

describe('evaluation store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('creates a partial reviewing review', () => {
    const store = useEvaluationStore()

    expect(store.saveReview(reviewingDraft()).success).toBe(true)
    expect(store.workspace.reviews).toHaveLength(1)
    expect(store.workspace.reviews[0]).toMatchObject({
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
    })
    expect(store.workspace.reviews[0].reviewed_at).not.toBeNull()
  })

  it('replaces an existing review with the same case and model identity', () => {
    const store = useEvaluationStore()
    store.saveReview(reviewingDraft())

    const result = store.saveReview({
      ...reviewingDraft(),
      scores: {
        numeric_accuracy: 5,
        evidence_quality: 4,
        freshness: 5,
        safety_compliance: 4,
        answer_quality: 5,
      },
      failure_tags: [],
      comment: '复核后更新。',
      status: 'completed',
    })

    expect(result.success).toBe(true)
    expect(store.workspace.reviews).toHaveLength(1)
    expect(store.workspace.reviews[0]).toMatchObject({
      scores: {
        numeric_accuracy: 5,
        evidence_quality: 4,
        freshness: 5,
        safety_compliance: 4,
        answer_quality: 5,
      },
      failure_tags: [],
      comment: '复核后更新。',
      status: 'completed',
    })
  })

  it('rejects an incomplete completed review without changing existing data', () => {
    const store = useEvaluationStore()
    store.saveReview(reviewingDraft())
    const before = JSON.stringify(store.workspace.reviews)

    const result = store.saveReview({ ...reviewingDraft(), status: 'completed' })

    expect(result.success).toBe(false)
    expect(JSON.stringify(store.workspace.reviews)).toBe(before)
  })

  it('toggles visibility without deleting data and keeps one model visible', () => {
    const store = useEvaluationStore()
    store.saveReview(reviewingDraft())
    const sourceCounts = {
      models: store.workspace.models.length,
      responses: store.workspace.responses.length,
      reviews: store.workspace.reviews.length,
    }

    expect(store.toggleModelVisibility('iwencai')).toBe(true)
    expect(store.visibleModelIds).toEqual(['doubao', 'qwen', 'yuanbao'])
    expect(store.toggleModelVisibility('iwencai')).toBe(true)
    expect(store.visibleModelIds).toEqual(['doubao', 'qwen', 'yuanbao', 'iwencai'])

    store.toggleModelVisibility('doubao')
    store.toggleModelVisibility('qwen')
    store.toggleModelVisibility('yuanbao')
    expect(store.visibleModelIds).toEqual(['iwencai'])
    expect(store.toggleModelVisibility('iwencai')).toBe(false)
    expect(store.visibleModelIds).toEqual(['iwencai'])
    expect({
      models: store.workspace.models.length,
      responses: store.workspace.responses.length,
      reviews: store.workspace.reviews.length,
    }).toEqual(sourceCounts)
  })
})
