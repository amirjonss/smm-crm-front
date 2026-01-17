import { STATUS_OPTIONS } from '@/constants/status'
import { getStatusLabel, getColorForStatus } from '@/utils/statusHelpers'

export function useStatusFormatting() {
  return {
    statusOptions: STATUS_OPTIONS,
    getStatusLabel,
    getColorForStatus,
  }
}
