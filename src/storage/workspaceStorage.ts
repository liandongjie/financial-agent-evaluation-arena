import { EvaluationBundleSchema } from '../domain/schemas'
import type { EvaluationBundle } from '../domain/schemas'

export const WORKSPACE_STORAGE_KEY = 'financial-agent-evaluation-arena.workspace.v1'

export function loadWorkspace(fallback: EvaluationBundle): {
  workspace: EvaluationBundle
  warning: string
} {
  try {
    const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY)
    if (saved === null) return { workspace: structuredClone(fallback), warning: '' }

    const result = EvaluationBundleSchema.safeParse(JSON.parse(saved))
    if (result.success) return { workspace: result.data, warning: '' }
  } catch {
    // The same fallback covers unavailable storage and malformed JSON.
  }

  return {
    workspace: structuredClone(fallback),
    warning: '本地保存的数据无效，已恢复内置评测数据。',
  }
}

export function saveWorkspace(workspace: EvaluationBundle) {
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace))
}
