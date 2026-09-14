import { FAILURE_TAGS } from '../domain/constants'
import type {
  EvaluationBundle,
  FailureTag,
  ModelDefinition,
  ModelId,
  ReviewScores,
  ReviewStatus,
} from '../domain/schemas'

export const SCORE_DIMENSIONS = [
  'numeric_accuracy',
  'evidence_quality',
  'freshness',
  'safety_compliance',
  'answer_quality',
] as const satisfies readonly (keyof ReviewScores)[]

export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number]

export interface ModelAnalytics {
  model: ModelDefinition
  completedReviewCount: number
  overallScore: number | null
  dimensionAverages: Record<ScoreDimension, number | null>
  failureTagCounts: Record<FailureTag, number>
  rank: number | null
}

export interface CaseModelComparison {
  model: ModelDefinition
  status: ReviewStatus
  totalScore: number | null
}

export interface CaseComparison {
  caseId: string
  models: CaseModelComparison[]
}

export interface AnalyticsSnapshot {
  coverage: {
    totalSlots: number
    completedSlots: number
    rate: number
  }
  models: ModelAnalytics[]
  cases: CaseComparison[]
}

export function calculateTotalScore(scores: ReviewScores): number | null {
  const values = SCORE_DIMENSIONS.map((dimension) => scores[dimension])
  return values.some((score) => score === null)
    ? null
    : 4 * (values as number[]).reduce((sum, score) => sum + score, 0)
}

export function buildAnalyticsSnapshot(workspace: EvaluationBundle): AnalyticsSnapshot {
  const completedReviews = workspace.reviews.filter((review) => review.status === 'completed')

  const models = workspace.models.map<ModelAnalytics>((model) => {
    const reviews = completedReviews.filter((review) => review.model_id === model.model_id)
    const totals = reviews.map((review) => calculateTotalScore(review.scores)!)
    const failureTagCounts = Object.fromEntries(
      FAILURE_TAGS.map((tag) => [
        tag,
        reviews.filter((review) => review.failure_tags.includes(tag)).length,
      ]),
    ) as Record<FailureTag, number>

    return {
      model,
      completedReviewCount: reviews.length,
      overallScore: reviews.length === 0
        ? null
        : totals.reduce((sum, score) => sum + score, 0) / reviews.length,
      dimensionAverages: Object.fromEntries(
        SCORE_DIMENSIONS.map((dimension) => [
          dimension,
          reviews.length === 0
            ? null
            : reviews.reduce((sum, review) => sum + review.scores[dimension]!, 0) / reviews.length,
        ]),
      ) as Record<ScoreDimension, number | null>,
      failureTagCounts,
      rank: null,
    }
  })

  models.sort((left, right) => {
    if (left.overallScore === null && right.overallScore === null) {
      return compareModelIds(left.model.model_id, right.model.model_id)
    }
    if (left.overallScore === null) return 1
    if (right.overallScore === null) return -1
    return right.overallScore - left.overallScore
      || compareModelIds(left.model.model_id, right.model.model_id)
  })
  models.forEach((model, index) => {
    if (model.overallScore !== null) model.rank = index + 1
  })

  return {
    coverage: {
      totalSlots: workspace.cases.length * workspace.models.length,
      completedSlots: completedReviews.length,
      rate: workspace.cases.length * workspace.models.length === 0
        ? 0
        : completedReviews.length / (workspace.cases.length * workspace.models.length),
    },
    models,
    cases: workspace.cases.map((evaluationCase) => ({
      caseId: evaluationCase.case_id,
      models: workspace.models.map((model) => {
        const review = workspace.reviews.find(
          (item) => item.case_id === evaluationCase.case_id && item.model_id === model.model_id,
        )
        const status = review?.status ?? 'unreviewed'
        return {
          model,
          status,
          totalScore: status === 'completed' ? calculateTotalScore(review!.scores) : null,
        }
      }),
    })),
  }
}

function compareModelIds(left: ModelId, right: ModelId) {
  return left < right ? -1 : left > right ? 1 : 0
}
