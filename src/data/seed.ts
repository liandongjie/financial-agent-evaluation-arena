import seedBundleJson from './seed-bundle.json'
import { EvaluationBundleSchema } from '../domain/schemas'

export const seedBundle = EvaluationBundleSchema.parse(seedBundleJson)

