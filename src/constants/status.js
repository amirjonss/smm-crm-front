export const STATUS = {
  PUBLISHED: 'PUBLISHED',
  CANCELED: 'CANCELED',
  NOT_PUBLISHED: 'NOT_PUBLISHED',
  RESCHEDULED: 'RESCHEDULED',
}

export const STATUS_OPTIONS = [
  { label: 'Не опубликовано', value: STATUS.NOT_PUBLISHED },
  { label: 'Опубликовано', value: STATUS.PUBLISHED },
  { label: 'Отменено', value: STATUS.CANCELED },
  { label: 'Перенесено', value: STATUS.RESCHEDULED },
]

export const STATUS_COLORS = {
  [STATUS.PUBLISHED]: 'positive',
  [STATUS.CANCELED]: 'negative',
  [STATUS.NOT_PUBLISHED]: 'grey-7',
  [STATUS.RESCHEDULED]: 'orange',
}

export const STATUS_LABELS = {
  [STATUS.PUBLISHED]: 'Опубликовано',
  [STATUS.CANCELED]: 'Отменено',
  [STATUS.NOT_PUBLISHED]: 'Не опубликовано',
  [STATUS.RESCHEDULED]: 'Перенесено',
}

export const FORMAT_OPTIONS = ['Reels', 'Carousel', 'Post', 'Animation', 'Story']
