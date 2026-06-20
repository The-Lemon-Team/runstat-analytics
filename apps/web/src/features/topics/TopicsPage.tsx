import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { HelpTooltip } from '@/components/HelpTooltip'
import { DateRangePicker } from '@/features/calendar/components/DateRangePicker'
import { EMPTY_DATE_RANGE } from '@/features/calendar/lib/calendar-utils'
import { useDashboardTopicsContext } from '@/features/dashboard/DashboardTopicsProvider'
import {
  DASHBOARD_NAV,
  PAGE_TITLES,
} from '@/features/dashboard/lib/nav'
import { AddTopicDialog } from '@/features/topics/components/AddTopicDialog'
import { TopicsList } from '@/features/topics/components/TopicsList'
import {
  filterTopics,
  formatTopicsFilterPeriod,
} from '@/features/topics/lib/topic-filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function TopicsPage() {
  const { sourceTopics, handleCreateTopic, isCreatingTopic } =
    useDashboardTopicsContext()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dateRange, setDateRange] = useState(EMPTY_DATE_RANGE)

  const pageMeta = PAGE_TITLES[DASHBOARD_NAV.topics]

  const filters = useMemo(
    () => ({ query, dateRange }),
    [query, dateRange],
  )

  const filteredTopics = useMemo(
    () => filterTopics(sourceTopics, filters),
    [sourceTopics, filters],
  )

  const periodLabel = formatTopicsFilterPeriod(dateRange)

  return (
    <>
      <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {pageMeta.title}
            </h1>
            <HelpTooltip text="В Excel это (Название видео / контента)" />
          </div>
          <p className="text-sm text-muted-foreground">{pageMeta.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            onClear={() => setDateRange(EMPTY_DATE_RANGE)}
          />

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Поиск по теме или публикации…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">Новая тема</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-6 md:px-6">
        {filteredTopics.length === 0 ? (
          <section className="overflow-hidden rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground shadow-sm">
            {sourceTopics.length === 0
              ? 'Пока нет тем. Нажмите «Новая тема», чтобы добавить первую.'
              : dateRange.enabled
                ? `Нет тем за ${periodLabel}${query ? ` по запросу «${query}»` : ''}`
                : `Ничего не найдено по запросу «${query}»`}
          </section>
        ) : (
          <section className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm sm:p-2.5">
            <TopicsList topics={filteredTopics} filters={filters} compact />
          </section>
        )}
      </main>

      <AddTopicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateTopic}
        isSubmitting={isCreatingTopic}
      />
    </>
  )
}
