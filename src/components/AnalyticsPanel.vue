<script setup lang="ts">
import { computed } from 'vue'
import {
  FAILURE_TAG_LABELS,
  FAILURE_TAGS,
  REVIEW_STATUS_LABELS,
  SCORE_DIMENSION_LABELS,
} from '../domain/constants'
import type { EvaluationBundle, ReviewStatus } from '../domain/schemas'
import { buildAnalyticsSnapshot, SCORE_DIMENSIONS } from '../services/analytics'
import ReportPanel from './ReportPanel.vue'

const props = defineProps<{ workspace: EvaluationBundle }>()
const analytics = computed(() => buildAnalyticsSnapshot(props.workspace))
const score = (value: number | null) => value === null ? 'N/A' : value.toFixed(2)
const caseQuestion = (caseId: string) =>
  props.workspace.cases.find((item) => item.case_id === caseId)?.question ?? caseId

</script>

<template>
  <section class="analytics" aria-label="评测分析">
    <div class="section-heading">
      <div>
        <h2>评测分析</h2>
      </div>
      <ReportPanel :workspace="workspace" />
    </div>

    <el-card shadow="never" class="coverage-card">
      <div class="coverage-card__heading">
        <span>评审完成度</span>
        <strong>{{ analytics.coverage.completedSlots }} / {{ analytics.coverage.totalSlots }}</strong>
      </div>
      <el-progress :percentage="analytics.coverage.rate * 100" :format="(value: number) => `${value.toFixed(2)}%`" />
    </el-card>

    <el-empty v-if="analytics.coverage.completedSlots === 0" description="暂无已完成评审">
      <p class="empty-state__hint">完成至少 1 条评审后，这里将展示模型排名、五维评分和问题标签分布。</p>
    </el-empty>

    <template v-else>
      <h3>模型排行榜</h3>
      <el-table :data="analytics.models" stripe>
        <el-table-column label="排名" width="80" align="center">
          <template #default="{ row }">{{ row.rank ?? '—' }}</template>
        </el-table-column>
        <el-table-column label="模型" min-width="150">
          <template #default="{ row }">
            <strong>{{ row.model.display_name }}</strong>
            <div class="technical-id">{{ row.model.model_id }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="completedReviewCount" label="已完成" width="110" align="center" />
        <el-table-column label="综合评分" width="110" align="center">
          <template #default="{ row }">{{ score(row.overallScore) }}</template>
        </el-table-column>
      </el-table>

      <h3>五维评分对比</h3>
      <el-table :data="analytics.models" stripe>
        <el-table-column label="模型" min-width="120">
          <template #default="{ row }">
            <strong>{{ row.model.display_name }}</strong>
            <div class="technical-id">{{ row.model.model_id }}</div>
          </template>
        </el-table-column>
        <el-table-column v-for="dimension in SCORE_DIMENSIONS" :key="dimension" :label="SCORE_DIMENSION_LABELS[dimension]" min-width="120" align="center">
          <template #default="{ row }">{{ score(row.dimensionAverages[dimension]) }}</template>
        </el-table-column>
      </el-table>

      <h3>问题标签分布</h3>
      <el-table :data="analytics.models" stripe>
        <el-table-column label="模型" min-width="120">
          <template #default="{ row }">
            <strong>{{ row.model.display_name }}</strong>
            <div class="technical-id">{{ row.model.model_id }}</div>
          </template>
        </el-table-column>
        <el-table-column v-for="tag in FAILURE_TAGS" :key="tag" :label="FAILURE_TAG_LABELS[tag]" min-width="120" align="center">
          <template #default="{ row }">{{ row.failureTagCounts[tag] }}</template>
        </el-table-column>
      </el-table>

      <h3>评测样例四模型对比</h3>
      <el-table :data="analytics.cases.flatMap((item) => item.models.map((model) => ({ caseId: item.caseId, ...model })))" stripe>
        <el-table-column label="评测样例" min-width="300">
          <template #default="{ row }">
            <el-tooltip :content="caseQuestion(row.caseId)" placement="top">
              <strong class="case-question">{{ caseQuestion(row.caseId) }}</strong>
            </el-tooltip>
            <div class="technical-id">ID: {{ row.caseId }}</div>
          </template>
        </el-table-column>
        <el-table-column label="模型" min-width="120">
          <template #default="{ row }">
            <strong>{{ row.model.display_name }}</strong>
            <div class="technical-id">{{ row.model.model_id }}</div>
          </template>
        </el-table-column>
        <el-table-column label="评审状态" min-width="100">
          <template #default="{ row }">{{ REVIEW_STATUS_LABELS[row.status as ReviewStatus] }}</template>
        </el-table-column>
        <el-table-column label="总分" min-width="100" align="center">
          <template #default="{ row }">{{ score(row.totalScore) }}</template>
        </el-table-column>
      </el-table>
    </template>
  </section>
</template>

<style scoped>
.analytics {
  display: grid;
  gap: 1rem;
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

.coverage-card__heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #526071;
  font-weight: 600;
}

.empty-state__hint {
  margin: 0;
  color: #7a8594;
}

.technical-id {
  margin-top: 0.15rem;
  color: #8a94a3;
  font-size: 0.75rem;
}

.case-question {
  display: -webkit-box;
  overflow: hidden;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
