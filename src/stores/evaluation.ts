import { computed, ref, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { seedBundle } from '../data/seed'
import { HumanReviewSchema } from '../domain/schemas'
import type {
  EvaluationBundle,
  HumanReview,
  ModelId,
  ReviewScores,
} from '../domain/schemas'
import { loadWorkspace, saveWorkspace } from '../storage/workspaceStorage'

export type ReviewDraft = Omit<HumanReview, 'reviewed_at'>

export const createEmptyReviewScores = (): ReviewScores => ({
  numeric_accuracy: null,
  evidence_quality: null,
  freshness: null,
  safety_compliance: null,
  answer_quality: null,
})

export const useEvaluationStore = defineStore('evaluation', () => {
  const loaded = loadWorkspace(seedBundle)
  const workspace = ref<EvaluationBundle>(loaded.workspace)
  const persistenceWarning = ref(loaded.warning)
  const currentCaseId = ref(workspace.value.cases[0].case_id)
  const visibleModelIds = ref<ModelId[]>(workspace.value.models.map((model) => model.model_id))

  const currentCase = computed(() =>
    workspace.value.cases.find((evaluationCase) => evaluationCase.case_id === currentCaseId.value),
  )

  const currentResponses = computed(() =>
    workspace.value.responses.filter((response) => response.case_id === currentCaseId.value),
  )

  const visibleComparisons = computed(() =>
    currentResponses.value
      .filter((response) => visibleModelIds.value.includes(response.model_id))
      .map((response) => ({
        response,
        model: workspace.value.models.find((model) => model.model_id === response.model_id)!,
      })),
  )

  function setCurrentCase(caseId: string) {
    if (workspace.value.cases.some((evaluationCase) => evaluationCase.case_id === caseId)) {
      currentCaseId.value = caseId
    }
  }

  function toggleModelVisibility(modelId: ModelId) {
    const index = visibleModelIds.value.indexOf(modelId)
    if (index >= 0) {
      if (visibleModelIds.value.length === 1) return false
      visibleModelIds.value.splice(index, 1)
      return true
    }

    visibleModelIds.value.push(modelId)
    return true
  }

  function reviewFor(caseId: string, modelId: ModelId) {
    return workspace.value.reviews.find(
      (review) => review.case_id === caseId && review.model_id === modelId,
    )
  }

  function saveReview(draft: ReviewDraft) {
    const candidate = {
      ...draft,
      scores: draft.status === 'unreviewed' ? createEmptyReviewScores() : draft.scores,
      reviewed_at: draft.status === 'unreviewed' ? null : new Date().toISOString(),
    }
    const result = HumanReviewSchema.safeParse(candidate)

    if (!result.success) {
      return {
        success: false as const,
        error: '保存失败：已完成的评审必须填写全部五项评分，请检查当前内容。',
      }
    }

    const nextWorkspace = structuredClone(toRaw(workspace.value))
    const index = nextWorkspace.reviews.findIndex(
      (review) => review.case_id === result.data.case_id && review.model_id === result.data.model_id,
    )
    if (index >= 0) nextWorkspace.reviews.splice(index, 1, result.data)
    else nextWorkspace.reviews.push(result.data)

    try {
      saveWorkspace(nextWorkspace)
    } catch {
      return {
        success: false as const,
        error: '保存失败：浏览器无法写入本地数据，请检查存储权限或可用空间。',
      }
    }

    workspace.value = nextWorkspace

    return { success: true as const, review: result.data }
  }

  return {
    workspace,
    persistenceWarning,
    currentCaseId,
    visibleModelIds,
    currentCase,
    currentResponses,
    visibleComparisons,
    setCurrentCase,
    toggleModelVisibility,
    reviewFor,
    saveReview,
  }
})
