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
  <el-button type="primary" aria-label="生成并下载 Markdown 报告" @click="downloadReport">
    生成并下载 Markdown 报告
  </el-button>
</template>
