<script setup lang="ts">
import type { EvaluationBundle } from '../domain/schemas'
import { generateMarkdownReport } from '../services/report'

const props = defineProps<{ workspace: EvaluationBundle }>()

function downloadReport() {
  const report = generateMarkdownReport(props.workspace)
  const url = URL.createObjectURL(new Blob([report], { type: 'text/markdown;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'financial-agent-evaluation-report.md'
  anchor.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="report" aria-label="Markdown Report">
    <div>
      <p class="eyebrow">Report</p>
      <h2>Markdown 报告</h2>
      <p>报告与 Analytics 使用同一份 completed-only 统计结果。</p>
    </div>
    <el-button type="primary" @click="downloadReport">生成并下载 Markdown 报告</el-button>
  </section>
</template>

<style scoped>
.report {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1.25rem;
  border: 1px solid #dfe5ed;
  border-radius: 8px;
  background: #fff;
}

.report h2,
.report p {
  margin: 0;
}

.report div > p:last-child {
  margin-top: 0.4rem;
  color: #7a8594;
}

@media (max-width: 700px) {
  .report {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
