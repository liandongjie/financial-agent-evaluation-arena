<script setup lang="ts">
import { computed, reactive } from 'vue'
import { FAILURE_TAGS, REVIEW_STATUSES } from '../domain/constants'
import type { EvaluationBundle, FailureTag, ReviewScores, ReviewStatus } from '../domain/schemas'
import { buildReviewSlots, filterReviewSlots } from '../services/filtering'
import type { ReviewFilters } from '../services/filtering'

const props = defineProps<{ workspace: EvaluationBundle }>()

const filters = reactive<ReviewFilters>({
  caseId: null,
  modelId: null,
  status: null,
  failureTag: null,
})

const filteredSlots = computed(() => filterReviewSlots(buildReviewSlots(props.workspace), filters))

const dimensions: { key: keyof ReviewScores; label: string }[] = [
  { key: 'numeric_accuracy', label: '数字正确性' },
  { key: 'evidence_quality', label: '引用与证据' },
  { key: 'freshness', label: '数据时效性' },
  { key: 'safety_compliance', label: '安全合规' },
  { key: 'answer_quality', label: '回答质量' },
]

const statusLabels: Record<ReviewStatus, string> = {
  unreviewed: '未评审',
  reviewing: '评审中',
  completed: '已完成',
}

const failureTagLabels: Record<FailureTag, string> = {
  numeric_error: '数字错误',
  unit_error: '单位错误',
  invalid_citation: '引用无效',
  future_data: '使用未来数据',
  missed_risk: '风险漏报',
  unsupported_trading_advice: '无依据买卖建议',
  improper_causality: '因果关系表述不当',
}

function clearFilters() {
  Object.assign(filters, { caseId: null, modelId: null, status: null, failureTag: null })
}
</script>

<template>
  <section class="records" aria-label="评审记录">
    <div class="records__header">
      <div>
        <p class="eyebrow">Review Records</p>
        <h2>评审记录</h2>
      </div>
      <span>共 {{ filteredSlots.length }} 条</span>
    </div>

    <div class="filters">
      <label>
        <span>Case</span>
        <el-select v-model="filters.caseId" aria-label="按 Case 筛选" clearable placeholder="全部">
          <el-option
            v-for="item in workspace.cases"
            :key="item.case_id"
            :label="item.question"
            :value="item.case_id"
          />
        </el-select>
      </label>
      <label>
        <span>Model</span>
        <el-select v-model="filters.modelId" aria-label="按模型筛选" clearable placeholder="全部">
          <el-option
            v-for="model in workspace.models"
            :key="model.model_id"
            :label="model.display_name"
            :value="model.model_id"
          />
        </el-select>
      </label>
      <label>
        <span>Review Status</span>
        <el-select v-model="filters.status" aria-label="按评审状态筛选" clearable placeholder="全部">
          <el-option
            v-for="item in REVIEW_STATUSES"
            :key="item"
            :label="statusLabels[item]"
            :value="item"
          />
        </el-select>
      </label>
      <label>
        <span>Failure Tag</span>
        <el-select
          v-model="filters.failureTag"
          aria-label="按 Failure Tag 筛选"
          clearable
          placeholder="全部"
        >
          <el-option
            v-for="tag in FAILURE_TAGS"
            :key="tag"
            :label="failureTagLabels[tag]"
            :value="tag"
          />
        </el-select>
      </label>
      <el-button @click="clearFilters">清空筛选</el-button>
    </div>

    <el-table :data="filteredSlots" stripe>
      <el-table-column label="Case" min-width="260">
        <template #default="{ row }">
          <strong>{{ row.response.case_id }}</strong>
          <div>{{ row.evaluationCase.question }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Model" min-width="110">
        <template #default="{ row }">{{ row.model.display_name }}</template>
      </el-table-column>
      <el-table-column label="Status" min-width="90">
        <template #default="{ row }">{{ statusLabels[row.effectiveStatus as ReviewStatus] }}</template>
      </el-table-column>
      <el-table-column
        v-for="dimension in dimensions"
        :key="dimension.key"
        :label="dimension.label"
        width="105"
        align="center"
      >
        <template #default="{ row }">{{ row.review?.scores[dimension.key] ?? '—' }}</template>
      </el-table-column>
      <el-table-column label="Failure Tags" min-width="190">
        <template #default="{ row }">
          <template v-if="row.review?.failure_tags.length">
            <el-tag v-for="tag in row.review.failure_tags" :key="tag" size="small">
              {{ failureTagLabels[tag as FailureTag] }}
            </el-tag>
          </template>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="Comment" min-width="180">
        <template #default="{ row }">{{ row.review?.comment || '—' }}</template>
      </el-table-column>
      <el-table-column label="reviewed_at" min-width="190">
        <template #default="{ row }">{{ row.review?.reviewed_at ?? '—' }}</template>
      </el-table-column>
    </el-table>
  </section>
</template>

<style scoped>
.records {
  margin-top: 1.5rem;
  padding: 1.25rem;
  border: 1px solid #dfe5ed;
  border-radius: 8px;
  background: #fff;
}

.records__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.records__header h2,
.records__header p {
  margin: 0;
}

.records__header span {
  color: #7a8594;
}

.filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr)) auto;
  gap: 0.75rem;
  align-items: end;
  margin-bottom: 1rem;
}

.filters label {
  display: grid;
  gap: 0.35rem;
  color: #526071;
  font-size: 0.85rem;
  font-weight: 600;
}

.el-tag + .el-tag {
  margin-left: 0.25rem;
}

@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
