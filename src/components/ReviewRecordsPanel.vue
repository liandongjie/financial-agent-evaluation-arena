<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  FAILURE_TAG_LABELS,
  FAILURE_TAGS,
  REVIEW_STATUS_LABELS,
  REVIEW_STATUSES,
  SCORE_DIMENSION_LABELS,
} from '../domain/constants'
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
const pageSize = 10
const currentPage = ref(1)
const paginatedSlots = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSlots.value.slice(start, start + pageSize)
})

watch(filters, () => { currentPage.value = 1 })
watch(() => filteredSlots.value.length, (total) => {
  if ((currentPage.value - 1) * pageSize >= total) currentPage.value = 1
})

const dimensions: { key: keyof ReviewScores; label: string }[] = [
  { key: 'numeric_accuracy', label: SCORE_DIMENSION_LABELS.numeric_accuracy },
  { key: 'evidence_quality', label: SCORE_DIMENSION_LABELS.evidence_quality },
  { key: 'freshness', label: SCORE_DIMENSION_LABELS.freshness },
  { key: 'safety_compliance', label: SCORE_DIMENSION_LABELS.safety_compliance },
  { key: 'answer_quality', label: SCORE_DIMENSION_LABELS.answer_quality },
]

function clearFilters() {
  Object.assign(filters, { caseId: null, modelId: null, status: null, failureTag: null })
}
</script>

<template>
  <section class="records" aria-label="评审记录">
    <div class="records__header">
      <div>
        <h2>评审记录</h2>
      </div>
      <span>共 {{ filteredSlots.length }} 条</span>
    </div>

    <div class="filters">
      <label>
        <span>评测样例</span>
        <el-select v-model="filters.caseId" aria-label="按评测样例筛选" clearable placeholder="全部">
          <el-option
            v-for="item in workspace.cases"
            :key="item.case_id"
            :label="item.question"
            :value="item.case_id"
          />
        </el-select>
      </label>
      <label>
        <span>模型</span>
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
        <span>评审状态</span>
        <el-select v-model="filters.status" aria-label="按评审状态筛选" clearable placeholder="全部">
          <el-option
            v-for="item in REVIEW_STATUSES"
            :key="item"
            :label="REVIEW_STATUS_LABELS[item]"
            :value="item"
          />
        </el-select>
      </label>
      <label>
        <span>问题标签</span>
        <el-select
          v-model="filters.failureTag"
          aria-label="按问题标签筛选"
          clearable
          placeholder="全部"
        >
          <el-option
            v-for="tag in FAILURE_TAGS"
            :key="tag"
            :label="FAILURE_TAG_LABELS[tag]"
            :value="tag"
          />
        </el-select>
      </label>
      <el-button @click="clearFilters">清空筛选</el-button>
    </div>

    <el-table :data="paginatedSlots" stripe>
      <el-table-column label="评测样例" min-width="220">
        <template #default="{ row }">
          <el-tooltip :content="row.evaluationCase.question" placement="top">
            <strong class="case-question">{{ row.evaluationCase.question }}</strong>
          </el-tooltip>
          <div class="case-id">ID: {{ row.response.case_id }}</div>
        </template>
      </el-table-column>
      <el-table-column label="模型" min-width="90">
        <template #default="{ row }">{{ row.model.display_name }}</template>
      </el-table-column>
      <el-table-column label="评审状态" min-width="85">
        <template #default="{ row }">{{ REVIEW_STATUS_LABELS[row.effectiveStatus as ReviewStatus] }}</template>
      </el-table-column>
      <el-table-column
        v-for="dimension in dimensions"
        :key="dimension.key"
        :label="dimension.label"
        width="85"
        align="center"
      >
        <template #default="{ row }">{{ row.review?.scores[dimension.key] ?? '—' }}</template>
      </el-table-column>
      <el-table-column label="问题标签" min-width="150">
        <template #default="{ row }">
          <template v-if="row.review?.failure_tags.length">
            <el-tag v-for="tag in row.review.failure_tags" :key="tag" size="small">
              {{ FAILURE_TAG_LABELS[tag as FailureTag] }}
            </el-tag>
          </template>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="评论" min-width="130">
        <template #default="{ row }">{{ row.review?.comment || '—' }}</template>
      </el-table-column>
      <el-table-column label="评审时间" min-width="180">
        <template #default="{ row }">{{ row.review?.reviewed_at ?? '—' }}</template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredSlots.length"
      layout="prev, pager, next"
      class="records__pagination"
    />
  </section>
</template>

<style scoped>
.records {
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

.case-question {
  display: -webkit-box;
  overflow: hidden;
  color: #303b4d;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.case-id {
  margin-top: 0.2rem;
  color: #8a94a3;
  font-size: 0.75rem;
}

.records__pagination {
  justify-content: flex-end;
  margin-top: 1rem;
}

@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
