import { useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Eye, MessageCircle, ThumbsUp } from 'lucide-react'
import type { MetricHistoryEntryDto } from '@spt/shared'
import { Separator } from '@/components/ui/separator'
import { useGetMetricHistoryQuery } from '@/app/api/baseApi'
import { useDashboardShell } from '@/features/dashboard/DashboardShellContext'
import {
  entryHasMetricChanges,
  pickLatestMetricHistoryEntry,
  showsPublicationSubscriberFooter,
} from '@/features/dashboard/lib/publication-footer'
import { formatNumber, formatSubscriberDate } from '@/lib/dashboard-utils'
import type { PublicationView } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'
import { DeltaBadge } from './CompactMetricControl'
import type { MetricHistoryFocus } from './MetricHistoryModal'

type MetricFooterField = {
  key: MetricHistoryFocus
  icon: LucideIcon
  iconClassName: string
  value: (entry: MetricHistoryEntryDto) => number
  delta: (entry: MetricHistoryEntryDto) => number
}

const METRIC_FIELDS: MetricFooterField[] = [
  {
    key: 'views',
    icon: Eye,
    iconClassName: 'text-muted-foreground/80',
    value: (e) => e.views,
    delta: (e) => e.viewsDelta,
  },
  {
    key: 'likes',
    icon: ThumbsUp,
    iconClassName: 'text-rose-500/80',
    value: (e) => e.likes,
    delta: (e) => e.likesDelta,
  },
  {
    key: 'comments',
    icon: MessageCircle,
    iconClassName: 'text-sky-500/80',
    value: (e) => e.comments,
    delta: (e) => e.commentsDelta,
  },
]

function MetricUpdateChip({
  field,
  entry,
  onOpenHistory,
}: {
  field: MetricFooterField
  entry: MetricHistoryEntryDto
  onOpenHistory?: (metric: MetricHistoryFocus) => void
}) {
  const Icon = field.icon
  const delta = field.delta(entry)
  const value = field.value(entry)

  const chipClassName = cn(
    'inline-flex items-center gap-1 rounded-md border border-dashed border-border/70',
    'bg-transparent px-1.5 py-0.5 transition-all',
    onOpenHistory &&
      'hover:border-border hover:bg-gradient-to-br hover:from-muted/55 hover:to-muted/20',
    onOpenHistory &&
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30',
  )

  const inner = (
    <>
      <Icon className={cn('size-3 shrink-0', field.iconClassName)} />
      <DeltaBadge delta={delta} />
    </>
  )

  return (
    <div className="inline-flex items-center gap-1">
      {onOpenHistory ? (
        <button
          type="button"
          onClick={() => onOpenHistory(field.key)}
          title="История"
          className={chipClassName}
        >
          {inner}
        </button>
      ) : (
        <span className={chipClassName}>{inner}</span>
      )}
      <span className="px-0.5 font-mono text-[11px] font-medium leading-none tabular-nums">
        {formatNumber(value)}
      </span>
    </div>
  )
}

export function PublicationMetricUpdateSection({
  publication,
  compact = false,
  onOpenHistory,
}: {
  publication: PublicationView
  compact?: boolean
  onOpenHistory?: (metric: MetricHistoryFocus) => void
}) {
  const { subscriberSources } = useDashboardShell()
  const isPersistedPublication = !publication.id.startsWith('pub-')
  const localEntry = publication.metricHistory?.find(entryHasMetricChanges)
  const skipFetch =
    !isPersistedPublication ||
    showsPublicationSubscriberFooter(publication, subscriberSources)

  const { data, refetch } = useGetMetricHistoryQuery(
    { publicationId: publication.id },
    { skip: skipFetch || Boolean(localEntry) },
  )

  useEffect(() => {
    if (skipFetch || localEntry || !isPersistedPublication) return
    void refetch()
  }, [
    publication.metrics.views,
    publication.metrics.likes,
    publication.metrics.comments,
    skipFetch,
    localEntry,
    isPersistedPublication,
    refetch,
  ])

  if (showsPublicationSubscriberFooter(publication, subscriberSources)) {
    return null
  }

  const entry = pickLatestMetricHistoryEntry(
    localEntry,
    data?.items.find(entryHasMetricChanges),
  )
  if (!entry) return null

  const changedFields = METRIC_FIELDS.filter((field) => field.delta(entry) !== 0)
  if (changedFields.length === 0) return null

  return (
    <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-1.5')}>
      <Separator className="bg-border/60" />
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">
            Последнее обновление
          </p>
          <p className="truncate text-[9px] text-muted-foreground/80">
            {formatSubscriberDate(entry.capturedAt)}
          </p>
        </div>
        <div className="inline-flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {changedFields.map((field) => (
            <MetricUpdateChip
              key={field.key}
              field={field}
              entry={entry}
              onOpenHistory={onOpenHistory}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
