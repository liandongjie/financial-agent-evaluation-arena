<script setup lang="ts">
import type { ModelDefinition, ModelId } from '../domain/schemas'

const props = defineProps<{
  models: ModelDefinition[]
  visibleModelIds: ModelId[]
}>()

const emit = defineEmits<{
  toggle: [modelId: ModelId]
}>()

function isVisible(modelId: ModelId) {
  return props.visibleModelIds.includes(modelId)
}
</script>

<template>
  <section class="visibility" aria-label="可见模型">
    <strong>比较模型</strong>
    <el-checkbox-button
      v-for="model in models"
      :key="model.model_id"
      :model-value="isVisible(model.model_id)"
      :disabled="isVisible(model.model_id) && visibleModelIds.length === 1"
      @change="emit('toggle', model.model_id)"
    >
      {{ model.display_name }}
    </el-checkbox-button>
    <span class="visibility__hint">至少保留一个模型</span>
  </section>
</template>

<style scoped>
.visibility {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.visibility strong {
  margin-right: 0.5rem;
}

.visibility__hint {
  color: #7a8594;
  font-size: 0.8rem;
}

.visibility :deep(.el-checkbox-button__inner) {
  padding: 6px 12px;
  border-color: #dfe5ed;
  box-shadow: none;
}

.visibility :deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
  color: #2563a9;
  border-color: #8bb8e8;
  background: #edf5fd;
  box-shadow: none;
}
</style>
