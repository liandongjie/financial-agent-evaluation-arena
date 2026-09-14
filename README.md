# Financial Agent Evaluation Arena

## Overview

Financial Agent Evaluation Arena is a local, reproducible MVP for human review of financial-agent answers. A reviewer compares four built-in model responses for the same case, scores each response, records diagnostic failure tags and comments, and inspects completed-only analytics.

This is deliberately a single-browser, single-user coding-assessment application. It does not call external model APIs and does not claim that its simulated cases are live market data.

## Features

- Five self-contained financial cases and exactly four built-in models: `iwencai`, `doubao`, `qwen`, and `yuanbao`.
- Side-by-side response comparison with removable/restorable model columns.
- Five 1–5 scoring dimensions, seven multi-select failure tags, comments, and `unreviewed` / `reviewing` / `completed` states.
- Save, refresh restore, and update behavior through browser `localStorage`.
- Case, model, effective-status, and failure-tag filters.
- Completed-only model analytics, deterministic ranking, and per-case comparison.
- Validate-then-replace JSON import, complete JSON export, reset to the immutable built-in seed, and Markdown report generation.

## Quick Start

Requirements: a current Node.js/npm installation.

```text
npm install
npm run dev
```

Vite prints the local URL to open in a browser. Verification commands are:

```text
npm test
npm run build
```

These are the scripts present in `package.json`; there is no backend startup, Docker command, deployment URL, or CI command.

## Human Review Workflow

1. Start with the built-in seed or import a complete evaluation bundle.
2. Select a case and inspect its question, reference answer, values, cutoff time, risks, and self-contained evidence.
3. Compare any subset of the four answers; at least one model remains visible.
4. Score the answer, choose zero or more failure tags, add a comment, and choose a status.
5. Save a partial review as `reviewing`, or provide all five scores before saving `completed`.
6. Reopen or refresh the page to restore and edit the same `(case_id, model_id)` review.
7. Use Review Records and Analytics to filter results and inspect completed-only rankings.
8. Export JSON or generate a Markdown report. Reset and import both require explicit confirmation where data would be replaced.

## Scoring Rules

Every completed review has five equally weighted dimensions:

| Dimension | Range | Weight |
| --- | ---: | ---: |
| `numeric_accuracy` | 1–5 | 20% |
| `evidence_quality` | 1–5 | 20% |
| `freshness` | 1–5 | 20% |
| `safety_compliance` | 1–5 | 20% |
| `answer_quality` | 1–5 | 20% |

The normalized total is `total = 4 * sum(five scores)`. Only `completed` reviews enter analytics and ranking. Failure tags are diagnostic and cause no additional score deduction. A model with zero completed reviews displays `N/A`, not `0`. Ranking is overall score descending, then `model_id` ascending for ties.

## Failure Tags

Failure tags are multi-select diagnostic metadata, not additional penalties:

- `numeric_error`
- `unit_error`
- `invalid_citation`
- `future_data`
- `missed_risk`
- `unsupported_trading_advice`
- `improper_causality`

## Data Model

The canonical `EvaluationBundle` contains:

- `meta`: schema version `1.0`, dataset identity/name, and export timestamp.
- `models`: the four model definitions.
- `cases`: questions, reference answers/values, allowed evidence, cutoffs, and risk labels.
- `responses`: one answer per case/model pair, citations, and generation time.
- `reviews`: scores, failure tags, comment, status, and review timestamp keyed by `(case_id, model_id)`.

Runtime Zod validation enforces uniqueness, references, timestamps, score/status/tag constraints, and completed-review completeness. The full frozen contract is in `docs/DATA_CONTRACT.md`.

## Architecture

```text
Built-in / Imported EvaluationBundle
                |
                v
           Pinia Store
          /           \
         v             v
 localStorage       Review UI
         \             /
          v           v
          pure services
 filtering / analytics / report / bundle I/O
```

- `domain` defines the runtime contract and constants.
- `services` contains pure business logic shared by the UI and generated report.
- `storage` is a thin `localStorage` boundary.
- `stores` contains the single mutable evaluation workspace.
- `components` contains presentation and interactions.

There is no duplicated report scoring formula inside Vue components.

## Persistence

Vue + Pinia + `localStorage` is sufficient for this local, single-browser, single-user, reproducible coding-assessment MVP. Not introducing a backend, database, or account system is an explicit scope decision, not a missing implementation. Corrupted persisted data falls back to a cloned built-in seed with a visible warning.

## Analytics & Ranking

The shared analytics service calculates completed-review coverage, per-model overall and five-dimension averages, failure-tag counts, deterministic ranking, and all four model results for every case. Partial and absent reviews remain visible as statuses but do not contribute totals.

## JSON Import / Export

Export creates a complete canonical bundle and refreshes `meta.exported_at`; transient UI state is excluded. Import parses and validates the entire file before showing a replacement confirmation. Invalid input leaves the current workspace unchanged; valid input atomically replaces and persists it. Import is replace-only—merge semantics and schema migration are outside MVP scope.

## Program-generated Report

The application downloads Markdown produced by `generateMarkdownReport()`, which calls the same analytics functions as the Analytics UI. The checked-in sample artifact is `docs/generated/financial-agent-evaluation-report.md`. Its input provenance is stated inside the report; its statistics were generated by the program and were not manually calculated or edited.

## Testing

The final Gate 6 verification passed 6 test files and 40 tests with `npm test`; `npm run build` also passed. Tests cover the schema and built-in cardinality, save/update/restore/reset/replace persistence, corrupted storage, filtering, completed-only analytics/ranking/tag counts, import validation/round trip, and report output.

Manual QA evidence for the end-to-end browser flow is recorded in `docs/FINAL_ACCEPTANCE.md`.

## Project Structure

```text
docs/                  frozen contracts, final acceptance, generated report, Agent records
src/components/        review, record, analytics, report, and data-management UI
src/data/              immutable built-in seed
src/domain/            constants, TypeScript types, and Zod schemas
src/services/          pure filtering, analytics, report, and bundle I/O
src/storage/           localStorage adapter
src/stores/            single Pinia evaluation store
src/test/              deterministic test fixture
```

## Design Decisions

- Equal weighting avoids unsupported scoring assumptions.
- Completed-only aggregation prevents partial reviews from distorting rankings.
- Failure tags explain diagnoses without double-penalizing scores.
- Validate-then-replace import keeps workspace semantics deterministic.
- Self-contained simulated evidence makes the assessment reproducible without network access.
- A small service/store/component split keeps rules testable without repository, factory, DI, router, or backend abstractions.

## Known Limitations / Non-goals

- Single browser and single user; no synchronization or review history.
- Browser storage is finite and can be cleared by the user/browser.
- No real external model APIs, live market data, authentication, backend, database, or deployment.
- Human scoring only; no LLM judge or automatic adjudication.
- Schema version `1.0` only; import is replace-only with no migration or merge.
- Element Plus is fully registered, so the production build emits a non-blocking large-chunk warning.

## Submission Artifacts

- Frozen requirements: `docs/PROJECT_SPEC.md`
- Frozen data contract: `docs/DATA_CONTRACT.md`
- Frozen acceptance checklist: `docs/ACCEPTANCE_CHECKLIST.md`
- Final acceptance evidence: `docs/FINAL_ACCEPTANCE.md`
- Program-generated report: `docs/generated/financial-agent-evaluation-report.md`
- Authentic Agent records and availability index: `docs/agent/`
