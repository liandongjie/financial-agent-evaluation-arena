<script setup lang="ts">
import { computed, ref } from 'vue'
import AnalyticsPanel from './components/AnalyticsPanel.vue'
import CaseContextPanel from './components/CaseContextPanel.vue'
import DataPanel from './components/DataPanel.vue'
import ModelVisibilityControl from './components/ModelVisibilityControl.vue'
import ResponseReviewCard from './components/ResponseReviewCard.vue'
import ReviewRecordsPanel from './components/ReviewRecordsPanel.vue'
import { useEvaluationStore } from './stores/evaluation'

const store = useEvaluationStore()
const activeSection = ref('review')

const selectedCaseId = computed({
  get: () => store.currentCaseId,
  set: (caseId: string) => store.setCurrentCase(caseId),
})
</script>

<template>
  <main class="workspace">
    <header class="workspace__header">
      <h1>Financial Agent Evaluation Arena</h1>
      <p>金融 Agent 人工评测工作台</p>
    </header>

    <el-alert
      v-if="store.persistenceWarning"
      :title="store.persistenceWarning"
      type="warning"
      :closable="false"
      show-icon
      class="persistence-warning"
    />

    <el-tabs v-model="activeSection" class="workspace-tabs">
      <el-tab-pane label="评审" name="review">
        <div class="review-toolbar">
          <div>
            <h2>评审工作区</h2>
            <p>对照参考上下文，并排完成人工评审。</p>
          </div>
          <label class="case-picker">
            <span>选择评测样例</span>
            <el-select v-model="selectedCaseId" aria-label="选择评测样例">
              <el-option
                v-for="evaluationCase in store.workspace.cases"
                :key="evaluationCase.case_id"
                :label="evaluationCase.question"
                :value="evaluationCase.case_id"
              />
            </el-select>
          </label>
        </div>

        <template v-if="store.currentCase">
          <CaseContextPanel :evaluation-case="store.currentCase" />
          <ModelVisibilityControl
            :models="store.workspace.models"
            :visible-model-ids="store.visibleModelIds"
            @toggle="store.toggleModelVisibility"
          />
          <section class="comparison" aria-label="模型回答比较">
            <ResponseReviewCard
              v-for="item in store.visibleComparisons"
              :key="`${item.response.case_id}-${item.model.model_id}`"
              :evaluation-case="store.currentCase"
              :model="item.model"
              :response="item.response"
              :review="store.reviewFor(item.response.case_id, item.model.model_id)"
            />
          </section>
        </template>
      </el-tab-pane>
      <el-tab-pane label="评审记录" name="records">
        <ReviewRecordsPanel :workspace="store.workspace" />
      </el-tab-pane>
      <el-tab-pane label="评测分析" name="analytics">
        <AnalyticsPanel :workspace="store.workspace" />
      </el-tab-pane>
      <el-tab-pane label="数据管理" name="data">
        <DataPanel />
      </el-tab-pane>
    </el-tabs>
  </main>
</template>

<style scoped>
.workspace {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.25rem 2rem 2rem;
}

.workspace__header {
  margin-bottom: 0.75rem;
}

.workspace__header h1 {
  margin: 0;
  font-size: clamp(1.5rem, 2.4vw, 2rem);
}

.workspace__header p {
  margin: 0.25rem 0 0;
  color: #526071;
  font-size: 0.95rem;
}

.workspace-tabs :deep(.el-tabs__header) {
  margin-bottom: 1rem;
}

.workspace-tabs :deep(.el-tabs__item) {
  font-size: 1rem;
  font-weight: 600;
}

.review-toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1rem;
}

.review-toolbar h2,
.review-toolbar p {
  margin: 0;
}

.review-toolbar p {
  margin-top: 0.25rem;
  color: #7a8594;
  font-size: 0.875rem;
}

.case-picker {
  display: grid;
  flex: 0 1 520px;
  gap: 0.4rem;
  color: #526071;
  font-size: 0.875rem;
  font-weight: 600;
}

.comparison {
  display: grid;
  grid-template-columns: repeat(4, minmax(320px, 1fr));
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.persistence-warning {
  margin-bottom: 1.5rem;
}

@media (max-width: 900px) {
  .review-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 0.75rem;
  }

  .case-picker {
    flex-basis: auto;
  }
}
</style>
