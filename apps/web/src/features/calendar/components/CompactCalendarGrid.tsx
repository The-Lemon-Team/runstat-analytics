import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  buildMonthGrid,
  isAfterCurrentMonth,
  isAfterToday,
  isDateInRange,
  MONTH_LABELS,
  normalizeDateRange,
  sameDay,
  type DateRangeValue,
  WEEKDAY_LABELS,
} from '@/features/calendar/lib/calendar-utils'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CompactCalendarGridProps = {
  cursor: Date
  onCursorChange: (cursor: Date) => void
  range: DateRangeValue
  onRangeChange: (range: DateRangeValue) => void
  className?: string
}

export function CompactCalendarGrid({
  cursor,
  onCursorChange,
  range,
  onRangeChange,
  className,
}: CompactCalendarGridProps) {
  const [pendingStart, setPendingStart] = useState<Date | null>(null)
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const today = new Date()
  const grid = buildMonthGrid(year, month)
  const canGoNext = !isAfterCurrentMonth(new Date(year, month + 1, 1))

  function prevMonth() {
    onCursorChange(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    if (!canGoNext) return
    onCursorChange(new Date(year, month + 1, 1))
  }

  function handleDayClick(day: Date) {
    if (isAfterToday(day)) return

    if (!pendingStart) {
      setPendingStart(day)
      onRangeChange({
        enabled: true,
        from: day,
        to: day,
      })
      return
    }

    const normalized = normalizeDateRange(pendingStart, day)
    onRangeChange({
      enabled: true,
      from: normalized.from,
      to: normalized.to,
    })
    setPendingStart(null)
  }

  const activeFrom = range.from
  const activeTo = range.to

  return (
    <div className={cn('w-[15.5rem]', className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium">
          {MONTH_LABELS[month]} {year}
        </p>
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            onClick={prevMonth}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            onClick={nextMonth}
            disabled={!canGoNext}
            aria-label="Следующий месяц"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {grid.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="size-7" />
          }

          const isFuture = isAfterToday(day)
          const isToday = sameDay(day, today)
          const inRange =
            range.enabled && isDateInRange(day, activeFrom, activeTo)
          const isEdge =
            range.enabled &&
            activeFrom &&
            activeTo &&
            (sameDay(day, activeFrom) || sameDay(day, activeTo))
          const isPending = pendingStart ? sameDay(day, pendingStart) : false

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isFuture}
              onClick={() => handleDayClick(day)}
              className={cn(
                'flex size-7 items-center justify-center rounded-md text-[11px] transition-colors',
                isFuture && 'cursor-not-allowed text-muted-foreground/35',
                !isFuture && inRange && !isEdge && 'bg-primary/15 text-foreground',
                !isFuture &&
                  (isEdge || isPending) &&
                  'bg-primary font-medium text-primary-foreground',
                !isFuture &&
                  !inRange &&
                  !isEdge &&
                  !isPending &&
                  isToday &&
                  'bg-accent text-accent-foreground',
                !isFuture &&
                  !inRange &&
                  !isEdge &&
                  !isPending &&
                  !isToday &&
                  'hover:bg-muted',
              )}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
        Выберите начало и конец периода
      </p>
    </div>
  )
}
