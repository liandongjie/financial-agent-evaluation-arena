import { FAILURE_TAGS } from '../domain/constants'
import type { EvaluationBundle } from '../domain/schemas'
import { buildAnalyticsSnapshot, SCORE_DIMENSIONS } from './analytics'

export function generateMarkdownReport(
  workspace: EvaluationBundle,
  generatedAt = new Date().toISOString(),
  inputSource = workspace.meta.dataset_name,
): string {
  const analytics = buildAnalyticsSnapshot(workspace)
  const score = (value: number | null) => value === null ? 'N/A' : value.toFixed(2)
  const lines = [
    '# Financial Agent Evaluation Arena Report',
    '',
    `- Generation timestamp: ${generatedAt}`,
    `- Schema version: ${workspace.meta.schema_version}`,
    `- Input source: ${inputSource}`,
    `- Completed-review coverage: ${analytics.coverage.completedSlots} / ${analytics.coverage.totalSlots} (${(analytics.coverage.rate * 100).toFixed(2)}%)`,
    '',
    '> Only completed reviews contribute to ranking and analytics.',
    '',
    '## Four-model Ranking',
    '',
    '| Rank | Model | Model ID | Completed | Overall Score |',
    '| ---: | --- | --- | ---: | ---: |',
    ...analytics.models.map((model) =>
      `| ${model.rank ?? '—'} | ${model.model.display_name} | ${model.model.model_id} | ${model.completedReviewCount} | ${score(model.overallScore)} |`,
    ),
    '',
    '## Five-dimension Averages',
    '',
    `| Model ID | ${SCORE_DIMENSIONS.join(' | ')} |`,
    `| --- | ${SCORE_DIMENSIONS.map(() => '---:').join(' | ')} |`,
    ...analytics.models.map((model) =>
      `| ${model.model.model_id} | ${SCORE_DIMENSIONS.map((dimension) => score(model.dimensionAverages[dimension])).join(' | ')} |`,
    ),
    '',
    '## Failure-tag Distribution',
    '',
    `| Model ID | ${FAILURE_TAGS.join(' | ')} |`,
    `| --- | ${FAILURE_TAGS.map(() => '---:').join(' | ')} |`,
    ...analytics.models.map((model) =>
      `| ${model.model.model_id} | ${FAILURE_TAGS.map((tag) => model.failureTagCounts[tag]).join(' | ')} |`,
    ),
    '',
    '## Case-level Four-model Comparison',
    '',
    '| Case ID | Model ID | Effective Status | Total Score |',
    '| --- | --- | --- | ---: |',
    ...analytics.cases.flatMap((evaluationCase) =>
      evaluationCase.models.map((model) =>
        `| ${evaluationCase.caseId} | ${model.model.model_id} | ${model.status} | ${score(model.totalScore)} |`,
      ),
    ),
    '',
  ]

  return lines.join('\n')
}
