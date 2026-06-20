import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import type { TopicDto } from '@spt/shared'
import { CompactCalendarGrid } from '@/features/calendar/components/CompactCalendarGrid'
import {
  EMPTY_DATE_RANGE,
  formatDateRangeLabel,
  isAfterCurrentMonth,
  isDateInRange,
  MONTH_LABELS,
  startOfMonth,
  type DateRangeValue,
} from '@/features/calendar/lib/calendar-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type CalendarPublication = {
  id: string
  label: string
  provider: string
  topicName: string
  stageName: string
  postUrl: string | null
  status: string
  date: Date
}

function flattenPublications(topics: TopicDto[]): CalendarPublication[] {
  const items: CalendarPublication[] = []

  for (const topic of topics) {
    for (const stage of topic.stages) {
      for (const pub of stage.publications) {
        const dateStr = pub.publishedAt ?? pub.snapshots[0]?.capturedAt
        if (!dateStr) continue
        items.push({
          id: pub.id,
          label: pub.label ?? pub.channelName,
          provider: pub.provider,
          topicName: topic.name,
          stageName: stage.name,
          postUrl: pub.postUrl,
          status: pub.status,
          date: new Date(dateStr),
        })
      }
    }
  }

  return items.sort((a, b) => a.date.getTime() - b.date.getTime())
}

function PublicationCard({ pub }: { pub: CalendarPublication }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 text-left">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium leading-snug">{pub.label}</p>
        {pub.postUrl ? (
          <a
            href={pub.postUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {pub.topicName} · {pub.stageName}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
          {pub.provider}
        </Badge>
        <Badge
          variant={pub.status === 'PUBLISHED' ? 'default' : 'secondary'}
          className="px-1.5 py-0 text-[10px]"
        >
          {pub.status === 'PUBLISHED' ? 'Опубликовано' : 'Запланировано'}
        </Badge>
      </div>
    </div>
  )
}

export function CalendarView({ topics }: { topics: TopicDto[] }) {
  const publications = useMemo(() => flattenPublications(topics), [topics])
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [dateRange, setDateRange] = useState<DateRangeValue>(EMPTY_DATE_RANGE)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const canGoNext = !isAfterCurrentMonth(new Date(year, month + 1, 1))

  const filteredPublications = useMemo(() => {
    if (!dateRange.enabled || !dateRange.from || !dateRange.to) {
      return publications
    }

    return publications.filter((pub) =>
      isDateInRange(pub.date, dateRange.from, dateRange.to),
    )
  }, [publications, dateRange])

  function prevMonth() {
    setCursor(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    if (!canGoNext) return
    setCursor(new Date(year, month + 1, 1))
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <section className="w-full max-w-xs rounded-2xl border border-border bg-card p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Календарь</h2>
              <p className="text-[11px] text-muted-foreground">
                {dateRange.enabled
                  ? formatDateRangeLabel(dateRange)
                  : 'Выберите период'}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={!dateRange.enabled ? 'secondary' : 'outline'}
              onClick={() => setDateRange(EMPTY_DATE_RANGE)}
            >
              Все
            </Button>
          </div>

          <CompactCalendarGrid
            cursor={cursor}
            onCursorChange={setCursor}
            range={dateRange}
            onRangeChange={setDateRange}
          />
        </section>

        <aside className="min-w-0 flex-1 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">
              {dateRange.enabled && dateRange.from && dateRange.to
                ? `Публикации: ${formatDateRangeLabel(dateRange)}`
                : 'Все публикации'}
            </h3>
            {filteredPublications.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPublications.map((pub) => (
                  <PublicationCard key={pub.id} pub={pub} />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {dateRange.enabled
                  ? 'Нет публикаций в выбранном периоде'
                  : 'Нет публикаций'}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                {MONTH_LABELS[month]} {year}
              </h3>
              <div className="flex gap-0.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="size-7"
                  onClick={prevMonth}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="size-7"
                  onClick={nextMonth}
                  disabled={!canGoNext}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>

            <ul className="max-h-56 space-y-2 overflow-y-auto">
              {publications
                .filter(
                  (pub) =>
                    pub.date.getFullYear() === year &&
                    pub.date.getMonth() === month,
                )
                .map((pub) => {
                  const inSelectedRange =
                    dateRange.enabled &&
                    isDateInRange(pub.date, dateRange.from, dateRange.to)

                  return (
                    <li
                      key={pub.id}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs',
                        inSelectedRange && 'bg-primary/10',
                      )}
                    >
                      <span className="shrink-0 text-muted-foreground">
                        {pub.date.toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                      <span className="truncate font-medium">{pub.label}</span>
                    </li>
                  )
                })}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}
