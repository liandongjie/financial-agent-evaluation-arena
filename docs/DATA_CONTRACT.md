# Financial Agent Evaluation Arena — Data Contract

Status: **FROZEN for MVP / Gate 0**  
Schema version: `1.0`

This document defines the canonical persisted/imported/exported data shape. TypeScript types and Zod schemas implemented later must follow this contract rather than inventing a parallel model.

## 1. Top-level bundle

```ts
interface EvaluationBundle {
  meta: BundleMeta
  models: ModelDefinition[]
  cases: EvaluationCase[]
  responses: ModelResponse[]
  reviews: HumanReview[]
}
```

### BundleMeta

```ts
interface BundleMeta {
  schema_version: "1.0"
  dataset_id: string
  dataset_name: string
  exported_at: string // ISO-8601 timestamp
}
```

Rules:
- `schema_version` must equal the supported version.
- `dataset_id` is non-empty and identifies the reproducible bundle/dataset.
- `exported_at` is generated when exporting. The built-in seed may use a fixed build timestamp.

## 2. ModelDefinition

```ts
type ModelId = "iwencai" | "doubao" | "qwen" | "yuanbao"

interface ModelDefinition {
  model_id: ModelId
  display_name: string
}
```

Built-in model definitions:

| model_id | display_name |
|---|---|
| `iwencai` | 同花顺问财 |
| `doubao` | 豆包 |
| `qwen` | 千问 |
| `yuanbao` | 元宝 |

MVP rationale: the assessment explicitly asks for these four-model comparisons. Arbitrary model registration is unnecessary scope.

## 3. EvaluationCase

```ts
interface EvaluationCase {
  case_id: string
  question: string
  reference_answer: string
  reference_values: ReferenceValue[]
  allowed_evidence: Evidence[]
  cutoff_at: string
  risk_labels: string[]
}
```

### ReferenceValue

```ts
interface ReferenceValue {
  name: string
  value: string | number
  unit: string
}
```

Rules:
- unit must be explicit; use an empty string only when the value is genuinely unitless.
- string values are allowed when exact finance formatting/large identifiers should not be coerced to floating point.

### Evidence

```ts
interface Evidence {
  evidence_id: string
  title: string
  source: string
  published_at: string
  content: string
}
```

Rules:
- `evidence_id` is unique within its case.
- evidence is self-contained; no network fetch is required for verification.
- `published_at` enables the reviewer to reason about cutoff/future-data issues.
- URLs are deliberately not required because the assessment permits fully simulated, self-contained data.

### Case rules

- `case_id` must be globally unique.
- `question` and `reference_answer` must be non-empty.
- `cutoff_at` is an ISO-8601 timestamp.
- built-in dataset contains at least 5 cases.
- risk labels are reference hints for the human reviewer; they are not automatically converted into failure tags.

## 4. ModelResponse

```ts
interface ModelResponse {
  case_id: string
  model_id: ModelId
  answer: string
  citations: Citation[]
  generated_at: string
  latency_ms?: number
  cost?: number
}
```

### Citation

```ts
interface Citation {
  evidence_id: string
  label?: string
}
```

Rules:
- `(case_id, model_id)` must be unique.
- `case_id` must reference an existing case.
- `model_id` must reference an existing model.
- `answer` is non-empty.
- `generated_at` is ISO-8601.
- a citation normally references an evidence ID from that case. To make `invalid_citation` examples reproducible, simulated responses may intentionally include an unknown `evidence_id`; this is valid source test data, not an import structural error.
- citation validity is a human-evaluation concern. Import validation therefore must not reject an unknown citation ID merely because the mock answer intentionally contains a bad citation.
- `latency_ms` and `cost` are optional and have no MVP scoring effect.

## 5. HumanReview

```ts
type ReviewStatus = "unreviewed" | "reviewing" | "completed"

type FailureTag =
  | "numeric_error"
  | "unit_error"
  | "invalid_citation"
  | "future_data"
  | "missed_risk"
  | "unsupported_trading_advice"
  | "improper_causality"

interface ReviewScores {
  numeric_accuracy: number | null
  evidence_quality: number | null
  freshness: number | null
  safety_compliance: number | null
  answer_quality: number | null
}

interface HumanReview {
  case_id: string
  model_id: ModelId
  scores: ReviewScores
  failure_tags: FailureTag[]
  comment: string
  status: ReviewStatus
  reviewed_at: string | null
}
```

Rules:
- `(case_id, model_id)` is the review identity and must be unique.
- `case_id` and `model_id` must reference existing source data.
- each non-null score is an integer in `[1, 5]`.
- `failure_tags` contains no duplicates and only known tags.
- `comment` may be empty.
- `completed` requires all five scores to be non-null.
- `reviewing` may contain any subset of scores.
- `unreviewed` may be omitted entirely from `reviews`; absence of a review record is treated as effective status `unreviewed`.
- when an explicit `unreviewed` record exists, all scores should be null; this avoids an ambiguous "scored but unreviewed" state.
- `reviewed_at` is `null` for unreviewed records. Saving a `reviewing` or `completed` review sets/updates it to the save time.
- updates replace the existing review with the same `(case_id, model_id)`; they never append a duplicate.

## 6. Effective review state

The UI operates on 20 logical review slots for the built-in dataset (5 cases × 4 models).

```ts
function effectiveStatus(caseId, modelId): ReviewStatus {
  return persistedReviewExists(caseId, modelId)
    ? review.status
    : "unreviewed"
}
```

This permits the initial bundle to have `reviews: []` while still supporting an "unreviewed" filter over every response.

## 7. Scoring semantics

A completed review has five integer scores from 1 to 5.

```text
total_score =
  numeric_accuracy / 5 * 20
+ evidence_quality / 5 * 20
+ freshness / 5 * 20
+ safety_compliance / 5 * 20
+ answer_quality / 5 * 20
```

Equivalent simplification for five equal-weight dimensions:

```text
total_score = 4 * sum(the five scores)
```

Range: 20–100 for a valid completed review. The UI/report may describe the normalized scale as 0–100, but no completed review can actually score below 20 because the allowed dimension minimum is 1.

Model analytics:
- only `completed` reviews are included;
- model overall = arithmetic mean of completed `total_score` values;
- dimension average = arithmetic mean of completed scores for that dimension;
- failure-tag distribution = occurrence count of each selected tag among completed reviews;
- ranking = overall descending, then `model_id` ascending;
- zero completed reviews => `N/A` overall/dimension metrics and completed count `0`.

No extra deduction is applied for failure tags.

## 8. Filtering semantics

Filters are pure views over logical review slots and never mutate the bundle.

- case filter: match `case_id`;
- model filter: match `model_id`;
- status filter: use effective status, including absent-review slots as `unreviewed`;
- failure-tag filter: matches persisted reviews containing the selected tag; absent-review slots never match a failure tag.

Multiple simultaneously active filter categories use logical AND. Within a future multi-select category, OR semantics may be used, but MVP controls may remain single-select except failure tags in the review editor.

## 9. Comparison-view state

`visibleModelIds` is transient UI state and is **not part of EvaluationBundle**.

Hiding/removing a model from the comparison view:
- does not delete its model definition;
- does not delete its response;
- does not delete its review;
- does not affect analytics.

At least one model should remain visible to avoid an empty comparison workspace.

## 10. Import validation rules

A bundle is rejected before persistence if any of these structural invariants fail:
- unsupported/missing schema version;
- duplicate `model_id`;
- duplicate `case_id`;
- duplicate evidence IDs inside one case;
- duplicate `(case_id, model_id)` response;
- duplicate `(case_id, model_id)` review;
- response references unknown case/model;
- review references unknown case/model;
- invalid status;
- score not null or an integer 1–5;
- unknown/duplicate failure tag;
- `completed` review has a missing score;
- explicit `unreviewed` review contains non-null score or non-null `reviewed_at`;
- malformed required timestamp/text fields.

An intentionally invalid citation ID inside a model response is **not** an import structural failure, because the arena must be able to evaluate invalid citations.

Import operation must be transactional at application level: failed parse/validation leaves existing persisted workspace unchanged.

## 11. Export rules

Export serializes the current canonical workspace bundle and updates `meta.exported_at` to the export time.

Do not export transient UI state such as:
- selected tab;
- current case;
- visible comparison models;
- temporary filters;
- unsaved form drafts.

This keeps exports reproducible evaluation data rather than browser-session snapshots.

## 12. Reset semantics

Reset restores the exact built-in seed bundle and clears persisted review/workspace modifications after user confirmation.

Reset does not change source code or the immutable built-in seed asset.

## 13. Report input contract

The program-generated report consumes the same canonical bundle and the same pure scoring/aggregation functions used by the Analytics UI.

There must not be a second, separately implemented scoring formula for reports.

## 14. Decisions deliberately not modeled

The MVP data contract does not include:
- reviewer identity;
- review history/version chain;
- multiple reviewers per answer;
- adjudication;
- automatic judge scores;
- prompt/trace/token details;
- network evidence URLs as mandatory fields;
- model provider/API configuration;
- configurable dimensions/weights;
- backend record IDs.

These are production-platform concerns and are outside the coding assessment's stated scope.
