import { STATUS_LABELS, STATUS_COLORS } from '@/constants/status'

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || STATUS_LABELS.NOT_PUBLISHED
}

export function getColorForStatus(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.NOT_PUBLISHED
}
