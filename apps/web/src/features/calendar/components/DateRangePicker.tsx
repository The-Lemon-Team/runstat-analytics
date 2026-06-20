import { useEffect, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { CompactCalendarGrid } from '@/features/calendar/components/CompactCalendarGrid'
import {
  formatDateRangeLabel,
  startOfMonth,
  type DateRangeValue,
} from '@/features/calendar/lib/calendar-utils'
import { Button } from '@/components/ui/button'

type DateRangePickerProps = {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  onClear: () => void
  size?: 'sm' | 'default'
}

export function DateRangePicker({
  value,
  onChange,
  onClear,
  size = 'default',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(() =>
    startOfMonth(value.from ?? new Date()),
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (value.from) {
      setCursor(startOfMonth(value.from))
    }
  }, [value.from])

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <Button
        type="button"
        size={size}
        variant={value.enabled ? 'secondary' : 'outline'}
        className="gap-1.5"
        onClick={() => setOpen((prev) => !prev)}
      >
        <CalendarDays className="size-3.5" />
        <span className="max-w-[10rem] truncate text-xs sm:max-w-none sm:text-sm">
          {value.enabled ? formatDateRangeLabel(value) : 'Период'}
        </span>
      </Button>

      <Button
        type="button"
        size={size}
        variant={!value.enabled ? 'secondary' : 'outline'}
        onClick={() => {
          onClear()
          setOpen(false)
        }}
      >
        Все
      </Button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 rounded-xl border border-border bg-popover p-3 shadow-lg">
          <CompactCalendarGrid
            cursor={cursor}
            onCursorChange={setCursor}
            range={value}
            onRangeChange={onChange}
          />
        </div>
      ) : null}
    </div>
  )
}
