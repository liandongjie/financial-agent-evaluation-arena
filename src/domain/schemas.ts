import { z } from 'zod'
import { FAILURE_TAGS, MODEL_IDS, REVIEW_STATUSES } from './constants'

const NonEmptyStringSchema = z
  .string()
  .min(1)
  .refine((value) => value.trim().length > 0, 'must not be blank')
const TimestampSchema = z.string().datetime({ offset: true })

export const ModelIdSchema = z.enum(MODEL_IDS)
export const ReviewStatusSchema = z.enum(REVIEW_STATUSES)
export const FailureTagSchema = z.enum(FAILURE_TAGS)

export const BundleMetaSchema = z.object({
  schema_version: z.literal('1.0'),
  dataset_id: NonEmptyStringSchema,
  dataset_name: NonEmptyStringSchema,
  exported_at: TimestampSchema,
}).strict()

export const ModelDefinitionSchema = z.object({
  model_id: ModelIdSchema,
  display_name: NonEmptyStringSchema,
}).strict()

export const ReferenceValueSchema = z.object({
  name: NonEmptyStringSchema,
  value: z.union([z.string(), z.number()]),
  unit: z.string(),
}).strict()

export const EvidenceSchema = z.object({
  evidence_id: NonEmptyStringSchema,
  title: NonEmptyStringSchema,
  source: NonEmptyStringSchema,
  published_at: TimestampSchema,
  content: NonEmptyStringSchema,
}).strict()

export const EvaluationCaseSchema = z
  .object({
    case_id: NonEmptyStringSchema,
    question: NonEmptyStringSchema,
    reference_answer: NonEmptyStringSchema,
    reference_values: z.array(ReferenceValueSchema),
    allowed_evidence: z.array(EvidenceSchema),
    cutoff_at: TimestampSchema,
    risk_labels: z.array(NonEmptyStringSchema),
  })
  .strict()
  .superRefine((evaluationCase, context) => {
    addDuplicateIssues(
      evaluationCase.allowed_evidence.map((evidence) => evidence.evidence_id),
      ['allowed_evidence'],
      'evidence_id',
      context,
    )
  })

export const CitationSchema = z.object({
  evidence_id: NonEmptyStringSchema,
  label: NonEmptyStringSchema.optional(),
}).strict()

export const ModelResponseSchema = z.object({
  case_id: NonEmptyStringSchema,
  model_id: ModelIdSchema,
  answer: NonEmptyStringSchema,
  citations: z.array(CitationSchema),
  generated_at: TimestampSchema,
  latency_ms: z.number().optional(),
  cost: z.number().optional(),
}).strict()

const ScoreSchema = z.number().int().min(1).max(5).nullable()

export const ReviewScoresSchema = z.object({
  numeric_accuracy: ScoreSchema,
  evidence_quality: ScoreSchema,
  freshness: ScoreSchema,
  safety_compliance: ScoreSchema,
  answer_quality: ScoreSchema,
}).strict()

export const HumanReviewSchema = z
  .object({
    case_id: NonEmptyStringSchema,
    model_id: ModelIdSchema,
    scores: ReviewScoresSchema,
    failure_tags: z.array(FailureTagSchema),
    comment: z.string(),
    status: ReviewStatusSchema,
    reviewed_at: TimestampSchema.nullable(),
  })
  .strict()
  .superRefine((review, context) => {
    const scores = Object.values(review.scores)

    if (new Set(review.failure_tags).size !== review.failure_tags.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'failure_tags must not contain duplicates',
        path: ['failure_tags'],
      })
    }

    if (review.status === 'completed' && scores.some((score) => score === null)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed reviews require all five scores',
        path: ['scores'],
      })
    }

    if (
      review.status === 'unreviewed' &&
      (scores.some((score) => score !== null) || review.reviewed_at !== null)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'unreviewed reviews require null scores and reviewed_at',
        path: ['status'],
      })
    }

    if (review.status !== 'unreviewed' && review.reviewed_at === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'reviewing and completed reviews require reviewed_at',
        path: ['reviewed_at'],
      })
    }
  })

export const EvaluationBundleSchema = z
  .object({
    meta: BundleMetaSchema,
    models: z.array(ModelDefinitionSchema),
    cases: z.array(EvaluationCaseSchema),
    responses: z.array(ModelResponseSchema),
    reviews: z.array(HumanReviewSchema),
  })
  .strict()
  .superRefine((bundle, context) => {
    addDuplicateIssues(
      bundle.models.map((model) => model.model_id),
      ['models'],
      'model_id',
      context,
    )
    addDuplicateIssues(
      bundle.cases.map((evaluationCase) => evaluationCase.case_id),
      ['cases'],
      'case_id',
      context,
    )
    addDuplicateIssues(
      bundle.responses.map(({ case_id, model_id }) => `${case_id}\u0000${model_id}`),
      ['responses'],
      '(case_id, model_id)',
      context,
    )
    addDuplicateIssues(
      bundle.reviews.map(({ case_id, model_id }) => `${case_id}\u0000${model_id}`),
      ['reviews'],
      '(case_id, model_id)',
      context,
    )

    const caseIds = new Set(bundle.cases.map((evaluationCase) => evaluationCase.case_id))
    const modelIds = new Set(bundle.models.map((model) => model.model_id))

    bundle.responses.forEach((response, index) => {
      addReferenceIssues(response, index, 'responses', caseIds, modelIds, context)
    })
    bundle.reviews.forEach((review, index) => {
      addReferenceIssues(review, index, 'reviews', caseIds, modelIds, context)
    })
  })

function addDuplicateIssues(
  values: string[],
  path: (string | number)[],
  identity: string,
  context: z.RefinementCtx,
) {
  const seen = new Set<string>()
  values.forEach((value, index) => {
    if (seen.has(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `duplicate ${identity}`,
        path: [...path, index],
      })
    }
    seen.add(value)
  })
}

function addReferenceIssues(
  item: { case_id: string; model_id: ModelId },
  index: number,
  collection: 'responses' | 'reviews',
  caseIds: Set<string>,
  modelIds: Set<ModelId>,
  context: z.RefinementCtx,
) {
  if (!caseIds.has(item.case_id)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'unknown case_id',
      path: [collection, index, 'case_id'],
    })
  }
  if (!modelIds.has(item.model_id)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'unknown model_id',
      path: [collection, index, 'model_id'],
    })
  }
}

export type ModelId = z.infer<typeof ModelIdSchema>
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>
export type FailureTag = z.infer<typeof FailureTagSchema>
export type BundleMeta = z.infer<typeof BundleMetaSchema>
export type ModelDefinition = z.infer<typeof ModelDefinitionSchema>
export type ReferenceValue = z.infer<typeof ReferenceValueSchema>
export type Evidence = z.infer<typeof EvidenceSchema>
export type EvaluationCase = z.infer<typeof EvaluationCaseSchema>
export type Citation = z.infer<typeof CitationSchema>
export type ModelResponse = z.infer<typeof ModelResponseSchema>
export type ReviewScores = z.infer<typeof ReviewScoresSchema>
export type HumanReview = z.infer<typeof HumanReviewSchema>
export type EvaluationBundle = z.infer<typeof EvaluationBundleSchema>
