<script setup lang="ts">
import { ref, toRaw } from 'vue'
import { ElMessageBox } from 'element-plus'
import { exportBundleJson, parseEvaluationBundleJson } from '../services/bundleIo'
import { useEvaluationStore } from '../stores/evaluation'

const store = useEvaluationStore()
const fileInput = ref<HTMLInputElement>()
const feedback = ref('')
const feedbackType = ref<'success' | 'error' | 'info'>('info')
const displayDatasetName = (name: string) =>
  name === 'Financial Agent Evaluation Arena Seed'
    ? 'Financial Agent Evaluation Arena 初始数据'
    : name

function exportJson() {
  const json = exportBundleJson(toRaw(store.workspace))
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'financial-agent-evaluation-bundle.json'
  anchor.click()
  URL.revokeObjectURL(url)
  showFeedback('完整评测数据已导出。', 'success')
}

async function importJson(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  let text: string
  try {
    text = await file.text()
  } catch {
    showFeedback('导入失败：无法读取所选文件。', 'error')
    return
  }

  const parsed = parseEvaluationBundleJson(text)
  if (!parsed.success) {
    showFeedback(parsed.error, 'error')
    return
  }

  const bundle = parsed.bundle
  try {
    await ElMessageBox.confirm(
      `导入将替换当前全部评测数据。\n${displayDatasetName(bundle.meta.dataset_name)}：${bundle.cases.length} 个评测样例 / ${bundle.models.length} 个模型 / ${bundle.responses.length} 条模型回答 / ${bundle.reviews.length} 条评审记录`,
      '确认导入',
      { confirmButtonText: '确认替换', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    showFeedback('已取消导入，当前评测数据未更改。', 'info')
    return
  }

  const result = store.replaceWorkspace(bundle)
  showFeedback(result.success ? '导入成功，已替换全部评测数据。' : result.error, result.success ? 'success' : 'error')
}

async function resetToSeed() {
  try {
    await ElMessageBox.confirm(
      '当前保存的评审和导入数据将被清除，并恢复系统初始数据。',
      '确认重置',
      { confirmButtonText: '确认重置', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    showFeedback('已取消重置，当前评测数据未更改。', 'info')
    return
  }

  const result = store.resetWorkspace()
  showFeedback(result.success ? '已恢复系统初始数据。' : result.error, result.success ? 'success' : 'error')
}

function showFeedback(message: string, type: 'success' | 'error' | 'info') {
  feedback.value = message
  feedbackType.value = type
}
</script>

<template>
  <section class="data-panel" aria-label="数据管理">
    <div class="data-panel__heading">
      <div>
        <h2>数据管理</h2>
      </div>
      <div class="data-panel__actions">
        <el-button @click="exportJson">导出 JSON</el-button>
        <el-button @click="fileInput?.click()">导入 JSON</el-button>
        <el-button type="danger" plain @click="resetToSeed">恢复初始数据</el-button>
        <input ref="fileInput" type="file" accept="application/json,.json" @change="importJson">
      </div>
    </div>

    <dl class="summary">
      <div><dt>数据集</dt><dd>{{ displayDatasetName(store.workspace.meta.dataset_name) }}</dd></div>
      <div><dt>数据版本</dt><dd>{{ store.workspace.meta.schema_version }}</dd></div>
      <div><dt>评测样例</dt><dd>{{ store.workspace.cases.length }}</dd></div>
      <div><dt>模型</dt><dd>{{ store.workspace.models.length }}</dd></div>
      <div><dt>模型回答</dt><dd>{{ store.workspace.responses.length }}</dd></div>
      <div><dt>评审记录</dt><dd>{{ store.workspace.reviews.length }}</dd></div>
    </dl>

    <el-alert v-if="feedback" :title="feedback" :type="feedbackType" :closable="false" show-icon />
  </section>
</template>

<style scoped>
.data-panel {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #dfe5ed;
  border-radius: 8px;
  background: #fff;
}

.data-panel__heading,
.data-panel__actions,
.summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.data-panel__heading {
  justify-content: space-between;
}

.data-panel h2,
.data-panel p,
.summary {
  margin: 0;
}

.data-panel input {
  display: none;
}

.summary {
  flex-wrap: wrap;
}

.summary div {
  min-width: 100px;
  padding: 0.75rem;
  border-radius: 6px;
  background: #f4f7fb;
}

.summary dt {
  color: #7a8594;
  font-size: 0.75rem;
}

.summary dd {
  margin: 0.2rem 0 0;
  font-weight: 700;
}

@media (max-width: 760px) {
  .data-panel__heading,
  .data-panel__actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
