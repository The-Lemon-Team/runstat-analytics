"use client"

import * as React from "react"
import {
  EyeIcon,
  LayoutGridIcon,
  MessageCircleIcon,
  PlusIcon,
  SearchIcon,
  TableIcon,
  ThumbsUpIcon,
  TrendingUpIcon,
} from "lucide-react"

import type { Publication, Topic } from "@/lib/dashboard-data"
import { INITIAL_TOPICS } from "@/lib/dashboard-data"
import { CONNECTABLE_PROVIDERS } from "@/lib/provider-connections"
import { aggregateAll, formatNumber } from "@/lib/dashboard-utils"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DashboardSidebar } from "./dashboard-sidebar"
import { TopicSection } from "./topic-section"
import { ContentTable } from "./content-table"
import { ConnectProviders } from "./connect-providers"
import { LiveSubscribers } from "./live-subscribers"
import {
  AddPublicationDialog,
  type NewPublicationInput,
  type StageOption,
} from "./add-publication-dialog"

function GlobalStat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="font-mono text-xl font-semibold tracking-tight">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function ContentDashboard() {
  const [topics, setTopics] = React.useState<Topic[]>(INITIAL_TOPICS)
  const [connected, setConnected] = React.useState<string[]>([])
  const [view, setView] = React.useState<"cards" | "table">("cards")
  const [query, setQuery] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [defaultStageKey, setDefaultStageKey] = React.useState<
    string | undefined
  >(undefined)

  const totals = aggregateAll(topics)

  const stageOptions: StageOption[] = topics.flatMap((topic) =>
    topic.stages.map((stage) => ({
      topicId: topic.id,
      topicName: topic.name,
      stageId: stage.id,
      stageName: stage.name,
    })),
  )

  const filteredTopics = topics.filter((topic) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      topic.name.toLowerCase().includes(q) ||
      topic.translation.toLowerCase().includes(q) ||
      topic.category.toLowerCase().includes(q)
    )
  })

  const hasConnections = connected.length > 0

  function connectProvider(id: string) {
    setConnected((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  function connectAll() {
    setConnected(CONNECTABLE_PROVIDERS.map((p) => p.id))
  }

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
            const newPub: Publication = {
              id: `pub-${Date.now()}`,
              providerId: input.providerId,
              label: input.label,
              stageId: input.stageId,
              url: input.url,
              status: input.status,
              metrics: { views: 0, likes: 0, comments: 0 },
            }
            return { ...stage, publications: [...stage.publications, newPub] }
          }),
        }
      }),
    )
  }

  return (
    <div className="flex min-h-svh bg-background">
      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-balance">
              Content Metrics
            </h1>
            <p className="text-sm text-muted-foreground">
              Трекинг публикаций по темам, этапам и площадкам
            </p>
          </div>
          {hasConnections ? (
          <div className="flex items-center gap-2">
            <ToggleGroup
              value={[view]}
              onValueChange={(value) => {
                const next = value[0] as "cards" | "table" | undefined
                if (next) setView(next)
              }}
              variant="outline"
              spacing={0}
              className="shrink-0"
            >
              <ToggleGroupItem value="cards" aria-label="Карточки">
                <LayoutGridIcon data-icon="inline-start" />
                <span className="hidden md:inline">Карточки</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Таблица">
                <TableIcon data-icon="inline-start" />
                <span className="hidden md:inline">Таблица</span>
              </ToggleGroupItem>
            </ToggleGroup>
            <InputGroup className="w-full sm:w-64">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Поиск по темам…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Button onClick={openDialogGlobal}>
              <PlusIcon data-icon="inline-start" />
              <span className="hidden sm:inline">Add Publication</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
          ) : null}
        </header>

        {!hasConnections ? (
          <ConnectProviders
            connected={connected}
            onConnect={connectProvider}
            onConnectAll={connectAll}
          />
        ) : (
        <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
          {/* Live subscribers */}
          <LiveSubscribers connected={connected} onConnect={connectProvider} />

          {/* Global summary */}
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <GlobalStat
              label="Total Views"
              value={formatNumber(totals.views)}
              icon={EyeIcon}
            />
            <GlobalStat
              label="Total Comments"
              value={formatNumber(totals.comments)}
              icon={MessageCircleIcon}
            />
            <GlobalStat
              label="Total Likes"
              value={formatNumber(totals.likes)}
              icon={ThumbsUpIcon}
            />
            <GlobalStat
              label="Active Topics"
              value={String(topics.length)}
              icon={TrendingUpIcon}
            />
          </section>

          {/* Topics */}
          <section className="flex flex-col gap-5">
            {filteredTopics.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Ничего не найдено по запросу «{query}»
              </div>
            ) : view === "table" ? (
              <ContentTable
                topics={filteredTopics}
                onAddPublication={openDialogForStage}
              />
            ) : (
              filteredTopics.map((topic) => (
                <TopicSection
                  key={topic.id}
                  topic={topic}
                  onAddPublication={openDialogForStage}
                />
              ))
            )}
          </section>
        </main>
        )}
      </div>

      <AddPublicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stageOptions={stageOptions}
        defaultStageKey={defaultStageKey}
        onSubmit={handleAddPublication}
      />
    </div>
  )
}
