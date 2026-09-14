<script setup lang="ts">
import { computed } from 'vue'
import { FAILURE_TAGS } from '../domain/constants'
import type { EvaluationBundle, ReviewStatus } from '../domain/schemas'
import { buildAnalyticsSnapshot, SCORE_DIMENSIONS } from '../services/analytics'

const props = defineProps<{ workspace: EvaluationBundle }>()
const analytics = computed(() => buildAnalyticsSnapshot(props.workspace))
const score = (value: number | null) => value === null ? 'N/A' : value.toFixed(2)

const dimensionLabels = {
  numeric_accuracy: '数字正确性',
  evidence_quality: '引用与证据',
  freshness: '数据时效性',
  safety_compliance: '安全合规',
  answer_quality: '回答质量',
}

const statusLabels: Record<ReviewStatus, string> = {
  unreviewed: '未评审',
  reviewing: '评审中',
  completed: '已完成',
}
</script>

<template>
  <section class="analytics" aria-label="Analytics">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Analytics</p>
        <h2>评测分析</h2>
      </div>
      <strong>{{ analytics.coverage.completedSlots }} / {{ analytics.coverage.totalSlots }}</strong>
    </div>

    <el-card shadow="never" class="coverage-card">
      <div>Completed-review Coverage</div>
      <el-progress :percentage="analytics.coverage.rate * 100" :format="(value: number) => `${value.toFixed(2)}%`" />
    </el-card>

    <h3>Leaderboard</h3>
    <el-table :data="analytics.models" stripe>
      <el-table-column label="Rank" width="80" align="center">
        <template #default="{ row }">{{ row.rank ?? '—' }}</template>
      </el-table-column>
      <el-table-column label="Model" min-width="150">
        <template #default="{ row }">{{ row.model.display_name }} ({{ row.model.model_id }})</template>
      </el-table-column>
      <el-table-column prop="completedReviewCount" label="Completed" width="110" align="center" />
      <el-table-column label="Overall" width="110" align="center">
        <template #default="{ row }">{{ score(row.overallScore) }}</template>
      </el-table-column>
    </el-table>

    <h3>Five-dimension Comparison</h3>
    <el-table :data="analytics.models" stripe>
      <el-table-column label="Model" min-width="120">
        <template #default="{ row }">{{ row.model.model_id }}</template>
      </el-table-column>
      <el-table-column v-for="dimension in SCORE_DIMENSIONS" :key="dimension" :label="dimensionLabels[dimension]" min-width="120" align="center">
        <template #default="{ row }">{{ score(row.dimensionAverages[dimension]) }}</template>
      </el-table-column>
    </el-table>

    <h3>Failure-tag Distribution</h3>
    <el-table :data="analytics.models" stripe>
      <el-table-column label="Model" min-width="120">
        <template #default="{ row }">{{ row.model.model_id }}</template>
      </el-table-column>
      <el-table-column v-for="tag in FAILURE_TAGS" :key="tag" :label="tag" min-width="145" align="center">
        <template #default="{ row }">{{ row.failureTagCounts[tag] }}</template>
      </el-table-column>
    </el-table>

    <h3>Per-case Four-model Comparison</h3>
    <el-table :data="analytics.cases.flatMap((item) => item.models.map((model) => ({ caseId: item.caseId, ...model })))" stripe>
      <el-table-column prop="caseId" label="Case ID" min-width="210" />
      <el-table-column label="Model" min-width="120">
        <template #default="{ row }">{{ row.model.model_id }}</template>
      </el-table-column>
      <el-table-column label="Status" min-width="100">
        <template #default="{ row }">{{ statusLabels[row.status as ReviewStatus] }}</template>
      </el-table-column>
      <el-table-column label="Total" min-width="100" align="center">
        <template #default="{ row }">{{ score(row.totalScore) }}</template>
      </el-table-column>
    </el-table>
  </section>
</template>

<style scoped>
.analytics {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1.25rem;
  border: 1px solid #dfe5ed;
  border-radius: 8px;
  background: #fff;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
}

.section-heading h2,
.section-heading p,
h3 {
  margin: 0;
}

h3 {
  margin-top: 0.5rem;
  color: #526071;
  font-size: 1rem;
}

.coverage-card {
  max-width: 520px;
}

.coverage-card div {
  margin-bottom: 0.5rem;
  color: #526071;
  font-weight: 600;
}
</style>
