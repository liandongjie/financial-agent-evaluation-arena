<script setup lang="ts">
import type { EvaluationCase } from '../domain/schemas'

defineProps<{ evaluationCase: EvaluationCase }>()
</script>

<template>
  <el-card class="context-card" shadow="never">
    <template #header>
      <strong>评测参考上下文</strong>
    </template>

    <section class="context-section">
      <h2>问题</h2>
      <p>{{ evaluationCase.question }}</p>
    </section>

    <section class="context-section">
      <h2>参考答案</h2>
      <p>{{ evaluationCase.reference_answer }}</p>
    </section>

    <div class="context-grid">
      <section>
        <h2>参考值</h2>
        <ul>
          <li v-for="item in evaluationCase.reference_values" :key="item.name">
            {{ item.name }}：{{ item.value }}{{ item.unit }}
          </li>
        </ul>
      </section>
      <section>
        <h2>信息截止时间</h2>
        <p>{{ evaluationCase.cutoff_at }}</p>
      </section>
      <section>
        <h2>风险提示</h2>
        <el-space wrap>
          <el-tag v-for="risk in evaluationCase.risk_labels" :key="risk" type="warning">
            {{ risk }}
          </el-tag>
        </el-space>
      </section>
    </div>

    <el-collapse class="evidence-list">
      <el-collapse-item
        v-for="evidence in evaluationCase.allowed_evidence"
        :key="evidence.evidence_id"
        :name="evidence.evidence_id"
      >
        <template #title>
          <span class="evidence-title">{{ evidence.title }} · {{ evidence.source }}</span>
        </template>
        <p class="evidence-meta">{{ evidence.evidence_id }} · {{ evidence.published_at }}</p>
        <p>{{ evidence.content }}</p>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<style scoped>
.context-card {
  margin-bottom: 1rem;
}

.context-section h2,
.context-grid h2 {
  margin: 0 0 0.4rem;
  color: #526071;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.context-section p {
  margin-top: 0;
}

.context-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.context-grid p,
.context-grid ul {
  margin: 0;
  padding-left: 1.1rem;
}

.evidence-list {
  margin-top: 1rem;
}

.evidence-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.evidence-meta {
  color: #6b7789;
  font-size: 0.8rem;
}
</style>
