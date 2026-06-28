import { useState } from 'react'
import { Check, Clock, ExternalLink, Eye, MessageCircle, ThumbsUp } from 'lucide-react'
import type { MetricHistoryEntryDto } from '@spt/shared'
import { MetricCaptureSource } from '@spt/shared'
import { useUpdateManualMetricsMutation } from '@/app/api/baseApi'
import { hasHighlightMetricDeltas } from '@spt/shared'
import type { PublicationView } from '@/lib/dashboard-utils'
import { getProviderUi } from '@/lib/providers'
import { cn } from '@/lib/utils'
import {
  CompactMetricControl,
  type MetricField,
} from './CompactMetricControl'
import {
  MetricHistoryModal,
  type MetricHistoryFocus,
  type MetricHistoryMode,
} from './MetricHistoryModal'
import { ProviderBadge } from './ProviderBadge'
import { PublicationMetricUpdateSection } from './PublicationMetricUpdateSection'
import { PublicationSubscriberSection } from './PublicationSubscriberSection'
import { PublicationTrackingBadge } from './PublicationTrackingBadge'

function StatusDot({ status }: { status: PublicationView['status'] }) {
  if (status === 'published') {
    return (
      <span className="inline-flex size-4 items-center justify-center rounded-full bg-success text-success-foreground">
        <Check className="size-3" />
      </span>
    )
  }
  if (status === 'scheduled') {
    return (
      <span className="inline-flex size-4 items-center justify-center rounded-full bg-warning text-warning-foreground">
        <Clock className="size-3" />
      </span>
    )
  }
  return null
}

export function OfflinePublicationCard({
  publication,
  compact = false,
  onMetricsSaved,
  onEdit,
}: {
  publication: PublicationView
  compact?: boolean
  onMetricsSaved?: (
    publicationId: string,
    metrics: { views: number; likes: number; comments: number },
    historyEntry: MetricHistoryEntryDto,
  ) => void
  onEdit?: () => void
}) {
  const provider = getProviderUi(publication.providerId)
  const hasHighlight = hasHighlightMetricDeltas(publication.highlightMetricDeltas)
  const viewsDelta = publication.highlightMetricDeltas?.views ?? 0
  const likesDelta = publication.highlightMetricDeltas?.likes ?? 0
  const commentsDelta = publication.highlightMetricDeltas?.comments ?? 0
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyMetric, setHistoryMetric] = useState<MetricHistoryFocus>('likes')
  const [historyMode, setHistoryMode] = useState<MetricHistoryMode>('history')
  const [savingField, setSavingField] = useState<MetricField | null>(null)
  const [updateMetrics] = useUpdateManualMetricsMutation()

  async function handleSaveMetric(field: MetricField, newValue: number) {
    const views =
      field === 'views' ? newValue : publication.metrics.views
    const likes =
      field === 'likes' ? newValue : publication.metrics.likes
    const comments =
      field === 'comments' ? newValue : publication.metrics.comments

    const viewsDelta = views - publication.metrics.views
    const likesDelta = likes - publication.metrics.likes
    const commentsDelta = comments - publication.metrics.comments

    if (viewsDelta === 0 && likesDelta === 0 && commentsDelta === 0) return

    const historyEntry: MetricHistoryEntryDto = {
      id: `hist-local-${Date.now()}`,
      source: MetricCaptureSource.MANUAL,
      views,
      likes,
      comments,
      shares: 0,
      viewsDelta,
      likesDelta,
      commentsDelta,
      capturedAt: new Date().toISOString(),
    }

    const isPersistedPublication = !publication.id.startsWith('pub-')

    setSavingField(field)
    try {
      if (isPersistedPublication) {
        await updateMetrics({
          publicationId: publication.id,
          views,
          likes,
          comments,
        }).unwrap()
      }

      onMetricsSaved?.(publication.id, { views, likes, comments }, historyEntry)
    } finally {
      setSavingField(null)
    }
  }

  function openHistory(metric: MetricHistoryFocus, mode: MetricHistoryMode) {
    setHistoryMetric(metric)
    setHistoryMode(mode)
    setHistoryOpen(true)
  }

  function currentValueForMetric(metric: MetricHistoryFocus) {
    if (metric === 'views') return publication.metrics.views
    if (metric === 'likes') return publication.metrics.likes
    return publication.metrics.comments
  }

  return (
    <>
      <div
        className={cn(
          'group/slot relative flex flex-col border bg-card transition-colors',
          compact ? 'gap-1.5 rounded-lg p-2' : 'gap-2 rounded-xl p-3',
          hasHighlight
            ? 'border-destructive/30 bg-destructive/[0.03] hover:border-destructive/45 hover:bg-destructive/[0.06]'
            : 'border-amber-500/25 hover:border-amber-500/40 hover:bg-amber-500/5',
        )}
      >
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <ProviderBadge
              providerId={publication.providerId}
              size={compact ? 'xs' : 'sm'}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium leading-tight">
                {publication.label}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {provider.name}
              </p>
              {publication.comment ? (
                <p
                  className={cn(
                    'mt-0.5 line-clamp-2 text-muted-foreground',
                    compact ? 'text-[10px]' : 'text-[11px]',
                  )}
                  title={publication.comment}
                >
                  {publication.comment}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <PublicationTrackingBadge mode="manual" onEdit={onEdit} />
            <StatusDot status={publication.status} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CompactMetricControl
              field="views"
              icon={Eye}
              iconClassName="text-muted-foreground/80"
              value={publication.metrics.views}
              delta={viewsDelta}
              prominentDelta={hasHighlight && viewsDelta < 0}
              onUpdate={() => openHistory('views', 'update')}
            />
            <CompactMetricControl
              field="likes"
              icon={ThumbsUp}
              iconClassName="text-rose-500/80"
              value={publication.metrics.likes}
              delta={likesDelta}
              prominentDelta={hasHighlight && likesDelta < 0}
              onUpdate={() => openHistory('likes', 'update')}
            />
            <CompactMetricControl
              field="comments"
              icon={MessageCircle}
              iconClassName="text-sky-500/80"
              value={publication.metrics.comments}
              delta={commentsDelta}
              prominentDelta={hasHighlight && commentsDelta < 0}
              onUpdate={() => openHistory('comments', 'update')}
            />
          </div>
          {publication.url ? (
            <a
              href={publication.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/slot:opacity-100"
              title="Открыть пост"
            >
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>

        <PublicationSubscriberSection publication={publication} compact={compact} />
        <PublicationMetricUpdateSection
          publication={publication}
          compact={compact}
          onOpenHistory={(metric) => openHistory(metric, 'history')}
        />
      </div>

      <MetricHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        publicationId={publication.id}
        providerId={publication.providerId}
        label={publication.label}
        metric={historyMetric}
        mode={historyMode}
        currentValue={currentValueForMetric(historyMetric)}
        isSaving={savingField === historyMetric}
        onSave={
          historyMode === 'update'
            ? (value) => handleSaveMetric(historyMetric, value)
            : undefined
        }
        localHistory={
          publication.id.startsWith('pub-')
            ? (publication.metricHistory ?? [])
            : undefined
        }
      />
    </>
  )
}
