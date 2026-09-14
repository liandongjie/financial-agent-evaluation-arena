import { describe, expect, it } from 'vitest'
import { seedBundle } from '../data/seed'
import type { EvaluationBundle, HumanReview } from '../domain/schemas'
import { exportBundleJson, parseEvaluationBundleJson } from './bundleIo'

const completedReview = (): HumanReview => ({
  case_id: 'case-revenue-margin',
  model_id: 'iwencai',
  scores: {
    numeric_accuracy: 5,
    evidence_quality: 4,
    freshness: 3,
    safety_compliance: 5,
    answer_quality: 4,
  },
  failure_tags: ['missed_risk'],
  comment: '已复核。',
  status: 'completed',
  reviewed_at: '2026-09-14T08:00:00.000Z',
})

describe('bundle JSON import and export', () => {
  it('exports the complete bundle with an injected timestamp without mutation', () => {
    const workspace: EvaluationBundle = structuredClone(seedBundle)
    workspace.reviews.push(completedReview())
    const before = structuredClone(workspace)

    const exported = JSON.parse(exportBundleJson(workspace, '2026-09-14T12:00:00.000Z'))

    expect(exported.meta.exported_at).toBe('2026-09-14T12:00:00.000Z')
    expect(exported).toMatchObject({
      models: workspace.models,
      cases: workspace.cases,
      responses: workspace.responses,
      reviews: workspace.reviews,
    })
    expect(workspace).toEqual(before)
  })

  it('round-trips an exported canonical bundle', () => {
    const workspace: EvaluationBundle = structuredClone(seedBundle)
    workspace.reviews.push(completedReview())

    const parsed = parseEvaluationBundleJson(
      exportBundleJson(workspace, '2026-09-14T12:00:00.000Z'),
    )

    expect(parsed.success).toBe(true)
    if (!parsed.success) return
    expect(parsed.bundle).toEqual({
      ...workspace,
      meta: { ...workspace.meta, exported_at: '2026-09-14T12:00:00.000Z' },
    })
  })

  it('rejects malformed JSON without touching caller state', () => {
    const workspace = structuredClone(seedBundle)
    const persisted = JSON.stringify(workspace)

    expect(parseEvaluationBundleJson('{not-json')).toEqual({
      success: false,
      error: 'JSON 格式错误：无法解析文件内容。',
    })
    expect(workspace).toEqual(seedBundle)
    expect(persisted).toBe(JSON.stringify(seedBundle))
  })

  it.each([
    ['unsupported schema version', (bundle: any) => { bundle.meta.schema_version = '2.0' }],
    ['duplicate model identity', (bundle: any) => { bundle.models.push(bundle.models[0]) }],
    ['duplicate case identity', (bundle: any) => { bundle.cases.push(bundle.cases[0]) }],
    ['duplicate evidence identity', (bundle: any) => { bundle.cases[0].allowed_evidence.push(bundle.cases[0].allowed_evidence[0]) }],
    ['duplicate response identity', (bundle: any) => { bundle.responses.push(bundle.responses[0]) }],
    ['duplicate review identity', (bundle: any) => { const review = completedReview(); bundle.reviews.push(review, review) }],
    ['unknown response case', (bundle: any) => { bundle.responses[0].case_id = 'unknown-case' }],
    ['invalid score', (bundle: any) => { const review = completedReview(); review.scores.numeric_accuracy = 6; bundle.reviews.push(review) }],
    ['invalid status', (bundle: any) => { const review: any = completedReview(); review.status = 'invalid'; bundle.reviews.push(review) }],
    ['unknown failure tag', (bundle: any) => { const review: any = completedReview(); review.failure_tags = ['unknown']; bundle.reviews.push(review) }],
    ['completed missing score', (bundle: any) => { const review = completedReview(); review.scores.freshness = null; bundle.reviews.push(review) }],
  ])('rejects structurally invalid data: %s', (_name, mutate) => {
    const bundle = structuredClone(seedBundle)
    mutate(bundle)

    const result = parseEvaluationBundleJson(JSON.stringify(bundle))

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toMatch(/^评测数据结构无效：/)
  })

  it('allows an intentionally unknown response citation', () => {
    const bundle = structuredClone(seedBundle)
    bundle.responses[0].citations = [{ evidence_id: 'missing-evidence' }]

    const result = parseEvaluationBundleJson(JSON.stringify(bundle))

    expect(result.success).toBe(true)
  })
})
