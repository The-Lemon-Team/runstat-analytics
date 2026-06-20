import type { ComponentType } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  Eye,
  LayoutGrid,
  MessageCircle,
  Plus,
  Search,
  Table as TableIcon,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react'
import { ContentMetricsTable } from '@/features/content-table/components/ContentMetricsTable'
import { useDashboardShell } from '@/features/dashboard/DashboardShellContext'
import { useDashboardTopicsContext } from '@/features/dashboard/DashboardTopicsProvider'
import { TopicSection } from '@/features/dashboard/components/TopicSection'
import { WeeklyPublicationsPanel } from '@/features/dashboard/components/WeeklyPublicationsPanel'
import {
  AddPublicationDialog,
  type NewPublicationInput,
  type StageOption,
} from '@/features/dashboard/components/AddPublicationDialog'
import { LiveSubscribers } from '@/features/dashboard/components/LiveSubscribers'
import {
  DASHBOARD_NAV,
  PAGE_TITLES,
} from '@/features/dashboard/lib/nav'
import { AddTopicDialog } from '@/features/topics/components/AddTopicDialog'
import { TopicsSection } from '@/features/topics/components/TopicsSection'
import {
  filterTopics,
  formatTopicsFilterPeriod,
} from '@/features/topics/lib/topic-filters'
import { EMPTY_DATE_RANGE } from '@/features/calendar/lib/calendar-utils'
import {
  aggregateAll,
  formatNumber,
  toTopicViews,
  type TopicView,
} from '@/lib/dashboard-utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function GlobalStat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="font-mono text-xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function ContentGridPage() {
  const {
    subscriberSources,
    weeklyPublications,
    connectingId,
    onConnectOAuth,
    onYouTubeChannelAdded,
  } = useDashboardShell()
  const { sourceTopics, handleCreateTopic, isCreatingTopic } =
    useDashboardTopicsContext()
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [topicDialogOpen, setTopicDialogOpen] = useState(false)
  const [defaultStageKey, setDefaultStageKey] = useState<string | undefined>()
  const [topics, setTopics] = useState<TopicView[]>(() =>
    toTopicViews(sourceTopics),
  )
  const [dateRange, setDateRange] = useState(EMPTY_DATE_RANGE)

  useEffect(() => {
    setTopics(toTopicViews(sourceTopics))
  }, [sourceTopics])

  const totals = aggregateAll(sourceTopics)

  const stageOptions: StageOption[] = topics.flatMap((topic) =>
    topic.stages.map((stage) => ({
      topicId: topic.id,
      topicName: topic.name,
      stageId: stage.id,
      stageName: stage.name,
    })),
  )

  const filteredTopics = useMemo(() => {
    const matchedIds = new Set(
      filterTopics(sourceTopics, { query, dateRange }).map((topic) => topic.id),
    )
    return topics.filter((topic) => matchedIds.has(topic.id))
  }, [topics, sourceTopics, query, dateRange])

  const periodLabel = formatTopicsFilterPeriod(dateRange)

  function openDialogForStage(topicId: string, stageId: string) {
    setDefaultStageKey(`${topicId}::${stageId}`)
    setDialogOpen(true)
  }

  function openDialogGlobal() {
    setDefaultStageKey(undefined)
    setDialogOpen(true)
  }

  function handleAddPublication(topicId: string, input: NewPublicationInput) {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) return topic
        return {
          ...topic,
          stages: topic.stages.map((stage) => {
            if (stage.id !== input.stageId) return stage
            return {
              ...stage,
              publications: [
                ...stage.publications,
                {
                  id: `pub-${Date.now()}`,
                  providerId: input.providerId,
                  label: input.label,
                  stageId: input.stageId,
                  url: input.url,
                  status: input.status,
                  metrics: input.metrics ?? {
                    views: 0,
                    likes: 0,
                    comments: 0,
                  },
                },
              ],
            }
          }),
        }
      }),
    )
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {PAGE_TITLES[DASHBOARD_NAV.content].title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {PAGE_TITLES[DASHBOARD_NAV.content].subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5">
            <Button
              size="sm"
              variant={view === 'cards' ? 'secondary' : 'ghost'}
              onClick={() => setView('cards')}
            >
              <LayoutGrid className="size-4" />
              <span className="hidden md:inline">Карточки</span>
            </Button>
            <Button
              size="sm"
              variant={view === 'table' ? 'secondary' : 'ghost'}
              onClick={() => setView('table')}
            >
              <TableIcon className="size-4" />
              <span className="hidden md:inline">Таблица</span>
            </Button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Поиск по темам…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button onClick={openDialogGlobal}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Publication</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
        <LiveSubscribers
          sources={subscriberSources}
          connectingId={connectingId}
          onConnectOAuth={onConnectOAuth}
          onYouTubeChannelAdded={onYouTubeChannelAdded}
        />

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <GlobalStat
            label="Total Views"
            value={formatNumber(totals.views)}
            icon={Eye}
          />
          <GlobalStat
            label="Total Comments"
            value={formatNumber(totals.comments)}
            icon={MessageCircle}
          />
          <GlobalStat
            label="Total Likes"
            value={formatNumber(totals.likes)}
            icon={ThumbsUp}
          />
          <GlobalStat
            label="Active Topics"
            value={String(topics.length)}
            icon={TrendingUp}
          />
        </section>

        <WeeklyPublicationsPanel publications={weeklyPublications} />

        {view === 'table' ? (
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <ContentMetricsTable
              topics={sourceTopics}
              onAddPublication={openDialogForStage}
            />
          </section>
        ) : (
          <TopicsSection
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearDateRange={() => setDateRange(EMPTY_DATE_RANGE)}
            onAddTopic={() => setTopicDialogOpen(true)}
            empty={
              filteredTopics.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  {topics.length === 0
                    ? 'Пока нет тем. Нажмите «Новая тема», чтобы добавить первую.'
                    : dateRange.enabled
                      ? `Нет тем за ${periodLabel}${query ? ` по запросу «${query}»` : ''}`
                      : `Ничего не найдено по запросу «${query}»`}
                </div>
              ) : undefined
            }
          >
            {filteredTopics.map((topic) => (
              <TopicSection
                key={topic.id}
                topic={topic}
                nested
                onAddPublication={openDialogForStage}
              />
            ))}
          </TopicsSection>
        )}
      </main>

      <AddPublicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stageOptions={stageOptions}
        defaultStageKey={defaultStageKey}
        onSubmit={handleAddPublication}
      />

      <AddTopicDialog
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
        onSubmit={handleCreateTopic}
        isSubmitting={isCreatingTopic}
      />
    </>
  )
}
