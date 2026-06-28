import { DateRangePicker } from '@/features/calendar/components/DateRangePicker'
import type { DateRangeValue } from '@/features/calendar/lib/calendar-utils'

const VIEW_MODE_PRESETS = ['week', 'month'] as const

type ViewModeDateRangePickerProps = {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  onClear: () => void
}

export function ViewModeDateRangePicker({
  value,
  onChange,
  onClear,
}: ViewModeDateRangePickerProps) {
  return (
    <DateRangePicker
      size="sm"
      showPresets
      showHelp={false}
      presets={[...VIEW_MODE_PRESETS]}
      value={value}
      onChange={onChange}
      onClear={onClear}
    />
  )
}
