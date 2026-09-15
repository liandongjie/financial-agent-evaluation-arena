# Post-Gate 6 中文化收尾 — Agent Record

This file preserves the prompt supplied to Codex and the result returned after the final presentation-copy polish. It is an authentic post-Gate 6 interaction record and is not reconstructed from Git history.

## Prompt

```text
你现在只负责 Financial Agent Evaluation Arena 的最后一轮：

# UI 中文化收尾 / Presentation Copy Polish

Repository:

D:\nl2StockAnalysisDashboard

当前项目已经完成全部功能和前一轮 UI/IA polishing。

本轮不是功能开发，也不是重新设计 UI。

唯一目标：

> 让中文评测工作台中的用户可见文案保持一致，避免把内部技术字段、英文数据字段和 raw IDs 当成主要产品文案展示。

非常重要：

- 只修改 presentation layer；
- 不修改任何业务逻辑；
- 不修改任何数据结构；
- 不修改任何 frozen contract；
- 不修改 seed；
- 不修改 analytics / filtering / persistence / import-export 语义；
- 不增加任何依赖；
- 不做新的 UI 结构调整。

---

## 1. Baseline

开始前先执行：

git status --short --branch
git log --oneline -5

如果 working tree 中存在用户未提交修改：

不要覆盖；
先确认这些修改是否正是上一轮 polishing 的预期修改。

不要 reset / checkout / clean 用户修改。

---

## 2. Read Before Editing

先阅读：

src/App.vue

src/domain/constants.ts

src/components/ReviewRecordsPanel.vue
src/components/AnalyticsPanel.vue
src/components/DataPanel.vue
src/components/ResponseReviewCard.vue
src/components/ModelVisibilityControl.vue
src/components/CaseContextPanel.vue

只关注：

- 用户可见文案；
- display label；
- technical ID 的展示层级。

不要先改业务代码。

---

# 3. Language Principle

本项目最终界面面向中文评测人员。

统一原则：

## 用户产品语言

优先中文：

- 页面标题
- Tab
- 表头
- 筛选标签
- 状态
- 按钮
- 提示语
- 数据摘要
- Analytics 标题
- Case 概念

## 可以保留的标准技术词

以下无需强行翻译：

JSON
Markdown
ID

产品正式名称：

Financial Agent Evaluation Arena

也可以保留。

## 不应该作为主要 UI 文案的内部技术字段

例如：

case-revenue-margin
case-liquidity
reviewed_at
Dataset
Schema
Cases
Models
Responses
Reviews
Failure Tag
Case ID

这些需要做 presentation-level 中文化或降级展示。

---

# 4. Do Not Change Underlying Values

绝对不要修改：

case_id

例如：

case-revenue-margin
case-liquidity
case-dividend-cutoff
case-acquisition-causality
case-valuation-advice

不要修改：

model_id

iwencai
doubao
qwen
yuanbao

不要修改：

numeric_accuracy
evidence_quality
freshness
safety_compliance
answer_quality

不要修改：

failure tag enum values

不要修改：

ReviewStatus values

不要修改任何 schema / JSON contract。

这轮只改变“用户看到什么”，不改变“程序存什么”。

---

# 5. Case → 评测样例

所有用户可见的：

Case

统一优先改成：

评测样例

例如：

选择评测 Case
→ 选择评测样例

按 Case 筛选
→ 按评测样例筛选

Case 四模型对比
→ 评测样例四模型对比

Case ID
→ 评测样例

不要改代码中的：

caseId
case_id

变量名。

---

# 6. Raw Case ID Must Not Be Primary UI Text

这是本轮重点。

当前类似：

case-revenue-margin

不能继续作为用户主要看到的标题。

优先展示：

evaluationCase.question

或其截断后的问题摘要。

例如 Review Records 中：

当前可能是：

case-revenue-margin
截至 2025 年第三季度，星海科技……

调整为：

截至 2025 年第三季度，星海科技……
ID: case-revenue-margin

其中：

- question 是主信息；
- case_id 是弱化的辅助信息；
- case_id 使用更小、更浅的样式；
- 如果空间不够，也可以只在 tooltip 中保留完整 ID。

不要新增 title 字段。
不要修改 seed/schema。

---

# 7. Analytics Case Display

Analytics 的“评测样例四模型对比”中：

不要只显示：

case-revenue-margin

应优先显示对应的中文 question / question 摘要。

可以在组件展示层通过：

workspace.cases

根据 caseId 找到对应 question。

这是 presentation lookup，
不要修改 buildAnalyticsSnapshot() 数据结构，
不要修改 analytics service。

必要时：

主显示：
问题摘要

辅助：
ID: case-revenue-margin

---

# 8. Model Display

用户界面主展示统一使用：

model.display_name

即：

同花顺问财
豆包
千问
元宝

不要在普通表格中只显示：

iwencai
doubao
qwen
yuanbao

model_id 可以：

- 隐藏；
- 或作为小号灰色辅助信息。

例如：

豆包
doubao

但主视觉必须是：

豆包

不要修改 model_id。

---

# 9. Review Records Copy

检查 ReviewRecordsPanel.vue。

至少统一：

Case
→ 评测样例

reviewed_at
→ 评审时间

Failure Tag / Failure Tags
→ 问题标签

Review Status
→ 评审状态

Comment
→ 评论

如果已经是中文，不要重复改。

Case cell：

question 主显示；
case_id 降级为 secondary metadata。

---

# 10. Analytics Copy

检查 AnalyticsPanel.vue。

统一：

Failure Tag 分布
→ 问题标签分布

Case 四模型对比
→ 评测样例四模型对比

Case ID
→ 评测样例

Five-dimension / raw English titles
→ 已有中文则保持

模型列：

优先 display_name。

不要改变：

ranking
score calculation
coverage
completed-only behavior
N/A semantics

---

# 11. Data Management Copy

检查 DataPanel.vue。

将用户可见：

Dataset
→ 数据集

Schema
→ 数据版本

Cases
→ 评测样例

Models
→ 模型

Responses
→ 模型回答

Reviews
→ 评审记录

恢复内置 Seed
→ 恢复初始数据

确认文案：

当前保存的评审和导入数据将被清除，并恢复内置 Seed。

改为：

当前保存的评审和导入数据将被清除，并恢复系统初始数据。

Import confirmation 中：

5 Cases / 4 Models / 20 Responses / 2 Reviews

改为类似：

5 个评测样例 / 4 个模型 / 20 条模型回答 / 2 条评审记录

底层：

seedBundle
schema_version
models
responses
reviews

全部不改。

---

# 12. Failure Tag Labels

当前如果已经存在共享：

FAILURE_TAG_LABELS

必须继续复用。

不要新增另一套 mapping。

用户界面统一显示：

numeric_error
→ 数字错误

unit_error
→ 单位错误

invalid_citation
→ 引用无效

future_data
→ 使用未来数据

missed_risk
→ 风险漏报

unsupported_trading_advice
→ 无依据买卖建议

improper_causality
→ 因果关系表述不当

不要在 UI 中展示 raw enum，除非明确作为 debug / ID 信息。

---

# 13. Score / Status Labels

继续复用现有：

SCORE_DIMENSION_LABELS
REVIEW_STATUS_LABELS

不要复制 label mapping。

五维显示：

数字正确性
引用与证据
数据时效性
安全合规
回答质量

状态显示：

未评审
评审中
已完成

底层 enum 不变。

---

# 14. Keep Standard Technical Terms

不要机械翻译：

JSON
Markdown
ID

例如：

导出 JSON
导入 JSON
生成 Markdown 报告

可以保持。

不要为了“全中文”改成生硬翻译。

---

# 15. Product Name

以下正式产品名可以保留英文：

Financial Agent Evaluation Arena

如果当前副标题已有：

金融 Agent 人工评测工作台

保持即可。

不要为了本轮任务重新做品牌标题。

---

# 16. ARIA / Accessibility Labels

如果用户可见文案已经中文化，
相关 aria-label 也尽量与用户语言一致。

例如：

按 Case 筛选
→ 按评测样例筛选

但不要为了这一点重构组件。

---

# 17. Strict Scope

本轮禁止：

改 Tab 结构
改布局
改分页逻辑
改 Analytics empty state
改 Review Card density
新增 Case title field
修改 seed
修改 schema
修改 analytics.ts
修改 filtering.ts
修改 store
修改 localStorage
修改 JSON import/export service
修改 report statistics
新增 helper service
新增 Pinia store
新增 dependency
新增 Router
新增 tests solely for wording

如果只需要 constants + Vue component presentation 修改，
就保持在这个范围内。

---

# 18. Generated Report / Documentation

本轮目标是网站 UI 中文化。

不要修改：

docs/*
generated Markdown report
README
FINAL_ACCEPTANCE
Agent records

不要修改：

src/services/report.ts

除非现有网站按钮本身需要文案调整，
但报告文件正文不属于本轮 scope。

---

# 19. Manual Visual QA

实际启动浏览器检查：

## 评审 Tab

确认没有明显工程字段作为主要 UI 文案：

Case
Failure Tag
reviewed_at
raw case_id

如果 technical ID 存在：

必须处于辅助视觉层级。

## 评审记录 Tab

确认：

- “评测样例”替代“Case”
- question 为主要识别信息
- case_id 不抢视觉
- “评审时间”替代 `reviewed_at`
- 问题标签中文
- 模型显示中文名

## 评测分析 Tab

确认：

- 模型排行榜显示中文模型名
- 五维表显示中文模型名
- 问题标签分布无 raw enum
- “评测样例四模型对比”无 Case/Case ID 英文主标签
- raw case_id 不作为主要展示内容

## 数据管理 Tab

确认：

数据集
数据版本
评测样例
模型
模型回答
评审记录

以及：

恢复初始数据

Import/Reset 文案自然中文。

---

# 20. Search Audit

完成后搜索 src 下的用户界面字符串：

Case
Case ID
Failure Tag
Dataset
Schema
Cases
Models
Responses
Reviews
reviewed_at
Seed

逐个判断：

- 是否是用户可见文本；
- 是否只是代码变量 / enum / technical value。

只修改前者。

不要机械 search-replace 代码标识符。

---

# 21. Regression

实际执行：

npm test
npm run build
git diff --check

当前期望：

6 test files
40 tests

必须全部 PASS。

Build 的已有 chunk-size warning 不属于本轮 scope。

---

# 22. Git

不要 commit。
不要 push。

保留 working tree 给 ChatGPT 独立 review。

---

# 23. Final Report

完成后只报告：

## A. Repository State

branch / HEAD / files changed

## B. User-facing English Removed

列出：

Case
Failure Tag
reviewed_at
Dataset
Schema
Cases
Models
Responses
Reviews
Seed

哪些已处理。

## C. Technical Identifiers Preserved

确认：

case_id
model_id
enum values
schema fields

全部未改。

## D. Case Presentation

说明：

question 如何成为主要显示；
case_id 如何被降级。

## E. Model Presentation

说明：

display_name 如何成为主显示；
model_id 是否仍作为辅助信息。

## F. Files Changed

逐文件说明。

## G. Manual QA

说明四个 Tab 实际检查结果。

## H. Verification

npm test
npm run build
git diff --check

真实结果。

## I. Scope Audit

明确：

Business logic — NOT CHANGED
Schema — NOT CHANGED
Seed — NOT CHANGED
Services — NOT CHANGED
Store — NOT CHANGED
Docs — NOT CHANGED
Dependencies — NOT ADDED

完成后停止。
```

## Result

```text
## A. Repository State

- Branch：`main`
- HEAD：`bb43298a5d66e2e9821e65fd694bfc57b8f1bb90`
- Working tree：保留 8 个上一轮及本轮预期修改文件，无额外未跟踪文件
- 未 commit，未 push

## B. User-facing English Removed

已处理：

- `Case` → `评测样例`
- `Case ID` → `评测样例`
- `Failure Tag` → `问题标签`
- `reviewed_at` → `评审时间`
- `Dataset` → `数据集`
- `Schema` → `数据版本`
- `Cases` → `评测样例`
- `Models` → `模型`
- `Responses` → `模型回答`
- `Reviews` → `评审记录`
- `Seed` → `初始数据`

JSON、Markdown、ID 和正式产品名保持不变。

## C. Technical Identifiers Preserved

以下底层内容均未修改：

- `case_id`
- `model_id`
- Score dimension enum values
- Failure tag enum values
- Review status values
- Schema / JSON 字段

搜索中残留的 `reviewed_at`、`resetToSeed` 等均为代码或数据字段，不是用户界面标签。

## D. Case Presentation

- 评审记录和分析表格均以中文问题摘要作为主要识别信息。
- 完整问题通过 tooltip 保留。
- `case_id` 以更小、更浅的 `ID: case-*` 辅助信息展示，不再作为主标题。
- 未新增 Case title 字段，未修改 seed 或 Analytics snapshot。

## E. Model Presentation

- 普通表格和分析表格均优先显示 `model.display_name`，例如“豆包”“千问”。
- `model_id` 仅作为小号灰色辅助信息。
- 四个模型 ID 和底层关联语义保持不变。

## F. Files Changed

本轮新增文案调整：

- src/App.vue：评测样例选择器及 aria-label 中文化。
- src/components/ReviewRecordsPanel.vue：筛选、表头、Case 信息层级及问题标签文案统一。
- src/components/AnalyticsPanel.vue：中文标题、模型名称展示及评测样例问题摘要 lookup。
- src/components/DataPanel.vue：摘要、导入确认、重置确认及初始数据文案中文化。

Working tree 中另外四个文件属于上一轮预期 UI/IA polishing，本轮未继续修改其逻辑：

- `ModelVisibilityControl.vue`
- `ReportPanel.vue`
- `ResponseReviewCard.vue`
- `domain/constants.ts`

## G. Manual QA

真实浏览器检查结果：

- 评审：选择器显示“评测样例”；四模型中文名称为主显示；评分、状态和问题标签均为中文。
- 评审记录：问题摘要为主信息，Case ID 为弱化辅助信息；模型、评审时间、状态和问题标签均为中文。
- 评测分析：排行榜和五维表使用中文模型名；问题标签分布无 raw enum；评测样例对比使用中文问题摘要。
- 数据管理：摘要标签全部中文；导入确认显示中文数量单位；重置文案为“恢复系统初始数据”。
- 无 Vue/runtime 异常；控制台仅存在既有的 `favicon.ico` 404。
- QA 临时浏览器文件及构建目录已清理。

## H. Verification

- `npm test`：PASS，6 个 test files，40 个 tests 全部通过。
- `npm run build`：PASS；仅有既存的 chunk-size warning。
- `git diff --check`：PASS；仅输出 Git 的 LF/CRLF 工作区提示。
- `dist`、`.playwright-cli`：均已清理。
- 未产生截图、下载 JSON 或 Markdown 报告文件。

## I. Scope Audit

- Business logic — NOT CHANGED
- Schema — NOT CHANGED
- Seed — NOT CHANGED
- Services — NOT CHANGED
- Store — NOT CHANGED
- Docs — NOT CHANGED
- Dependencies — NOT ADDED
- Commit — NOT CREATED
- Push — NOT PERFORMED
```
