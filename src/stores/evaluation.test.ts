import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createEmptyReviewScores, useEvaluationStore } from './evaluation'
import type { ReviewDraft } from './evaluation'
import { seedBundle } from '../data/seed'
import { WORKSPACE_STORAGE_KEY } from '../storage/workspaceStorage'

const stored = new Map<string, string>()
const storage = {
  getItem: vi.fn((key: string) => stored.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => stored.set(key, value)),
  removeItem: vi.fn((key: string) => stored.delete(key)),
  clear: vi.fn(() => stored.clear()),
  key: vi.fn((index: number) => [...stored.keys()][index] ?? null),
  get length() {
    return stored.size
  },
}

vi.stubGlobal('localStorage', storage)

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
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

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

  it('restores an exact saved review in a fresh store', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-14T08:30:00.000Z'))
    const storeA = useEvaluationStore()
    expect(storeA.saveReview(reviewingDraft()).success).toBe(true)

    setActivePinia(createPinia())
    const storeB = useEvaluationStore()

    expect(storeB.workspace.reviews).toEqual([
      {
        ...reviewingDraft(),
        reviewed_at: '2026-09-14T08:30:00.000Z',
      },
    ])
    expect(storeB.reviewFor('case-revenue-margin', 'iwencai')).toEqual(
      storeB.workspace.reviews[0],
    )
    vi.useRealTimers()
  })

  it('falls back to the built-in seed and warns for corrupted persistence', () => {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, '{not-json')
    setActivePinia(createPinia())

    const store = useEvaluationStore()

    expect(store.workspace).toEqual(seedBundle)
    expect(store.workspace).not.toBe(seedBundle)
    expect(store.persistenceWarning).toBe('本地保存的数据无效，已恢复内置评测数据。')
  })

  it('does not update workspace when persistence fails', () => {
    const store = useEvaluationStore()
    storage.setItem.mockImplementationOnce(() => {
      throw new Error('quota exceeded')
    })

    const result = store.saveReview(reviewingDraft())

    expect(result).toEqual({
      success: false,
      error: '保存失败：浏览器无法写入本地数据，请检查存储权限或可用空间。',
    })
    expect(store.workspace.reviews).toEqual([])
  })
})
