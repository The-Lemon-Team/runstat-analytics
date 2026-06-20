"use client"

import * as React from "react"
import {
  ChevronRightIcon,
  CircleSlashIcon,
  ClockIcon,
  CheckIcon,
  PlusIcon,
} from "lucide-react"

import type { Topic } from "@/lib/dashboard-data"
import {
  aggregateStage,
  aggregateTopic,
  countPublications,
  formatNumber,
} from "@/lib/dashboard-utils"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProviderBadge } from "./provider-badge"

function engagementRate(views: number, likes: number, comments: number): string {
  if (views <= 0) return "—"
  return (((likes + comments) / views) * 100).toFixed(1) + "%"
}

function StatusCell({ status }: { status: "published" | "scheduled" | "missing" }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 text-success">
        <CheckIcon className="size-3.5" />
        <span className="text-xs font-medium">Опубликовано</span>
      </span>
    )
  }
  if (status === "scheduled") {
    return (
      <span className="inline-flex items-center gap-1.5 text-warning">
        <ClockIcon className="size-3.5" />
        <span className="text-xs font-medium">Запланировано</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <CircleSlashIcon className="size-3.5" />
      <span className="text-xs font-medium">Нет слота</span>
    </span>
  )
}

export function ContentTable({
  topics,
  onAddPublication,
}: {
  topics: Topic[]
  onAddPublication: (topicId: string, stageId: string) => void
}) {
  const [openTopics, setOpenTopics] = React.useState<Set<string>>(
    () => new Set(topics.map((t) => t.id)),
  )
  const [openStages, setOpenStages] = React.useState<Set<string>>(
    () =>
      new Set(
        topics.flatMap((t) => t.stages.map((s) => `${t.id}::${s.id}`)),
      ),
  )

  function toggleTopic(id: string) {
    setOpenTopics((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleStage(key: string) {
    setOpenStages((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead className="w-[34%] min-w-[220px] pl-4">
              Тема / Этап / Публикация
            </TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Просмотры</TableHead>
            <TableHead className="text-right">Лайки</TableHead>
            <TableHead className="text-right">Комм.</TableHead>
            <TableHead className="text-right">ER</TableHead>
            <TableHead className="w-10 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => {
            const topicOpen = openTopics.has(topic.id)
            const topicTotals = aggregateTopic(topic)
            const counts = countPublications(topic)
            return (
              <React.Fragment key={topic.id}>
                {/* Topic group header */}
                <TableRow
                  className="cursor-pointer border-b-2 border-border bg-accent/40 hover:bg-accent/60"
                  onClick={() => toggleTopic(topic.id)}
                  aria-expanded={topicOpen}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2">
                      <ChevronRightIcon
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                          topicOpen && "rotate-90",
                        )}
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {topic.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {topic.translation}
                      </span>
                      <Badge variant="secondary" className="ml-1">
                        {topic.category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {counts.published}/{counts.total}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                    {formatNumber(topicTotals.views)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                    {formatNumber(topicTotals.likes)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                    {formatNumber(topicTotals.comments)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                    {engagementRate(
                      topicTotals.views,
                      topicTotals.likes,
                      topicTotals.comments,
                    )}
                  </TableCell>
                  <TableCell />
                </TableRow>

                {topicOpen &&
                  topic.stages.map((stage) => {
                    const stageKey = `${topic.id}::${stage.id}`
                    const stageOpen = openStages.has(stageKey)
                    const stageTotals = aggregateStage(stage)
                    return (
                      <React.Fragment key={stageKey}>
                        {/* Stage sub-header */}
                        <TableRow
                          className="cursor-pointer bg-muted/30 hover:bg-muted/50"
                          onClick={() => toggleStage(stageKey)}
                          aria-expanded={stageOpen}
                        >
                          <TableCell className="py-2 pl-9">
                            <div className="flex items-center gap-2">
                              <ChevronRightIcon
                                className={cn(
                                  "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                                  stageOpen && "rotate-90",
                                )}
                              />
                              <span className="text-sm font-medium text-foreground">
                                {stage.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                · {stage.publications.length}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell />
                          <TableCell className="text-right font-mono text-xs font-medium text-muted-foreground tabular-nums">
                            {formatNumber(stageTotals.views)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-medium text-muted-foreground tabular-nums">
                            {formatNumber(stageTotals.likes)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-medium text-muted-foreground tabular-nums">
                            {formatNumber(stageTotals.comments)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                            {engagementRate(
                              stageTotals.views,
                              stageTotals.likes,
                              stageTotals.comments,
                            )}
                          </TableCell>
                          <TableCell className="pr-4 text-right">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              aria-label={`Добавить публикацию в этап ${stage.name}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                onAddPublication(topic.id, stage.id)
                              }}
                            >
                              <PlusIcon />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Publication rows */}
                        {stageOpen &&
                          stage.publications.map((pub) => (
                            <TableRow key={pub.id} className="text-sm">
                              <TableCell className="py-2 pl-[3.75rem]">
                                <div className="flex items-center gap-2.5">
                                  <ProviderBadge
                                    providerId={pub.providerId}
                                    size="sm"
                                  />
                                  <span className="truncate font-medium text-foreground">
                                    {pub.label}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusCell status={pub.status} />
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm tabular-nums">
                                {pub.status === "published"
                                  ? formatNumber(pub.metrics.views)
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm tabular-nums">
                                {pub.status === "published"
                                  ? formatNumber(pub.metrics.likes)
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm tabular-nums">
                                {pub.status === "published"
                                  ? formatNumber(pub.metrics.comments)
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                                {pub.status === "published"
                                  ? engagementRate(
                                      pub.metrics.views,
                                      pub.metrics.likes,
                                      pub.metrics.comments,
                                    )
                                  : "—"}
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          ))}
                      </React.Fragment>
                    )
                  })}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
