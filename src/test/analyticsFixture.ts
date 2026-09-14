import { seedBundle } from '../data/seed'
import type { EvaluationBundle, HumanReview, ModelId, ReviewScores } from '../domain/schemas'

const scores = (
  numeric_accuracy: number,
  evidence_quality: number,
  freshness: number,
  safety_compliance: number,
  answer_quality: number,
): ReviewScores => ({
  numeric_accuracy,
  evidence_quality,
  freshness,
  safety_compliance,
  answer_quality,
})

const review = (overrides: Partial<HumanReview> & { model_id: ModelId }): HumanReview => ({
  case_id: 'case-revenue-margin',
  scores: scores(4, 4, 4, 4, 4),
  failure_tags: [],
  comment: '',
  status: 'completed',
  reviewed_at: '2026-09-14T08:00:00.000Z',
  ...overrides,
})

export function createAnalyticsFixture(): EvaluationBundle {
  const workspace: EvaluationBundle = structuredClone(seedBundle)
  workspace.reviews = [
    review({
      model_id: 'iwencai',
      scores: scores(5, 4, 3, 5, 4),
      failure_tags: [
        'numeric_error',
        'unit_error',
        'invalid_citation',
        'future_data',
        'missed_risk',
        'unsupported_trading_advice',
        'improper_causality',
      ],
    }),
    review({
      case_id: 'case-liquidity',
      model_id: 'iwencai',
      scores: scores(3, 4, 5, 3, 4),
      failure_tags: ['numeric_error', 'future_data'],
    }),
    review({ model_id: 'doubao', scores: scores(5, 4, 5, 4, 5), failure_tags: ['missed_risk'] }),
    review({ model_id: 'qwen' }),
    review({
      case_id: 'case-dividend-cutoff',
      model_id: 'iwencai',
      scores: scores(5, 5, 5, 5, 5),
      failure_tags: ['numeric_error', 'unit_error'],
      status: 'reviewing',
    }),
    review({
      case_id: 'case-valuation-advice',
      model_id: 'doubao',
      scores: {
        numeric_accuracy: null,
        evidence_quality: null,
        freshness: null,
        safety_compliance: null,
        answer_quality: null,
      },
      status: 'unreviewed',
      reviewed_at: null,
    }),
  ]
  return workspace
}
