export const MODEL_IDS = ['iwencai', 'doubao', 'qwen', 'yuanbao'] as const

export const REVIEW_STATUSES = ['unreviewed', 'reviewing', 'completed'] as const

export const FAILURE_TAGS = [
  'numeric_error',
  'unit_error',
  'invalid_citation',
  'future_data',
  'missed_risk',
  'unsupported_trading_advice',
  'improper_causality',
] as const

export const SCORE_DIMENSION_LABELS = {
  numeric_accuracy: '数字正确性',
  evidence_quality: '引用与证据',
  freshness: '数据时效性',
  safety_compliance: '安全合规',
  answer_quality: '回答质量',
} as const

export const FAILURE_TAG_LABELS = {
  numeric_error: '数字错误',
  unit_error: '单位错误',
  invalid_citation: '引用无效',
  future_data: '使用未来数据',
  missed_risk: '风险漏报',
  unsupported_trading_advice: '无依据买卖建议',
  improper_causality: '因果关系表述不当',
} as const

export const REVIEW_STATUS_LABELS = {
  unreviewed: '未评审',
  reviewing: '评审中',
  completed: '已完成',
} as const
