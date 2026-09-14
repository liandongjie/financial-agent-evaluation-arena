import { EvaluationBundleSchema } from '../domain/schemas'
import type { EvaluationBundle } from '../domain/schemas'

export function exportBundleJson(
  workspace: EvaluationBundle,
  exportedAt = new Date().toISOString(),
): string {
  const exported = structuredClone(workspace)
  exported.meta.exported_at = exportedAt
  return JSON.stringify(exported, null, 2)
}

export function parseEvaluationBundleJson(text: string) {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    return { success: false as const, error: 'JSON 格式错误：无法解析文件内容。' }
  }

  const result = EvaluationBundleSchema.safeParse(value)
  if (result.success) return { success: true as const, bundle: result.data }

  const details = result.error.issues
    .slice(0, 3)
    .map((issue) => `${issue.path.join('.') || 'bundle'}: ${issue.message}`)
    .join('；')
  return { success: false as const, error: `评测数据结构无效：${details}` }
}
