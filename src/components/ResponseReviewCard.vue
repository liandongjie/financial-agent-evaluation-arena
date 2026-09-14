<script setup lang="ts">
import { reactive, ref } from 'vue'
import { FAILURE_TAGS, REVIEW_STATUSES } from '../domain/constants'
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
  { key: 'numeric_accuracy', label: '数字正确性' },
  { key: 'evidence_quality', label: '引用与证据' },
  { key: 'freshness', label: '数据时效性' },
  { key: 'safety_compliance', label: '安全合规' },
  { key: 'answer_quality', label: '回答质量' },
]

const failureTagLabels: Record<FailureTag, string> = {
  numeric_error: '数字错误',
  unit_error: '单位错误',
  invalid_citation: '引用无效',
  future_data: '使用未来数据',
  missed_risk: '风险漏报',
  unsupported_trading_advice: '无依据买卖建议',
  improper_causality: '因果关系表述不当',
}

const statusLabels: Record<ReviewStatus, string> = {
  unreviewed: '未评审',
  reviewing: '评审中',
  completed: '已完成',
}

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

      <label class="field-label">Failure Tags</label>
      <el-checkbox-group v-model="failureTags" class="failure-tags">
        <el-checkbox v-for="tag in FAILURE_TAGS" :key="tag" :value="tag">
          {{ failureTagLabels[tag] }}
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
          :label="statusLabels[reviewStatus]"
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
  min-height: 12rem;
}

.response-copy p {
  line-height: 1.65;
}

.response-time,
.muted {
  color: #7a8594;
  font-size: 0.8rem;
}

.citations {
  display: grid;
  gap: 0.5rem;
  min-height: 4.5rem;
  margin: 0;
  padding-left: 1.1rem;
}

.citations .el-tag {
  margin-left: 0.4rem;
}

.review-form {
  display: grid;
  gap: 0.8rem;
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
  margin-right: 0;
}

.status-select {
  width: 100%;
}
</style>
