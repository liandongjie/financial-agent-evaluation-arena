import { describe, expect, it } from 'vitest'
import seedBundleJson from '../data/seed-bundle.json'
import { MODEL_IDS } from './constants'
import { EvaluationBundleSchema } from './schemas'

describe('Gate 1 evaluation bundle', () => {
  it('validates the seed with the canonical schema', () => {
    expect(EvaluationBundleSchema.safeParse(seedBundleJson).success).toBe(true)
  })

  it('has the required seed cardinality', () => {
    const bundle = EvaluationBundleSchema.parse(seedBundleJson)

    expect(bundle.models).toHaveLength(4)
    expect(bundle.cases).toHaveLength(5)
    expect(bundle.responses).toHaveLength(20)
    expect(bundle.reviews).toHaveLength(0)
    expect(bundle.models.map(({ model_id }) => model_id)).toEqual(MODEL_IDS)
  })

  it('has exactly one response for every case and model pair', () => {
    const bundle = EvaluationBundleSchema.parse(seedBundleJson)

    for (const evaluationCase of bundle.cases) {
      for (const model of bundle.models) {
        const matches = bundle.responses.filter(
          (response) =>
            response.case_id === evaluationCase.case_id && response.model_id === model.model_id,
        )
        expect(
          matches,
          `expected one response for ${evaluationCase.case_id}/${model.model_id}`,
        ).toHaveLength(1)
      }
    }
  })

  it('accepts an intentionally unknown citation but rejects broken references', () => {
    const bundle = EvaluationBundleSchema.parse(seedBundleJson)
    const invalidCitationResponse = bundle.responses.find(
      (response) => response.case_id === 'case-revenue-margin' && response.model_id === 'yuanbao',
    )

    expect(invalidCitationResponse?.citations).toContainEqual({
      evidence_id: 'rev-audited-note',
      label: '审计附注',
    })

    const brokenReference = structuredClone(seedBundleJson)
    brokenReference.responses[0].case_id = 'unknown-case'
    expect(EvaluationBundleSchema.safeParse(brokenReference).success).toBe(false)
  })
})
