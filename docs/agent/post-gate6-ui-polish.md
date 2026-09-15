# Post-Gate 6 UI / IA Polish — Agent Record

This file preserves the prompt supplied to Codex and the result returned after the UI / information-architecture polish. It is an authentic post-Gate 6 interaction record and is not reconstructed from Git history.

## Prompt

```text
你现在负责 Financial Agent Evaluation Arena 的一次最终 Presentation Polish。

Repository:

D:\nl2StockAnalysisDashboard

GitHub:

https://github.com/liandongjie/financial-agent-evaluation-arena

当前本地基线应为：

bb43298 chore: finalize submission artifacts and acceptance

这是一个 post-Gate 6 UI / Information Architecture polish。

非常重要：

本轮不是新功能开发，不修改任何冻结业务规则、数据结构、评分公式、持久化语义、Import/Export 语义或 Analytics 计算逻辑。

目标是：

把目前“所有功能纵向平铺在一个超长页面”的工程 Demo，
调整成一个更清晰、更高效、更像成熟内部评测工具的工作台。

---

## 1. Baseline Verification

开始前执行：

git status --short --branch
git log --oneline -5
git remote -v

确认：

- branch = main
- HEAD = bb43298...
- 不覆盖用户已有未提交修改
- remote 指向：
  https://github.com/liandongjie/financial-agent-evaluation-arena

如果 working tree 不干净，停止并报告。

---

## 2. Audit Before Coding

先阅读当前实现，至少包括：

src/App.vue

src/components/CaseContextPanel.vue
src/components/ModelVisibilityControl.vue
src/components/ResponseReviewCard.vue
src/components/ReviewRecordsPanel.vue
src/components/AnalyticsPanel.vue
src/components/ReportPanel.vue
src/components/DataPanel.vue

src/stores/evaluation.ts
src/services/filtering.ts
src/services/analytics.ts
src/domain/constants.ts

不要先写代码。

先确认当前 UI 是如何组织：

Review workspace
→ Review Records
→ Analytics
→ Report
→ Data

以及这些组件当前依赖的状态和业务逻辑。

---

# 3. Product Problem to Solve

当前功能完整，但信息架构存在以下问题：

1. Review / Records / Analytics / Report / Data 全部纵向平铺，
   页面非常长。

2. 核心任务是 Human Review，但低频管理和分析内容与主任务处于同一级。

3. Review Records 默认展示 20 个逻辑 slot，
   页面高度过大。

4. 当 completed reviews = 0 时，
   Analytics 仍然展示大量 N/A 表格，信息噪声较高。

5. Analytics / Records 中存在较明显的中英文混用，
   以及 failure-tag raw key 直接作为 UI Label 的情况。

6. 四模型 Review Card 信息结构正确，但整体垂直密度略低。

本轮只解决这些 Presentation / IA 问题。

---

# 4. Primary Information Architecture

将当前超长单页改造成一个轻量的四 Tab 工作台。

必须使用现有 Element Plus。

不要引入 Vue Router。

建议结构：

Financial Agent Evaluation Arena
金融 Agent 人工评测工作台

[ 评审 ] [ 评审记录 ] [ 评测分析 ] [ 数据管理 ]

其中：

## 评审

包含：

- Case selector
- Reference context
- Model visibility
- 四模型 side-by-side responses
- Human review controls

## 评审记录

只包含：

- filters
- review-record table
- pagination

## 评测分析

包含：

- coverage
- leaderboard
- five-dimension comparison
- failure-tag distribution
- per-case comparison
- Markdown report generation

ReportPanel 应作为 Analytics 的一个操作区，
不要再作为独立一级页面区块。

## 数据管理

包含：

- dataset summary
- Export JSON
- Import JSON
- Reset

---

# 5. Tab State

Tab state 是纯 UI transient state。

使用 App.vue 本地 ref 即可，例如：

activeSection

不要：

- 新建 Pinia Store；
- Persist tab；
- 写入 localStorage；
- 引入 Router；
- 修改 EvaluationBundle。

默认 Tab：

评审

---

# 6. Review Workspace Header

当前页面顶部标题过大，占用较多工作空间。

对 Header 做轻量收口：

当前：

Human Review Workspace
Financial Agent Evaluation Arena

建议视觉层级调整为：

Financial Agent Evaluation Arena
金融 Agent 人工评测工作台

要求：

- 主标题仍然清晰，但明显比当前更紧凑；
- 不做 Landing Page 风格的大 Hero；
- 不使用复杂渐变、背景图、动画；
- 保持专业后台工具风格。

Case selector 应仅出现在“评审”Tab 的工作区中，
不要在 Records / Analytics / Data 页面持续占用顶部空间。

---

# 7. Preserve Four-model Side-by-side Comparison

非常重要：

桌面端四模型并排是本产品核心特征。

不要改为：

- one-model tabs；
- carousel；
- modal；
- accordion。

在常见桌面宽度下继续：

iwencai | doubao | qwen | yuanbao

四列并排。

不要改变：

- Model visibility semantics；
- 至少保留一个模型；
- review identity；
- save/update behavior。

---

# 8. Model Visibility Visual Weight

当前 model visibility controls 视觉权重较高。

保持现有行为，但降低视觉权重。

可使用：

- lighter buttons；
- check-tag/chip-like appearance；
- active/inactive distinction；

但：

不要重新设计状态模型。

不要让 model selection 的视觉权重超过：

“保存评审”

等核心操作。

---

# 9. Review Card Density

保持 ResponseReviewCard 的业务结构：

answer
citations
scores
failure tags
comment
status
save

不要删除字段。

做轻量 compact polish：

- 适当减少 section vertical gap；
- 适当减少 card padding；
- 评分行更紧凑；
- Failure Tags 行距更紧凑；
- 保持文本可读性；
- 不把 UI 压缩成 dense spreadsheet。

目标：

相较当前截图，Review Card 高度合理下降，
但仍然容易阅读。

不要修改评分交互：

— / 1 / 2 / 3 / 4 / 5

保留数字 rubric，不改成 star rating。

---

# 10. Review Records Pagination

Review Records 当前一次展示 20 个逻辑 review slots，
导致页面非常长。

增加纯客户端 pagination。

要求：

默认：

pageSize = 10

分页对象作用于：

filtered review slots

流程：

all logical slots
→ existing filters
→ pagination slice

不要改变 filtering service 业务语义。

要求：

- filtering count 显示 filtered total；
- pagination 显示当前 filtered results；
- filter 改变后，如果当前页超出有效范围，应安全回到第一页；
- Clear filters 后仍然恢复全部 20 logical slots；
- 不引入服务端分页。

可以使用 Element Plus pagination。

---

# 11. Review Records Case Cell

不要在每行展示过长 Case Question。

保留必要识别信息，但压缩视觉高度。

建议：

第一行：

case_id / concise case label

第二行：

question 最多 1–2 行

可使用：

line clamp
ellipsis
tooltip

不要丢掉完整 question 数据。

不要修改 seed。

---

# 12. Analytics Empty State

这是本轮重点。

当：

completedReviewCount === 0

当前 UI 不要继续展示：

大量 N/A leaderboard
大量 N/A dimension table
大量 N/A per-case score table

此时保留：

- Analytics 标题；
- Coverage：0 / total；
- 一个明确 empty state。

建议文案：

暂无已完成评审

完成至少 1 条评审后，这里将展示模型排名、五维评分和 Failure Tag 分布。

不需要新增业务逻辑。

一旦：

completedReviewCount > 0

恢复展示当前已有：

- leaderboard；
- dimensions；
- failure distribution；
- per-case comparison。

Analytics 数据来源仍然必须：

buildAnalyticsSnapshot(workspace)

不要复制或重新计算任何公式。

---

# 13. Analytics + Report Integration

Markdown Report 是 Analytics 的输出形式。

将 ReportPanel 与 Analytics 视觉上整合。

推荐：

Analytics 页面标题区域右侧：

[生成并下载 Markdown 报告]

不要再在 Analytics 下方单独占一个巨大的 Report Card。

可以：

- 复用 ReportPanel；
- 或只调整其 layout/composition；

但不要复制 report download implementation。

仍然必须调用现有：

generateMarkdownReport()

---

# 14. UI Language Consistency

产品展示文案优先使用中文。

Technical identifiers 可继续保留英文。

例如：

Leaderboard
→ 模型排行榜

Five-dimension Comparison
→ 五维评分对比

Completed-review Coverage
→ 评审完成度

Per-case Four-model Comparison
→ Case 四模型对比

Review Status
→ 评审状态

Comment
→ 评论

技术 ID 可以继续显示：

iwencai
doubao
qwen
yuanbao

case-revenue-margin

---

# 15. Failure-tag Display Labels

不要直接把 raw enum key 当最终 UI label，例如：

unsupported_trading_advice

UI 应使用人类可读标签：

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

非常重要：

先搜索项目里是否已经存在统一 label mapping。

如果存在：

必须复用。

不要在 AnalyticsPanel / ResponseReviewCard / ReviewRecordsPanel
分别重复定义 label map。

如果不存在，才允许增加一个最小共享 presentation label mapping。

不要修改 FailureTag enum/value 本身。

---

# 16. Score Dimension Labels

同样：

底层字段继续：

numeric_accuracy
evidence_quality
freshness
safety_compliance
answer_quality

UI 显示：

数字正确性
引用与证据
数据时效性
安全合规
回答质量

先复用现有 label mapping。

不要修改 schema field names。

---

# 17. Data Panel

DataPanel 当前信息结构基本合理。

只需要：

放入“数据管理”Tab。

不要继续扩展：

- storage usage；
- version history；
- backup；
- CSV；
- cloud sync。

---

# 18. Visual Style Constraints

保持当前设计语言：

- 浅灰页面背景；
- 白色 card；
- 蓝色 primary action；
- 绿色 valid evidence；
- 橙色 risk；
- 红色 destructive/reset/invalid state。

不要：

- 添加渐变背景；
- neon；
- glassmorphism；
- 大面积阴影；
- 复杂动画；
- marketing landing-page style。

这是：

professional internal evaluation workspace

不是 consumer product landing page。

---

# 19. Responsive Scope

本项目主要面向桌面评审工作台。

重点检查：

1440px
1680px

桌面宽度。

要求：

- 四模型 card 不发生意外重叠；
- 表格不出现关键字段不可读；
- failure-tag heading 不出现 raw key 被截成难读文本；
- tabs 清晰可见。

不要为了移动端完全重写四模型比较。

现有基础 responsive behavior 保持即可。

---

# 20. Business Logic Freeze

本轮禁止修改以下语义：

EvaluationBundle schema
Review status rules
score calculation
20% equal weighting
completed-only analytics
failure-tag counting
ranking
filter AND semantics
localStorage behavior
review upsert identity
JSON import/export
reset
Markdown report statistics
seed dataset
model responses
evidence
case contents

不要修改这些测试的 expected business result，
除非仅因为展示组件重构导致 UI test fixture adjustment，
且必须报告。

---

# 21. Architecture Constraints

不要增加：

Vue Router
new Pinia store
new analytics service
new filtering service
chart library
CSS framework
new UI framework
state machine
backend
API
database
generic component framework

尽量在：

App.vue
existing components
existing constants/style

范围内完成。

如果需要新增一个非常小的 presentation-only helper，
必须说明必要性。

---

# 22. Tests

保留当前全部：

40 tests

全部通过。

本轮主要是 UI/IA polish，
不要为了 coverage 数字机械增加大量测试。

只有新增的逻辑行为值得测试，例如：

pagination pure helper（如果你选择抽纯函数）

或者：

已有组件相关的可测试纯逻辑。

不要安装：

Playwright
Cypress
Testing Library

作为永久依赖。

---

# 23. Manual Browser QA

这是本轮最重要的验证。

实际启动应用并用浏览器验证：

## Review Tab

- 默认进入 Review；
- Case selector 正常；
- Reference context 正常；
- 四模型同时显示；
- hide/show model 正常；
- save reviewing 正常；
- save completed 正常；
- refresh restore 正常。

## Records Tab

- 初始 20 logical slots；
- 默认只显示第一页；
- pagination 可翻页；
- Case filter 正常；
- combined filter 正常；
- filter 后 pagination 不越界；
- clear filters 恢复全部 20。

## Analytics Tab

Seed 初始状态：

- Coverage = 0 / 20；
- 显示 Empty State；
- 不出现一大片 N/A 表格。

创建 completed review 后：

- Empty State 消失；
- leaderboard 出现；
- dimension averages 出现；
- failure distribution 出现；
- case comparison 出现；
- 数据与 Gate 4 semantics 一致；
- Markdown report download 正常。

## Data Tab

- summary 正常；
- Export 正常；
- Import confirm 正常；
- Reset confirm 正常。

## Cross-tab

切换 Tabs：

- 不丢失未重新加载的 Store 状态；
- saved reviews 不丢失；
- filters/pagination 不造成业务数据 mutation。

---

# 24. Visual QA

浏览器重点检查：

- 页面不再是极长单页；
- 评审是默认且视觉上最主要的任务；
- Records / Analytics / Data 不再干扰主 Review Flow；
- Header 高度明显合理；
- 四模型卡片密度优于原版；
- 中英文标签一致；
- Analytics failure tag 不再显示长 raw enum；
- empty state 清晰；
- 无水平 overflow；
- console 无 Vue/runtime error。

如果可以，记录最终页面关键状态截图用于自己的 QA，
但不要默认把临时截图提交到 repo。

---

# 25. Existing Documentation

本轮是 presentation polish。

不要修改：

docs/PROJECT_SPEC.md
docs/DATA_CONTRACT.md
docs/agent/gate-6-prompt.md
docs/agent/gate-6-result.md

除非发现当前 README / FINAL_ACCEPTANCE 因实际 UI 改动产生明显事实错误。

如果需要更新 README：

只做最小 current-state correction。

不要重写 Gate 0 历史。

---

# 26. Scope Audit

完成后明确确认：

Router — NOT ADDED
Chart library — NOT ADDED
Backend — NOT ADDED
New store — NOT ADDED
Business formulas — NOT CHANGED
Seed — NOT CHANGED
Import/export semantics — NOT CHANGED
Persistence semantics — NOT CHANGED

---

# 27. Verification

完成后执行：

npm test
npm run build
git diff --check
git status --short
git diff --stat

并检查：

没有：

dist
temporary browser files
screenshots unless explicitly required
downloaded JSON/report files
new dependencies
unrelated documentation changes

---

# 28. Git

不要 commit。

不要 push。

保留完整 working tree 给 ChatGPT 独立 Review。

---

# 29. Final Report

完成后按以下格式报告：

## A. Repository State

branch / HEAD / working tree

## B. UI Problems Addressed

说明实际解决了哪些：
long page
task hierarchy
records density
analytics empty state
language consistency
card density

## C. Files Changed

逐文件说明。

## D. Information Architecture

说明四 Tab 如何组织，
并确认未使用 Router / new Store。

## E. Review Workspace

说明四模型 comparison 是否完整保留。

## F. Review Records

说明 pagination 和 filtering interaction。

## G. Analytics

说明 zero-completed empty state 和 completed state。

## H. Language / Labels

说明 score/failure-tag display labels 如何统一，
是否复用了 existing mapping。

## I. Manual Browser QA

逐项真实结果。

## J. Automated Verification

npm test
npm run build
git diff --check

真实结果。

## K. Scope Audit

明确所有 non-goal 均未进入。

## L. Known Issues

只列真实剩余问题。

不要 commit/push。

完成后停止，不开始新的产品功能。
```

## Result

```text
## A. Repository State

- Branch：`main`
- HEAD：`bb43298a5d66e2e9821e65fd694bfc57b8f1bb90`
- 初始工作树：干净
- 最终工作树：8 个预期修改文件，无 untracked 文件
- 未 commit、未 push

## B. UI Problems Addressed

已解决：

- 超长单页改为四 Tab 工作台
- “评审”成为默认核心任务
- Records 默认每页 10 条
- Analytics 零 completed 时使用明确空状态
- Analytics、Records 和 Review Card 展示文案中文化
- Failure Tag raw key 改为中文标签
- Review Card padding、间距和评分区密度收紧
- Header 明显缩小，Case selector 仅存在于评审 Tab

## C. Files Changed

- src/App.vue：四 Tab IA、本地 `activeSection`、紧凑 Header、评审专属 Case selector。
- src/components/ReviewRecordsPanel.vue：客户端分页、页码复位、Case 文本截断与 tooltip、紧凑列宽。
- src/components/AnalyticsPanel.vue：零完成空状态、中文标题、Report 操作整合。
- src/components/ReportPanel.vue：收口为 Analytics 标题区下载操作，继续复用原实现。
- src/components/ResponseReviewCard.vue：卡片密度和中文标签调整。
- src/components/ModelVisibilityControl.vue：降低按钮视觉权重。
- src/components/DataPanel.vue：适配数据管理 Tab。
- src/domain/constants.ts：统一已有 score/status/failure-tag 展示映射，未修改底层值。

## D. Information Architecture

四个一级 Tab：

1. 评审
2. 评审记录
3. 评测分析
4. 数据管理

Report 已作为 Analytics 的操作入口。Tab 状态仅使用 `App.vue` 本地 `ref`。

- Router：未增加
- New Store：未增加
- Tab persistence：未增加

## E. Review Workspace

桌面端四模型并排完整保留：

`iwencai | doubao | qwen | yuanbao`

Case、reference context、model visibility、answer、citations、五维评分、问题标签、评论、状态及保存行为均保留。数字评分仍为 `— / 1 / 2 / 3 / 4 / 5`。

## F. Review Records

数据流保持：

`all logical slots → existing filters → pagination slice`

- `pageSize = 10`
- 初始总数 20，第一页显示 10
- 第二页显示 10
- 筛选数量显示 filtered total
- 从第二页筛选到 5 条时自动回到第一页
- Case + Model 组合筛选得到 1 条
- 清空筛选恢复 20 条、2 页
- 1440px 下全部 11 个列头可见
- 完整 question 保存在 tooltip 中

## G. Analytics

Seed 初始状态验证：

- Coverage：`0 / 20`
- 显示“暂无已完成评审”
- 不显示大面积 N/A 表格

创建一条 completed review 后：

- Coverage：`1 / 20`
- Empty State 消失
- 排行榜、五维评分、Failure Tag 分布、Case 四模型对比全部恢复
- 测试评分为五维各 4，综合评分正确显示 `80.00`
- 数据仍来自 `buildAnalyticsSnapshot(workspace)`
- Markdown 报告下载成功

## H. Language / Labels

统一复用了移入共享 constants 的展示映射：

- 五个评分维度使用中文标签
- 七个 Failure Tag 使用中文标签
- 三个 Review Status 使用中文标签
- enum、schema field、technical ID 未修改
- Analytics 中没有 raw failure-tag key 表头

## I. Manual Browser QA

真实浏览器验证完成：

- 默认进入评审 Tab
- Case selector 和 reference context 正常
- 1440px、1680px 四模型并排且无重叠
- hide/show 正常；只剩一个模型时最后一个选项 disabled
- reviewing 保存成功
- completed 更新同一 review identity 成功
- 刷新后五项评分、状态和 review 恢复
- Records 分页、翻页、筛选、组合筛选、越界回退、清空均正常
- Analytics 空状态和 completed 状态正常
- Markdown 与 JSON 下载成功
- JSON 导入确认后数据正常
- Reset 取消时保留数据，确认后恢复 0 reviews
- 跨 Tab 不丢 Store 状态
- 页面无横向 overflow
- 无 Vue/runtime console error

浏览器仅记录缺失 `favicon.ico` 的 HTTP 404，不是 Vue/runtime 错误。

## J. Automated Verification

- `npm test`：通过，6 files / 40 tests
- `npm run build`：通过
- `git diff --check`：通过
- Build 有既有 Vite chunk-size warning，无构建错误
- `dist`、Playwright 截图、下载文件和临时浏览器产物均已删除

## K. Scope Audit

- Router — NOT ADDED
- Chart library — NOT ADDED
- Backend — NOT ADDED
- New store — NOT ADDED
- New dependencies — NOT ADDED
- Business formulas — NOT CHANGED
- EvaluationBundle/schema — NOT CHANGED
- Seed — NOT CHANGED
- Filtering AND semantics — NOT CHANGED
- Import/export semantics — NOT CHANGED
- Persistence semantics — NOT CHANGED
- Review upsert identity — NOT CHANGED
- Markdown statistics — NOT CHANGED
- 文档 — NOT CHANGED

`ponytail` 约束使改动保持在现有组件和 constants 内，没有新增 helper/service 或测试框架。

## L. Known Issues

- Vite 仍报告现有主 bundle 超过 500 kB 的 warning。
- 开发服务器请求 `/favicon.ico` 返回 404；不影响应用功能。
- 未 commit、未 push。
```
