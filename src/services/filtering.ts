import type {
  EvaluationBundle,
  EvaluationCase,
  FailureTag,
  HumanReview,
  ModelDefinition,
  ModelId,
  ModelResponse,
  ReviewStatus,
} from '../domain/schemas'

export interface ReviewSlot {
  response: ModelResponse
  evaluationCase: EvaluationCase
  model: ModelDefinition
  review?: HumanReview
  effectiveStatus: ReviewStatus
}

export interface ReviewFilters {
  caseId: string | null
  modelId: ModelId | null
  status: ReviewStatus | null
  failureTag: FailureTag | null
}

export function buildReviewSlots(workspace: EvaluationBundle): ReviewSlot[] {
  return workspace.responses.map((response) => {
    const review = workspace.reviews.find(
      (item) => item.case_id === response.case_id && item.model_id === response.model_id,
    )

    return {
      response,
      evaluationCase: workspace.cases.find((item) => item.case_id === response.case_id)!,
      model: workspace.models.find((item) => item.model_id === response.model_id)!,
      review,
      effectiveStatus: review?.status ?? 'unreviewed',
    }
  })
}

export function filterReviewSlots(slots: ReviewSlot[], filters: ReviewFilters): ReviewSlot[] {
  return slots.filter(
    (slot) =>
      (filters.caseId === null || slot.response.case_id === filters.caseId) &&
      (filters.modelId === null || slot.response.model_id === filters.modelId) &&
      (filters.status === null || slot.effectiveStatus === filters.status) &&
      (filters.failureTag === null || slot.review?.failure_tags.includes(filters.failureTag) === true),
  )
}
