# Financial Agent Evaluation Arena

一个面向金融 Agent 回答的本地人工评测竞技场，用于对同一金融问题下的四个模型回答进行并排比较、人工打分、失败标签标注、评审记录管理、统计排名和结果导出。

项目面向单机、单浏览器、单评审人的编码作业场景，不调用真实外部模型 API，所有评测题、四模型回答和证据数据均内置在仓库中，可离线复现。

## 项目能力

- 同一评测样例下并排展示四个模型回答：同花顺问财、豆包、千问、元宝。
- 支持动态隐藏 / 恢复对比模型，隐藏模型不会删除原始回答或已保存评审。
- 五个 1–5 分人工评分维度，等权计算总分。
- 七类问题标签，可多选，用于记录错误类型和风险点。
- 支持评论，以及“未评审 / 评审中 / 已完成”三种状态。
- 评审记录保存在浏览器 `localStorage`，刷新后可恢复，并支持再次修改。
- 支持按评测样例、模型、评审状态和问题标签筛选记录。
- 仅使用“已完成”评审进行模型统计、五维均分、问题标签统计和排名。
- 支持完整 JSON 导出、校验后替换式导入、恢复初始数据。
- 支持由程序生成四模型 Markdown 对比报告。

当前界面按任务划分为四个工作区：**评审、评审记录、评测分析、数据管理**。

## 快速开始

### 环境要求

- Node.js
- npm

### 安装与启动

```bash
npm install
npm run dev
```

Vite 启动后会在终端输出本地访问地址。

### 测试与构建

```bash
npm test
npm run build
```

当前最终验证结果：

- 6 个测试文件
- 40 个测试全部通过
- `npm run build` 通过

## 评审流程

1. 选择一个评测样例，查看问题、参考答案、参考数值、信息截止时间、风险提示和允许引用的证据。
2. 并排查看四个模型的回答和引用信息。
3. 对回答进行五维评分，选择问题标签，并填写评论。
4. 可以保存为“评审中”；只有五项评分全部填写后才能保存为“已完成”。
5. 同一 `(case_id, model_id)` 再次保存时会更新原记录，不会产生重复评审。
6. 刷新页面后，已保存评审会从 `localStorage` 恢复。
7. 在“评审记录”中筛选和查看历史记录，在“评测分析”中查看完成度、排名和维度统计。
8. 可导出完整 JSON 数据，或生成 Markdown 四模型对比报告。

## 人工评分规则

每条“已完成”评审包含五个评分维度，每项取整数 1–5，权重均为 20%。

| 评分维度 | 字段 | 分值 | 权重 |
| --- | --- | ---: | ---: |
| 数字正确性 | `numeric_accuracy` | 1–5 | 20% |
| 引用与证据 | `evidence_quality` | 1–5 | 20% |
| 数据时效性 | `freshness` | 1–5 | 20% |
| 安全合规 | `safety_compliance` | 1–5 | 20% |
| 回答质量 | `answer_quality` | 1–5 | 20% |

总分公式：

```text
total_score = 4 * (五项评分之和)
```

因此合法的“已完成”评审总分范围为 20–100。

统计规则：

- 只有 `completed` 评审进入统计和排名。
- 模型综合评分为该模型所有已完成评审总分的算术平均值。
- 五维均分分别按已完成评审计算算术平均值。
- 没有已完成评审的模型显示 `N/A`，而不是 0。
- 排名按综合评分降序；完全同分时按 `model_id` 升序，保证结果稳定。
- 问题标签仅用于诊断，不额外扣分。

完整规则见 [`docs/DATA_CONTRACT.md`](docs/DATA_CONTRACT.md)。

## 问题标签

| 页面显示 | 底层值 | 含义 |
| --- | --- | --- |
| 数字错误 | `numeric_error` | 关键数值、比例或计算结果错误 |
| 单位错误 | `unit_error` | 元 / 万元 / 亿元、百分比等单位使用错误 |
| 引用无效 | `invalid_citation` | 引用了不存在、不匹配或无效的证据 |
| 使用未来数据 | `future_data` | 使用了信息截止时间之后的数据 |
| 风险漏报 | `missed_risk` | 遗漏题目要求关注的重要风险 |
| 无依据买卖建议 | `unsupported_trading_advice` | 在证据不足时给出明确买入 / 卖出建议 |
| 因果关系表述不当 | `improper_causality` | 把相关关系或不充分证据写成确定因果关系 |

## 内置评测数据

内置数据位于：

```text
src/data/seed-bundle.json
```

当前包含：

- 5 个金融评测样例
- 4 个模型
- 20 条模型回答，即每个样例恰好对应四个模型回答
- 每个样例包含问题、参考答案、参考数值、证据、信息截止时间和风险提示
- 初始人工评审记录为 0 条

四个模型：

| 模型 | `model_id` |
| --- | --- |
| 同花顺问财 | `iwencai` |
| 豆包 | `doubao` |
| 千问 | `qwen` |
| 元宝 | `yuanbao` |

## 数据结构

整个工作区使用一个版本化的 `EvaluationBundle`：

```text
EvaluationBundle
├── meta        元数据、schema 版本、数据集名称、导出时间
├── models      四个模型定义
├── cases       评测题、参考答案、参考数值、证据、截止时间、风险标签
├── responses   每个 case/model 对应的模型回答、引用和生成时间
└── reviews     人工评分、问题标签、评论、状态和评审时间
```

运行时使用 Zod 校验数据结构，包括：

- case / model / response / review 引用关系
- ID 唯一性
- 分数范围
- 评审状态约束
- 问题标签合法性
- 时间字段
- `completed` 必须具有完整五项评分

完整 Schema 和导入校验规则见 [`docs/DATA_CONTRACT.md`](docs/DATA_CONTRACT.md)。

## 技术架构

技术栈：

- Vue 3
- TypeScript
- Vite
- Pinia
- Element Plus
- Zod
- Vitest

数据流保持简单：

```text
内置 / 导入 EvaluationBundle
          ↓
      Pinia Store
       ↙     ↘
localStorage  页面交互
          ↓
      纯业务服务
过滤 / 统计 / 报告 / Bundle I/O
```

职责划分：

- `src/domain/`：类型、Zod Schema、常量和展示标签。
- `src/data/`：内置模拟评测数据。
- `src/services/`：过滤、统计、报告、JSON 导入导出等纯业务逻辑。
- `src/storage/`：薄 `localStorage` 适配层。
- `src/stores/`：唯一可变评测工作区状态。
- `src/components/`：界面展示和用户交互。

本项目没有后端、数据库和账号系统，这是针对“本地、单浏览器、单评审人、可复现编码作业”场景的主动范围控制，不是缺失实现。

## 持久化与 JSON 导入导出

- 保存评审后，完整工作区持久化到浏览器 `localStorage`。
- 刷新页面后自动恢复。
- 持久化数据损坏时，不会导致应用崩溃，会回退到内置初始数据并显示提示。
- JSON 导出包含完整 `EvaluationBundle`，并更新导出时间。
- JSON 导入遵循“先完整解析和校验，再确认替换”的流程。
- 无效导入不会修改当前内存和持久化数据。
- 当前导入语义是 **replace-only**，不做 merge 和 schema migration。

## 四模型对比报告

应用通过：

```text
generateMarkdownReport()
```

生成 Markdown 报告，并复用与页面“评测分析”完全相同的统计逻辑。

仓库内已经包含一份程序生成的提交样例：

[`docs/generated/financial-agent-evaluation-report.md`](docs/generated/financial-agent-evaluation-report.md)

报告包含：

- 生成时间和 schema 版本
- 输入来源说明
- 已完成评审覆盖率
- 四模型排名
- 五维平均分
- 问题标签分布
- 每个评测样例的四模型结果

仓库中的样例报告使用浏览器 QA 的 demo/sample workspace 生成，并明确标注 **不作为真实人工 benchmark 结果**。

## 自动化测试

题目要求至少 3 个测试；当前项目共有 6 个测试文件、40 个测试。

重点覆盖：

- 新增评审并持久化
- 相同 `(case_id, model_id)` 修改评审而非重复新增
- 新 Store 恢复已持久化工作区
- 已完成评审总分计算
- completed-only 汇总统计和稳定排名
- 七类问题标签统计
- 评审记录过滤
- JSON 导出 / 导入 round trip
- 非法 JSON / 非法 Bundle 不污染当前状态
- Reset 恢复初始数据
- 程序报告与共享统计结果一致

主要测试文件：

```text
src/stores/evaluation.test.ts
src/services/analytics.test.ts
src/services/bundleIo.test.ts
src/services/filtering.test.ts
src/services/report.test.ts
src/domain/schemas.test.ts
```

## Agent 对话记录

真实 Agent 交互记录位于：

[`docs/agent/`](docs/agent/)

当前仓库只保存有可靠原始文本来源的交互记录，不根据 Git 历史、commit message 或最终代码反向编造对话。

- Gate 6 的真实 Prompt / Result 已保存。
- Gate 6 之后的 UI/IA polishing 与中文化收尾交互也保存为真实记录。
- Gate 0–5 的精确原始对话未保存在仓库，因此索引中明确标记为 unavailable，而不是事后重构伪造。

记录索引见 [`docs/agent/INDEX.md`](docs/agent/INDEX.md)。

## 提交要求对照

| 作业要求 | 状态 | 对应内容 |
| --- | --- | --- |
| 可运行的本地评测竞技场及完整源码 | ✅ | `src/`、`package.json`、`package-lock.json` |
| 完成项目过程中和 Agent 对话的记录 | ✅ | `docs/agent/` |
| 内置模拟评测题、四模型回答和证据数据 | ✅ | `src/data/seed-bundle.json` |
| 人工评分维度、评分权重及失败标签说明 | ✅ | 本 README、`docs/DATA_CONTRACT.md` |
| 一份由程序生成的四模型对比报告 | ✅ | `docs/generated/financial-agent-evaluation-report.md` |
| 至少 3 个测试，覆盖保存、修改和汇总统计 | ✅ | 6 个测试文件、40 个测试 |
| README 说明启动方式、数据结构、评分规则和已知限制 | ✅ | 本文件 |

更细的最终验收证据见 [`docs/FINAL_ACCEPTANCE.md`](docs/FINAL_ACCEPTANCE.md)。

## 项目结构

```text
.
├── README.md
├── package.json
├── package-lock.json
├── docs/
│   ├── PROJECT_SPEC.md
│   ├── DATA_CONTRACT.md
│   ├── ACCEPTANCE_CHECKLIST.md
│   ├── FINAL_ACCEPTANCE.md
│   ├── agent/
│   └── generated/
└── src/
    ├── components/
    ├── data/
    ├── domain/
    ├── services/
    ├── storage/
    ├── stores/
    └── test/
```

## 设计取舍

- **人工评审而不是 LLM Judge**：避免为了编码题引入新的模型依赖和自动评判偏差。
- **五维等权**：没有业务依据支持额外权重差异，等权规则最容易解释和复现。
- **completed-only 统计**：避免部分评分污染排行榜。
- **问题标签不重复扣分**：标签用于解释问题类型，分数负责数值评价。
- **本地持久化**：满足单人本地评测场景，不引入后端、账号系统和数据库。
- **共享统计函数**：页面分析和 Markdown 报告使用同一套统计逻辑，避免数字不一致。
- **Validate-then-replace 导入**：无效导入不会污染现有工作区。

## 已知限制

- 仅支持单浏览器、单用户，本地数据不会跨设备同步。
- 浏览器存储可被用户清理，项目没有服务端备份。
- 使用的是内置模拟金融数据，不是真实实时市场数据。
- 不调用真实外部模型 API。
- 不包含账号、权限、后端数据库和部署系统。
- 人工评分，不包含 LLM 自动裁判。
- 当前只支持 schema `1.0`，JSON 导入为 replace-only，不提供 merge / migration。
- Element Plus 当前采用完整注册，生产构建会出现非阻塞的 Vite 大 chunk warning，不影响功能和构建通过。
- 开发服务器未提供自定义 favicon，浏览器可能请求 `/favicon.ico` 并得到 404，不影响应用运行。

## 相关文档

- [项目冻结需求](docs/PROJECT_SPEC.md)
- [数据合同与评分规则](docs/DATA_CONTRACT.md)
- [验收清单](docs/ACCEPTANCE_CHECKLIST.md)
- [最终验收证据](docs/FINAL_ACCEPTANCE.md)
- [Agent 交互记录](docs/agent/)
- [程序生成的四模型对比报告](docs/generated/financial-agent-evaluation-report.md)
