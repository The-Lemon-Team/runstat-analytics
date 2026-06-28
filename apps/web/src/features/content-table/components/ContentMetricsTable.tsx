import { ChevronRight, Check, Clock, CircleSlash } from 'lucide-react'
import { flexRender } from '@tanstack/react-table'
import {
  PROVIDER_LABELS,
  PublicationStatus,
  type TopicDto,
} from '@spt/shared'
import { Badge } from '@/components/ui/badge'
import type { LiveSubscriberSource } from '@/lib/provider-connections'
import { cn } from '@/lib/utils'
import { formatSubscriberDate } from '@/lib/dashboard-utils'
import { useContentTable } from '../hooks/useContentTable'
import {
  engagementRate,
  formatNumber,
  type ContentTableRow,
} from '../lib/metrics'

function StatusBadge({ status }: { status: PublicationStatus }) {
  if (status === PublicationStatus.PUBLISHED) {
    return (
      <Badge className="gap-1 border-success/30 bg-success/12 text-success hover:bg-success/12">
        <Check className="size-3" />
        Опубликовано
      </Badge>
    )
  }

  return (
    <Badge className="gap-1 border-warning/40 bg-warning/15 text-warning-foreground hover:bg-warning/15">
      <Clock className="size-3" />
      Запланировано
    </Badge>
  )
}

function ProviderPill({ provider }: { provider: ContentTableRow['provider'] }) {
  if (!provider) return null
  const label = PROVIDER_LABELS[provider]
  return (
    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
      {label.slice(0, 2)}
    </span>
  )
}

function SubscribersCell({
  value,
  presentation,
}: {
  value: number | null | undefined
  presentation?: boolean
}) {
  if (value == null) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <span
      className={cn(
        'font-mono font-medium tabular-nums text-foreground',
        presentation && 'text-base',
      )}
    >
      {formatNumber(value)}
    </span>
  )
}

function CommentCell({
  value,
  presentation,
}: {
  value: string | null | undefined
  presentation?: boolean
}) {
  if (!value?.trim()) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <span
      className={cn(
        'line-clamp-2 text-muted-foreground',
        presentation ? 'text-sm' : 'text-xs',
      )}
      title={value}
    >
      {value}
    </span>
  )
}

function DateCell({
  value,
  presentation,
}: {
  value: Date | null | undefined
  presentation?: boolean
}) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <time
      dateTime={value.toISOString()}
      className={cn(
        'whitespace-nowrap tabular-nums text-foreground',
        presentation ? 'text-sm' : 'text-xs',
      )}
    >
      {formatSubscriberDate(value.toISOString())}
    </time>
  )
}

function headerAlign(id: string): string {
  if (id === 'name' || id === 'status' || id === 'comment' || id === 'date') {
    return 'text-left'
  }
  return 'text-right'
}

interface ContentMetricsTableProps {
  topics: TopicDto[]
  subscriberSources?: LiveSubscriberSource[]
  onAddPublication?: (topicId: string, stageId: string) => void
  presentation?: boolean
}

export function ContentMetricsTable({
  topics,
  subscriberSources,
  onAddPublication,
  presentation = false,
}: ContentMetricsTableProps) {
  const showSubscribersColumn = presentation
  const showCommentColumn = presentation
  const showDateColumn = presentation

  const {
    table,
    toggleTopic,
    toggleStage,
    isTopicExpanded,
    isStageExpanded,
  } = useContentTable(topics, {
    subscriberSources: showSubscribersColumn ? subscriberSources : undefined,
    showSubscribersColumn,
    showCommentColumn,
    showDateColumn,
  })

  const cellPad = presentation ? 'py-3.5' : 'py-2.5'
  const topicPad = presentation ? 'py-4' : 'py-3'

  return (
    <div
      className={cn(
        'overflow-x-auto',
        presentation
          ? 'rounded-xl border border-border bg-card shadow-sm'
          : 'rounded-2xl border border-border bg-card',
      )}
    >
      <table
        className={cn(
          'w-full min-w-[72rem] border-collapse',
          presentation ? 'text-base' : 'text-sm',
        )}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-primary/15 bg-primary/8"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                    presentation ? 'py-4 text-sm' : 'py-3',
                    headerAlign(header.id),
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
              {onAddPublication ? <th className="w-10" /> : null}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => {
            const data = row.original
            const isAltPub = rowIndex % 2 === 1

            if (data.kind === 'topic') {
              const expanded = isTopicExpanded(data.topicId)
              return (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b-2 border-primary/15 bg-primary/6 hover:bg-primary/10"
                  onClick={() => toggleTopic(data.topicId)}
                >
                  <td className={cn('border-l-4 border-l-primary px-4', topicPad)}>
                    <div className="flex items-center gap-2">
                      <ChevronRight
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          expanded && 'rotate-90',
                        )}
                      />
                      <span className="font-semibold">{data.name}</span>
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {data.publishedCount}/{data.totalCount}
                      </span>
                    </div>
                  </td>
                  <td />
                  {showDateColumn ? <td /> : null}
                  {showSubscribersColumn ? <td /> : null}
                  {showCommentColumn ? <td /> : null}
                  <td
                    className={cn(
                      'px-4 text-right font-mono font-semibold tabular-nums',
                      topicPad,
                    )}
                  >
                    {formatNumber(data.metrics.views)}
                  </td>
                  <td
                    className={cn(
                      'px-4 text-right font-mono font-semibold tabular-nums',
                      topicPad,
                    )}
                  >
                    {formatNumber(data.metrics.likes)}
                  </td>
                  <td
                    className={cn(
                      'px-4 text-right font-mono font-semibold tabular-nums',
                      topicPad,
                    )}
                  >
                    {formatNumber(data.metrics.comments)}
                  </td>
                  <td
                    className={cn(
                      'px-4 text-right font-mono text-xs text-muted-foreground tabular-nums',
                      presentation ? 'text-sm' : undefined,
                      topicPad,
                    )}
                  >
                    {engagementRate(data.metrics)}
                  </td>
                  {onAddPublication ? <td /> : null}
                </tr>
              )
            }

            if (data.kind === 'stage' && data.stageId) {
              const expanded = isStageExpanded(data.topicId, data.stageId)
              return (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-border/60 bg-muted/35 hover:bg-muted/55"
                  onClick={() => toggleStage(data.topicId, data.stageId!)}
                >
                  <td className={cn('border-l-2 border-l-primary/30 py-2 pl-9 pr-4')}>
                    <div className="flex items-center gap-2">
                      <ChevronRight
                        className={cn(
                          'size-3.5 text-muted-foreground transition-transform',
                          expanded && 'rotate-90',
                        )}
                      />
                      <span className="font-medium">{data.name}</span>
                      <span className="text-xs text-muted-foreground">
                        · {data.childCount}
                      </span>
                    </div>
                  </td>
                  <td />
                  {showDateColumn ? <td /> : null}
                  {showSubscribersColumn ? <td /> : null}
                  {showCommentColumn ? <td /> : null}
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground tabular-nums">
                    {formatNumber(data.metrics.views)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground tabular-nums">
                    {formatNumber(data.metrics.likes)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground tabular-nums">
                    {formatNumber(data.metrics.comments)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground tabular-nums">
                    {engagementRate(data.metrics)}
                  </td>
                  {onAddPublication ? (
                    <td className="pr-4 text-right">
                      <button
                        type="button"
                        className="rounded-md px-2 py-1 text-xs text-primary hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddPublication(data.topicId, data.stageId!)
                        }}
                      >
                        +
                      </button>
                    </td>
                  ) : null}
                </tr>
              )
            }

            return (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-border/50 transition-colors hover:bg-accent/30',
                  isAltPub && 'bg-muted/20',
                )}
              >
                <td className={cn('pl-[3.75rem] pr-4', cellPad)}>
                  <div className="flex items-center gap-2.5">
                    <ProviderPill provider={data.provider} />
                    <span className="truncate font-medium">{data.name}</span>
                    {data.channelName ? (
                      <span className="text-xs text-muted-foreground">
                        {data.channelName}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className={cn('px-4', cellPad)}>
                  {data.status ? (
                    <StatusBadge status={data.status} />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <CircleSlash className="size-3.5" />
                      <span className="text-xs">—</span>
                    </span>
                  )}
                </td>
                {showDateColumn ? (
                  <td className={cn('px-4 whitespace-nowrap', cellPad)}>
                    <DateCell
                      value={data.publicationDate}
                      presentation={presentation}
                    />
                  </td>
                ) : null}
                {showSubscribersColumn ? (
                  <td className={cn('px-4 text-right', cellPad)}>
                    <SubscribersCell
                      value={data.subscribersAtPublish}
                      presentation={presentation}
                    />
                  </td>
                ) : null}
                {showCommentColumn ? (
                  <td className={cn('max-w-[14rem] px-4', cellPad)}>
                    <CommentCell value={data.comment} presentation={presentation} />
                  </td>
                ) : null}
                <td
                  className={cn(
                    'px-4 text-right font-mono tabular-nums',
                    cellPad,
                  )}
                >
                  {data.status === PublicationStatus.PUBLISHED
                    ? formatNumber(data.metrics.views)
                    : '—'}
                </td>
                <td
                  className={cn(
                    'px-4 text-right font-mono tabular-nums',
                    cellPad,
                  )}
                >
                  {data.status === PublicationStatus.PUBLISHED
                    ? formatNumber(data.metrics.likes)
                    : '—'}
                </td>
                <td
                  className={cn(
                    'px-4 text-right font-mono tabular-nums',
                    cellPad,
                  )}
                >
                  {data.status === PublicationStatus.PUBLISHED
                    ? formatNumber(data.metrics.comments)
                    : '—'}
                </td>
                <td
                  className={cn(
                    'px-4 text-right font-mono text-xs text-muted-foreground tabular-nums',
                    presentation && 'text-sm',
                    cellPad,
                  )}
                >
                  {data.status === PublicationStatus.PUBLISHED
                    ? engagementRate(data.metrics)
                    : '—'}
                </td>
                {onAddPublication ? <td /> : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
