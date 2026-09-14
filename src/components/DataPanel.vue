<script setup lang="ts">
import { ref, toRaw } from 'vue'
import { ElMessageBox } from 'element-plus'
import { exportBundleJson, parseEvaluationBundleJson } from '../services/bundleIo'
import { useEvaluationStore } from '../stores/evaluation'

const store = useEvaluationStore()
const fileInput = ref<HTMLInputElement>()
const feedback = ref('')
const feedbackType = ref<'success' | 'error' | 'info'>('info')

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
      `导入将替换当前全部评测数据。\n${bundle.meta.dataset_name}：${bundle.cases.length} Cases / ${bundle.models.length} Models / ${bundle.responses.length} Responses / ${bundle.reviews.length} Reviews`,
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
      '当前保存的评审和导入数据将被清除，并恢复内置 Seed。',
      '确认重置',
      { confirmButtonText: '确认重置', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    showFeedback('已取消重置，当前评测数据未更改。', 'info')
    return
  }

  const result = store.resetWorkspace()
  showFeedback(result.success ? '已恢复内置 Seed。' : result.error, result.success ? 'success' : 'error')
}

function showFeedback(message: string, type: 'success' | 'error' | 'info') {
  feedback.value = message
  feedbackType.value = type
}
</script>

<template>
  <section class="data-panel" aria-label="Data Management">
    <div class="data-panel__heading">
      <div>
        <p class="eyebrow">Data</p>
        <h2>评测数据</h2>
      </div>
      <div class="data-panel__actions">
        <el-button @click="exportJson">导出 JSON</el-button>
        <el-button @click="fileInput?.click()">导入 JSON</el-button>
        <el-button type="danger" plain @click="resetToSeed">恢复内置 Seed</el-button>
        <input ref="fileInput" type="file" accept="application/json,.json" @change="importJson">
      </div>
    </div>

    <dl class="summary">
      <div><dt>Dataset</dt><dd>{{ store.workspace.meta.dataset_name }}</dd></div>
      <div><dt>Schema</dt><dd>{{ store.workspace.meta.schema_version }}</dd></div>
      <div><dt>Cases</dt><dd>{{ store.workspace.cases.length }}</dd></div>
      <div><dt>Models</dt><dd>{{ store.workspace.models.length }}</dd></div>
      <div><dt>Responses</dt><dd>{{ store.workspace.responses.length }}</dd></div>
      <div><dt>Reviews</dt><dd>{{ store.workspace.reviews.length }}</dd></div>
    </dl>

    <el-alert v-if="feedback" :title="feedback" :type="feedbackType" :closable="false" show-icon />
  </section>
</template>

<style scoped>
.data-panel {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
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
