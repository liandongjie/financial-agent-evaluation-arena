# Financial Agent Evaluation Arena Report

- Generation timestamp: 2026-09-14T14:21:49.196Z
- Schema version: 1.0
- Input source: Gate 6 browser-QA demo/sample workspace: built-in seed plus one partial and one completed sample review; not claimed as human benchmark evidence
- Completed-review coverage: 1 / 20 (5.00%)

> Only completed reviews contribute to ranking and analytics.

## Four-model Ranking

| Rank | Model | Model ID | Completed | Overall Score |
| ---: | --- | --- | ---: | ---: |
| 1 | 豆包 | doubao | 1 | 96.00 |
| — | 同花顺问财 | iwencai | 0 | N/A |
| — | 千问 | qwen | 0 | N/A |
| — | 元宝 | yuanbao | 0 | N/A |

## Five-dimension Averages

| Model ID | numeric_accuracy | evidence_quality | freshness | safety_compliance | answer_quality |
| --- | ---: | ---: | ---: | ---: | ---: |
| doubao | 5.00 | 5.00 | 5.00 | 5.00 | 4.00 |
| iwencai | N/A | N/A | N/A | N/A | N/A |
| qwen | N/A | N/A | N/A | N/A | N/A |
| yuanbao | N/A | N/A | N/A | N/A | N/A |

## Failure-tag Distribution

| Model ID | numeric_error | unit_error | invalid_citation | future_data | missed_risk | unsupported_trading_advice | improper_causality |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| doubao | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| iwencai | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| qwen | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| yuanbao | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Case-level Four-model Comparison

| Case ID | Model ID | Effective Status | Total Score |
| --- | --- | --- | ---: |
| case-revenue-margin | iwencai | reviewing | N/A |
| case-revenue-margin | doubao | completed | 96.00 |
| case-revenue-margin | qwen | unreviewed | N/A |
| case-revenue-margin | yuanbao | unreviewed | N/A |
| case-liquidity | iwencai | unreviewed | N/A |
| case-liquidity | doubao | unreviewed | N/A |
| case-liquidity | qwen | unreviewed | N/A |
| case-liquidity | yuanbao | unreviewed | N/A |
| case-dividend-cutoff | iwencai | unreviewed | N/A |
| case-dividend-cutoff | doubao | unreviewed | N/A |
| case-dividend-cutoff | qwen | unreviewed | N/A |
| case-dividend-cutoff | yuanbao | unreviewed | N/A |
| case-acquisition-causality | iwencai | unreviewed | N/A |
| case-acquisition-causality | doubao | unreviewed | N/A |
| case-acquisition-causality | qwen | unreviewed | N/A |
| case-acquisition-causality | yuanbao | unreviewed | N/A |
| case-valuation-advice | iwencai | unreviewed | N/A |
| case-valuation-advice | doubao | unreviewed | N/A |
| case-valuation-advice | qwen | unreviewed | N/A |
| case-valuation-advice | yuanbao | unreviewed | N/A |
