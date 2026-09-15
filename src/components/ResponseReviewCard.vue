<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  FAILURE_TAG_LABELS,
  FAILURE_TAGS,
  REVIEW_STATUS_LABELS,
  REVIEW_STATUSES,
  SCORE_DIMENSION_LABELS,
} from '../domain/constants'
import type {
  EvaluationCase,
  FailureTag,
  HumanReview,
  ModelDefinition,
  ModelResponse,
  ReviewScores,
  ReviewStatus,
} from '../domain/schemas'
import { createEmptyReviewScores, useEvaluationStore } from '../stores/evaluation'

const props = defineProps<{
  evaluationCase: EvaluationCase
  model: ModelDefinition
  response: ModelResponse
  review?: HumanReview
}>()

const store = useEvaluationStore()
const scores = reactive<ReviewScores>({ ...(props.review?.scores ?? createEmptyReviewScores()) })
const failureTags = ref<FailureTag[]>([...(props.review?.failure_tags ?? [])])
const comment = ref(props.review?.comment ?? '')
const status = ref<ReviewStatus>(props.review?.status ?? 'unreviewed')
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

const dimensions: { key: keyof ReviewScores; label: string }[] = [
  { key: 'numeric_accuracy', label: SCORE_DIMENSION_LABELS.numeric_accuracy },
  { key: 'evidence_quality', label: SCORE_DIMENSION_LABELS.evidence_quality },
  { key: 'freshness', label: SCORE_DIMENSION_LABELS.freshness },
  { key: 'safety_compliance', label: SCORE_DIMENSION_LABELS.safety_compliance },
  { key: 'answer_quality', label: SCORE_DIMENSION_LABELS.answer_quality },
]

function citationMatches(evidenceId: string) {
  return props.evaluationCase.allowed_evidence.some(
    (evidence) => evidence.evidence_id === evidenceId,
  )
}

function save() {
  const result = store.saveReview({
    case_id: props.response.case_id,
    model_id: props.response.model_id,
    scores: { ...scores },
    failure_tags: [...failureTags.value],
    comment: comment.value,
    status: status.value,
  })

  if (!result.success) {
    feedbackType.value = 'error'
    feedback.value = result.error
    return
  }

  Object.assign(scores, result.review.scores)
  feedbackType.value = 'success'
  feedback.value = '评审已保存。再次保存将更新同一条评审。'
}
</script>

<template>
  <el-card class="review-card" shadow="never">
    <template #header>
      <div class="review-card__title">
        <strong>{{ model.display_name }}</strong>
        <el-tag size="small" type="info">{{ model.model_id }}</el-tag>
      </div>
    </template>

    <section class="response-copy">
      <h2>模型回答</h2>
      <p>{{ response.answer }}</p>
      <p class="response-time">生成时间：{{ response.generated_at }}</p>
    </section>

    <section>
      <h2>引用</h2>
      <p v-if="response.citations.length === 0" class="muted">无引用</p>
      <ul v-else class="citations">
        <li v-for="citation in response.citations" :key="citation.evidence_id">
          <code>{{ citation.evidence_id }}</code>
          <span v-if="citation.label"> · {{ citation.label }}</span>
          <el-tag
            size="small"
            :type="citationMatches(citation.evidence_id) ? 'success' : 'danger'"
          >
            {{ citationMatches(citation.evidence_id) ? '匹配证据' : '未知引用' }}
          </el-tag>
        </li>
      </ul>
    </section>

    <el-divider />

    <section class="review-form">
      <h2>人工评审</h2>
      <div v-for="dimension in dimensions" :key="dimension.key" class="score-row">
        <span>{{ dimension.label }}</span>
        <div class="score-control">
          <el-button size="small" @click="scores[dimension.key] = null">—</el-button>
          <el-radio-group v-model="scores[dimension.key]" size="small">
            <el-radio-button v-for="score in 5" :key="score" :value="score">
              {{ score }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <label class="field-label">问题标签</label>
      <el-checkbox-group v-model="failureTags" class="failure-tags">
        <el-checkbox v-for="tag in FAILURE_TAGS" :key="tag" :value="tag">
          {{ FAILURE_TAG_LABELS[tag] }}
        </el-checkbox>
      </el-checkbox-group>

      <label class="field-label" :for="`comment-${response.case_id}-${model.model_id}`">评论</label>
      <el-input
        :id="`comment-${response.case_id}-${model.model_id}`"
        v-model="comment"
        type="textarea"
        :rows="3"
        placeholder="记录人工判断依据"
      />

      <label class="field-label">评审状态</label>
      <el-select v-model="status" class="status-select">
        <el-option
          v-for="reviewStatus in REVIEW_STATUSES"
          :key="reviewStatus"
          :label="REVIEW_STATUS_LABELS[reviewStatus]"
          :value="reviewStatus"
        />
      </el-select>

      <el-alert
        v-if="feedback"
        :title="feedback"
        :type="feedbackType"
        :closable="false"
        show-icon
      />

      <el-button type="primary" @click="save">保存评审</el-button>
    </section>
  </el-card>
</template>

<style scoped>
.review-card {
  min-width: 0;
}

.review-card :deep(.el-card__header) {
  padding: 0.75rem 1rem;
}

.review-card :deep(.el-card__body) {
  padding: 1rem;
}

.review-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h2 {
  margin: 0 0 0.55rem;
  color: #526071;
  font-size: 0.85rem;
}

.response-copy {
  min-height: 10rem;
}

.response-copy p {
  line-height: 1.55;
}

.response-time,
.muted {
  color: #7a8594;
  font-size: 0.8rem;
}

.citations {
  display: grid;
  gap: 0.35rem;
  min-height: 4rem;
  margin: 0;
  padding-left: 1.1rem;
}

.citations .el-tag {
  margin-left: 0.4rem;
}

.review-form {
  display: grid;
  gap: 0.6rem;
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.score-row > span,
.field-label {
  color: #3f4b5c;
  font-size: 0.85rem;
  font-weight: 600;
}

.score-control {
  display: flex;
}

.failure-tags {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.failure-tags .el-checkbox {
  height: auto;
  line-height: 1.35;
  margin-right: 0;
}

.status-select {
  width: 100%;
}
</style>
