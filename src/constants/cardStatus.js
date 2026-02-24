export const CARD_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
}

export const CARD_STATUS_OPTIONS = [
  { label: 'Открыта', value: CARD_STATUS.OPEN },
  { label: 'В работе', value: CARD_STATUS.IN_PROGRESS },
  { label: 'На проверке', value: CARD_STATUS.REVIEW },
  { label: 'Готово', value: CARD_STATUS.DONE },
]

export const CARD_STATUS_LABELS = {
  [CARD_STATUS.OPEN]: 'Открыта',
  [CARD_STATUS.IN_PROGRESS]: 'В работе',
  [CARD_STATUS.REVIEW]: 'На проверке',
  [CARD_STATUS.DONE]: 'Готово',
}

export const CARD_STATUS_COLORS = {
  [CARD_STATUS.OPEN]: 'grey-7',
  [CARD_STATUS.IN_PROGRESS]: 'blue',
  [CARD_STATUS.REVIEW]: 'orange',
  [CARD_STATUS.DONE]: 'positive',
}

export const CARD_STATUS_STYLE = {
  [CARD_STATUS.OPEN]: { bg: 'rgba(156,163,175,0.12)', dot: '#9ca3af', text: '#9ca3af' },
  [CARD_STATUS.IN_PROGRESS]: { bg: 'rgba(59,130,246,0.12)', dot: '#60a5fa', text: '#60a5fa' },
  [CARD_STATUS.REVIEW]: { bg: 'rgba(249,115,22,0.12)', dot: '#fb923c', text: '#fb923c' },
  [CARD_STATUS.DONE]: { bg: 'rgba(34,197,94,0.12)', dot: '#4ade80', text: '#4ade80' },
}

export const LIST_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#22c55e',
  '#f97316',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#eab308',
  '#6366f1',
  '#14b8a6',
]

export const CARD_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#22c55e',
  '#f97316',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#eab308',
  '#6366f1',
  '#14b8a6',
]
