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

export const PLATFORM = {
  YOUTUBE: 'YOUTUBE',
  INSTAGRAM: 'INSTAGRAM',
  FACEBOOK: 'FACEBOOK',
  TELEGRAM: 'TELEGRAM',
}

export const PLATFORM_OPTIONS = [
  { label: 'YouTube', value: PLATFORM.YOUTUBE, icon: 'fa-brands fa-youtube' },
  { label: 'Instagram', value: PLATFORM.INSTAGRAM, icon: 'fa-brands fa-instagram' },
  { label: 'Facebook', value: PLATFORM.FACEBOOK, icon: 'fa-brands fa-facebook' },
  { label: 'Telegram', value: PLATFORM.TELEGRAM, icon: 'fa-brands fa-telegram' },
]

export const PLATFORM_LABELS = {
  [PLATFORM.YOUTUBE]: 'YouTube',
  [PLATFORM.INSTAGRAM]: 'Instagram',
  [PLATFORM.FACEBOOK]: 'Facebook',
  [PLATFORM.TELEGRAM]: 'Telegram',
}

export const PLATFORM_ICONS = {
  [PLATFORM.YOUTUBE]: 'fa-brands fa-youtube',
  [PLATFORM.INSTAGRAM]: 'fa-brands fa-instagram',
  [PLATFORM.FACEBOOK]: 'fa-brands fa-facebook',
  [PLATFORM.TELEGRAM]: 'fa-brands fa-telegram',
}

export const PLATFORM_COLORS = {
  [PLATFORM.YOUTUBE]: '#FF0000',
  [PLATFORM.INSTAGRAM]: '#E4405F',
  [PLATFORM.FACEBOOK]: '#1877F2',
  [PLATFORM.TELEGRAM]: '#0088CC',
}
