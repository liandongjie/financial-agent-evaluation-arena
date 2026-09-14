<script setup lang="ts">
import { computed } from 'vue'
import CaseContextPanel from './components/CaseContextPanel.vue'
import ModelVisibilityControl from './components/ModelVisibilityControl.vue'
import ResponseReviewCard from './components/ResponseReviewCard.vue'
import { useEvaluationStore } from './stores/evaluation'

const store = useEvaluationStore()

const selectedCaseId = computed({
  get: () => store.currentCaseId,
  set: (caseId: string) => store.setCurrentCase(caseId),
})
</script>

<template>
  <main class="workspace">
    <header class="workspace__header">
      <div>
        <p class="eyebrow">Human Review Workspace</p>
        <h1>Financial Agent Evaluation Arena</h1>
      </div>
      <label class="case-picker">
        <span>选择评测 Case</span>
        <el-select v-model="selectedCaseId" aria-label="选择评测 Case">
          <el-option
            v-for="evaluationCase in store.workspace.cases"
            :key="evaluationCase.case_id"
            :label="evaluationCase.question"
            :value="evaluationCase.case_id"
          />
        </el-select>
      </label>
    </header>

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
  </main>
</template>

<style scoped>
.workspace {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.workspace__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #177245;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 3rem);
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

@media (max-width: 900px) {
  .workspace__header {
    align-items: stretch;
    flex-direction: column;
  }

  .case-picker {
    flex-basis: auto;
  }
}
</style>
