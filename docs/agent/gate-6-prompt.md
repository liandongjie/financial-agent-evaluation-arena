你现在负责 Financial Agent Evaluation Arena 的最终阶段：

# Gate 6 — Final Delivery & Acceptance

Repository:

`D:\nl2StockAnalysisDashboard`

当前已经完成并推送：

- Gate 0 — Requirements / Data Contract Freeze
- Gate 1 — Scaffold / Domain / Seed
- Gate 2 — Human Review Core Flow
- Gate 3 — Persistence / Filtering
- Gate 4 — Analytics / Ranking / Markdown Report
- Gate 5 — JSON Import / Export / Reset / Hardening

当前 baseline：

`8ff1d55 feat: add JSON import export and workspace reset`

Gate 6 的目标不是继续开发产品功能。

目标是：

> 把已经完成的 MVP 整理成一个可运行、可审阅、可验证、可复现、可提交的最终仓库。

---

## 1. Verify Baseline

开始前执行：
```text
git status --short --branch
git log --oneline -8
```

必须确认：
```text
branch = main
working tree = clean
HEAD = 8ff1d55...
```

如果工作区不干净，不要覆盖用户修改，停止并报告。

---

# 2. Audit Before Any Change

在修改文件前，完整阅读：
```text
docs/PROJECT_SPEC.md
docs/DATA_CONTRACT.md
docs/ACCEPTANCE_CHECKLIST.md

package.json

src/domain/
src/data/
src/services/
src/storage/
src/stores/
src/components/
src/App.vue
```

然后先对照 `ACCEPTANCE_CHECKLIST.md` 审计：
```text
Requirement 1–8
automated tests
manual QA
documentation/submission
anti-overengineering checks
```

先确定真实缺口，再修改。

不要把 Gate 6 当成重构阶段。

---

# 3. Explicit Gate 6 Non-goal

禁止为了“最终优化”增加任何新的产品能力。

不要实现：
```text
new evaluation feature
new analytics metric
chart library
backend
authentication
real model APIs
LLM judge
CSV
deployment
Docker
CI/CD
new persistence mechanism
router
schema migration
new import format
UI redesign
bundle-splitting refactor
```

除非 Final QA 发现当前 mandatory requirement 存在真实功能 Bug。

如果发现真实 Bug：
```text
report it
add smallest regression test
apply smallest fix
rerun acceptance
```

不要顺便重构。

---

# 4. README.md

当前根目录没有 README。

新增：
```text
README.md
```

README 必须基于真实实现，而不是模板化宣传。

至少包含：
```text
# Financial Agent Evaluation Arena

## Overview
## Features
## Quick Start
## Human Review Workflow
## Scoring Rules
## Failure Tags
## Data Model
## Architecture
## Persistence
## Analytics & Ranking
## JSON Import / Export
## Program-generated Report
## Testing
## Project Structure
## Design Decisions
## Known Limitations / Non-goals
## Submission Artifacts
```

---

# 5. README Accuracy Rules

README 中所有命令必须来自真实 `package.json`。

当前预计包括：
```text
npm install
npm run dev
npm test
npm run build
```

不要虚构：
```text
backend startup
Docker command
deployment URL
CI pipeline
```

如果最终测试数量发生变化，README 使用最终实际测试数量。

---

# 6. Explain Why There Is No Backend

README 中明确说明：

本项目是：
```text
local
single-browser
single-user
reproducible coding-assessment MVP
```

因此：
```text
Vue + Pinia + localStorage
```

足够满足当前需求。

不引入 backend/database/account system 是刻意的 scope decision，而不是遗漏。

---

# 7. Document Scoring Contract

README 必须准确记录五个维度：
```text
numeric_accuracy
evidence_quality
freshness
safety_compliance
answer_quality
```

每项：
```text
1–5
20% weight
```

总分：
```text
total = 4 * sum(five scores)
```

必须说明：
```text
only completed reviews enter analytics/ranking
failure tags are diagnostic and do not cause extra score deductions
zero completed reviews → N/A, not 0
```

---

# 8. Document Failure Tags

记录全部七个：
```text
numeric_error
unit_error
invalid_citation
future_data
missed_risk
unsupported_trading_advice
improper_causality
```

解释 Failure Tag：
```text
multi-select diagnostic metadata
```

不是额外扣分项。

---

# 9. Architecture Section

README 使用简单文字/ASCII diagram 即可。

说明真实数据流，例如：
```text
Built-in / Imported EvaluationBundle
          ↓
     Pinia Store
       ↙     ↘
localStorage  Review UI
          ↓
 pure services
 filtering / analytics / report / bundle I/O
```

说明：
```text
domain → runtime contract
services → pure business logic
storage → thin localStorage boundary
store → single mutable workspace
components → presentation/interactions
```

不要增加 diagram dependency。

---

# 10. Program-generated Submission Report

Gate 0 要求最终仓库必须包含一份程序生成的 Markdown report。

目标路径：
```text
docs/generated/financial-agent-evaluation-report.md
```

该文件必须通过实际应用中的：
```text
generateMarkdownReport()
```

生成。

不得手工计算或修改统计数字。

---

# 11. Report Input

优先使用当前真实/manual demo workspace 中已有的 completed reviews。

为了最终展示效果，报告最好能包含实际 scored model results，而不是全部 N/A。

但是：
```text
DO NOT modify seed-bundle.json
DO NOT hard-code HumanReviews into production seed
DO NOT fabricate a claim that reviews were performed by a human if they were not
```

如果没有可验证的 reviewed workspace：

- 不要编造历史人工 Review；
- 可以生成明确标注为 demo/sample evaluation 的程序报告；
- 在最终报告中如实说明输入来源。

Program-generated statistics must remain untouched after generation.

---

# 12. Verify Generated Report

读取最终 `.md` 文件，并确认至少包含：
```text
generation timestamp
schema version
completed-review coverage
four model entries/ranking
five dimension averages
failure-tag distribution
case-level comparison
completed-only ranking note
```

报告中的数字必须与应用 Analytics UI / shared analytics functions 一致。

---

# 13. Agent Interaction Records

题目要求：
```text
Authentic Agent interaction records
```

增加：
```text
docs/agent/
```

建议：
```text
docs/agent/README.md
docs/agent/INDEX.md
docs/agent/gate-6-prompt.md
docs/agent/gate-6-result.md
```

---

# 14. Authenticity Rule

非常重要：

**Do not fabricate or reconstruct earlier Agent conversations.**

不得根据：
```text
Git history
commit messages
current implementation
```

反向编造 Gate 1–5 的 Prompt 或 Response。

只记录：
```text
exact prompt/result text actually available to you
```

当前 Gate 6 Prompt 本身可以作为 authentic record，要求原样/忠实保存。

Gate 6 最终完成报告也可以保存为 authentic result record。

如果用户后续提供 Gate 1–5 的真实历史对话，可以再原样补入。

---

# 15. Agent INDEX

`docs/agent/INDEX.md` 可以列出开发 Gate 和 commit mapping：
```text
Gate 0 → c497272
Gate 1 → 6c5d775
Gate 2 → 6b797cb
Gate 3 → 6920c10
Gate 4 → 8d5afd2
Gate 5 → 8ff1d55
Gate 6 → pending
```

但是：
```text
commit mapping != conversation transcript
```

不要把 Git history 冒充 Agent records。

对没有真实 transcript 文件的 Gate，应明确标记：
```text
exact transcript not stored in repository
```

不要补写虚假内容。

---

# 16. Final Acceptance Evidence

不要修改 Gate 0 冻结合同的含义。

优先新增：
```text
docs/FINAL_ACCEPTANCE.md
```

而不是重写 `PROJECT_SPEC.md` / `DATA_CONTRACT.md`。

FINAL_ACCEPTANCE 应逐项映射 Requirement 到：
```text
PASS / FAIL
implementation evidence
automated-test evidence
manual-QA evidence where applicable
```

例如：
```text
Requirement 5 — PASS
Implementation:
- src/stores/evaluation.ts
- src/storage/workspaceStorage.ts

Automated:
- evaluation.test.ts restore tests

Manual:
- save → refresh → edit verified
```

---

# 17. Acceptance Scope

至少覆盖：
```text
A. Built-in dataset
B. Side-by-side comparison
C. Five scoring dimensions
D. Failure tags
E. Comment/review status
F. Save/restore/modify
G. Analytics/ranking
H. Filtering/case results
I. JSON import/export
J. Program-generated report
K. Automated tests
L. Build/manual QA
M. Documentation/submission
N. Anti-overengineering
```

不要简单写：
```text
Everything PASS
```

必须给证据。

---

# 18. Final End-to-End Manual QA

使用真实应用执行一次完整用户路径。

至少验证：
```text
1. Start from built-in seed
2. Select a case
3. Review model responses
4. Save partial reviewing review
5. Save completed review
6. Refresh
7. Review restores
8. Edit saved review
9. Filters reflect current state
10. Analytics/ranking update
11. Generate Markdown report
12. Export JSON
13. Reset to seed
14. Import exported JSON
15. Confirm replacement
16. Refresh
17. Imported state restores
18. Analytics/report still reflect restored workspace
```

记录真实结果到 `FINAL_ACCEPTANCE.md`。

不要增加 permanent E2E framework。

临时浏览器 test files 必须删除。

---

# 19. Console QA

在完整用户路径中确认：
```text
no uncaught Vue/runtime errors
```

已知非业务资源问题如果存在可以记录为 Known Limitation，但不要因此扩大 scope。

---

# 20. Final Automated Verification

实际执行：
```text
npm test
npm run build
git diff --check
```

记录：
```text
actual test files count
actual test count
actual build result
```

不要复制以前 Gate 的旧数字。

---

# 21. Optional Clean Install Check

如果环境允许且不会破坏用户工作：
```text
npm ci
npm test
npm run build
```

可作为 reproducibility check。

如果不执行，最终报告中不要声称执行过。

不要修改 lockfile 仅为了这个检查。

---

# 22. Repository Hygiene

检查：
```text
git status --short
git diff --stat
git ls-files
```

确保最终提交不包含：
```text
dist/
node_modules/
.playwright-cli/
temporary downloads
temporary JSON exports
browser artifacts
logs
cache files
```

除非某文件是明确要求的 submission artifact。

---

# 23. Secret Check

检查 tracked source/docs 中没有真实：
```text
API keys
tokens
passwords
.env secrets
credentials
```

本项目理论上不需要任何 secret。

不要输出用户机器中的其他秘密文件。

只检查当前 repository tracked/worktree content。

---

# 24. Known Limitations

README / FINAL_ACCEPTANCE 如实记录当前已知限制，例如真实存在时：
```text
single-browser / single-user localStorage
no real external model APIs
manual human scoring, no LLM judge
schema version 1.0 only
no multi-user sync
Element Plus full registration causes non-blocking bundle-size warning
```

不要把 deliberate non-goals 写成严重 Bug。

---

# 25. Repository Name Mismatch

当前 repository 名：
```text
nl2StockAnalysisDashboard
```

产品：
```text
Financial Agent Evaluation Arena
```

Gate 0 已记录这个 naming mismatch。

本 Gate：
```text
report it as final housekeeping item
```

不要自行执行 GitHub repository rename 或 remote URL mutation。

这属于用户控制的外部操作。

---

# 26. Do Not Add Nice-to-have Features

即使剩余时间允许，也不要在 Gate 6 主任务中新增：
```text
favicon polishing
UI redesign
new charts
responsive redesign
performance refactor
Element Plus tree shaking
GitHub Actions
Docker
deployment
new tests solely for coverage percentage
```

除非它修复 mandatory acceptance blocker。

---

# 27. Final Git Rules

开发过程中：
```text
do not commit
do not push
```

完成所有 Gate 6 工作后保留修改供 ChatGPT 独立 Review。

用户确认后再 commit/push。

---

# 28. Final Report to User

完成后只汇报：

## A. Repository State

branch、HEAD、working tree。

## B. Final Gaps Found

Audit 开始时发现了哪些真实 Gate 6 缺口。

## C. Files Added/Changed

逐文件说明。

## D. README

说明覆盖了哪些内容。

## E. Generated Report Artifact

说明：
```text
path
generation method
input source
coverage
```

并确认没有手工修改统计。

## F. Agent Records

列出实际保存的 authentic records。

明确：
```text
which gates have exact transcripts
which do not
```

不得声称不存在的记录。

## G. Acceptance Results

总结 Requirement 1–8 和最终 acceptance 状态。

## H. Manual E2E QA

逐项真实结果。

## I. Automated Verification

报告实际：
```text
npm test
npm run build
git diff --check
```

结果与数量。

## J. Repository Hygiene

说明 temporary files / secrets / generated build files 检查结果。

## K. Known Limitations

只列真实限制。

## L. Remaining User-owned Final Actions

例如：
```text
optional GitHub repository rename
adding older authentic Agent transcripts if user has exact originals
final commit/push after review
```

完成后停止。

不要开始新的功能开发。
