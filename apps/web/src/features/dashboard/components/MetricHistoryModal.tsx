import { useCallback, useEffect, useRef, useState } from 'react'
import type { MetricHistoryEntryDto } from '@spt/shared'
import { MetricCaptureSource } from '@spt/shared'
import { Loader2 } from 'lucide-react'
import { useLazyGetMetricHistoryQuery } from '@/app/api/baseApi'
import { formatNumber, formatSubscriberDate } from '@/lib/dashboard-utils'
import { METRIC_CAPTURE_SOURCE_LABELS } from '@/lib/metric-tracking'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProviderBadge } from './ProviderBadge'

function SourceBadge({ source }: { source: MetricHistoryEntryDto['source'] }) {
  const manual = source === MetricCaptureSource.MANUAL
  return (
    <Badge
      variant="outline"
      className={cn(
        'px-1.5 py-0 text-[10px] font-medium',
        manual
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
          : 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
      )}
    >
      {METRIC_CAPTURE_SOURCE_LABELS[source]}
    </Badge>
  )
}

function DeltaValue({
  value,
  label,
}: {
  value: number
  label: string
}) {
  return (
    <span
      className={cn(
        'font-mono text-xs tabular-nums',
        value > 0 && 'text-emerald-600 dark:text-emerald-400',
        value < 0 && 'text-destructive',
        value === 0 && 'text-muted-foreground',
      )}
      title={label}
    >
      {value > 0 ? '+' : ''}
      {formatNumber(value)}
    </span>
  )
}

export type MetricHistoryFocus = 'views' | 'likes' | 'comments'
export type MetricHistoryMode = 'history' | 'update'

const METRIC_LABELS: Record<MetricHistoryFocus, string> = {
  views: 'просмотров',
  likes: 'лайков',
  comments: 'комментариев',
}

const METRIC_LABELS_NOMINATIVE: Record<MetricHistoryFocus, string> = {
  views: 'Просмотры',
  likes: 'Лайки',
  comments: 'Комментарии',
}

function metricValue(entry: MetricHistoryEntryDto, metric: MetricHistoryFocus) {
  if (metric === 'views') return entry.views
  if (metric === 'likes') return entry.likes
  return entry.comments
}

function metricDelta(entry: MetricHistoryEntryDto, metric: MetricHistoryFocus) {
  if (metric === 'views') return entry.viewsDelta
  if (metric === 'likes') return entry.likesDelta
  return entry.commentsDelta
}

export function MetricHistoryModal({
  open,
  onOpenChange,
  publicationId,
  providerId,
  label,
  localHistory,
  metric = 'likes',
  mode = 'history',
  currentValue = 0,
  onSave,
  isSaving = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicationId: string | null
  providerId: string
  label: string
  localHistory?: MetricHistoryEntryDto[]
  metric?: MetricHistoryFocus
  mode?: MetricHistoryMode
  currentValue?: number
  onSave?: (value: number) => Promise<void>
  isSaving?: boolean
}) {
  const [items, setItems] = useState<MetricHistoryEntryDto[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [draft, setDraft] = useState(String(currentValue))
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [fetchHistory, { isFetching }] = useLazyGetMetricHistoryQuery()
  const useLocalHistory = localHistory !== undefined

  const loadPage = useCallback(
    async (nextCursor?: string, reset = false) => {
      if (!publicationId || useLocalHistory) return
      const page = await fetchHistory({
        publicationId,
        cursor: nextCursor,
      }).unwrap()

      setItems((prev) => (reset ? page.items : [...prev, ...page.items]))
      setCursor(page.nextCursor)
      setHasMore(Boolean(page.nextCursor))
    },
    [fetchHistory, publicationId, useLocalHistory],
  )

  useEffect(() => {
    if (!open) return

    if (useLocalHistory) {
      setItems(localHistory ?? [])
      setCursor(null)
      setHasMore(false)
      return
    }

    if (!publicationId) return
    setItems([])
    setCursor(null)
    setHasMore(true)
    void loadPage(undefined, true)
  }, [open, publicationId, loadPage, useLocalHistory, localHistory])

  useEffect(() => {
    if (open) {
      setDraft(String(currentValue))
    }
  }, [open, currentValue])

  useEffect(() => {
    if (!open || !hasMore || isFetching || useLocalHistory) return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && cursor) {
          void loadPage(cursor)
        }
      },
      { rootMargin: '120px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [open, hasMore, isFetching, cursor, loadPage, useLocalHistory])

  const latestEntry = items[0]
  const latestRecordedValue = latestEntry
    ? metricValue(latestEntry, metric)
    : null

  const modalTitle =
    mode === 'update'
      ? `Обновить ${METRIC_LABELS[metric]}`
      : `История ${METRIC_LABELS[metric]}`

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!onSave) return

    const trimmed = draft.trim()
    if (!trimmed) return

    const parsed = Number.parseInt(trimmed, 10)
    if (!Number.isFinite(parsed)) return

    const next = Math.max(0, parsed)
    if (next === currentValue) return

    await onSave(next)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="relative max-h-[80vh] max-w-md overflow-hidden"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 pr-8">
            <ProviderBadge providerId={providerId} size="sm" />
            <div className="min-w-0">
              <DialogTitle>{modalTitle}</DialogTitle>
              <DialogDescription className="truncate">{label}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {mode === 'update' ? (
          <div className="mt-4 space-y-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Текущее значение</p>
                <p className="mt-0.5 font-mono text-base font-semibold tabular-nums">
                  {formatNumber(currentValue)}
                </p>
              </div>
              {latestRecordedValue !== null ? (
                <div>
                  <p className="text-muted-foreground">Последняя запись</p>
                  <p className="mt-0.5 font-mono text-base font-semibold tabular-nums">
                    {formatNumber(latestRecordedValue)}
                  </p>
                  {latestEntry ? (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatSubscriberDate(latestEntry.capturedAt)}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-2">
              <Label htmlFor="metric-update-value" className="text-xs">
                Новое значение — {METRIC_LABELS_NOMINATIVE[metric].toLowerCase()}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="metric-update-value"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft}
                  disabled={isSaving}
                  onChange={(event) => setDraft(event.target.value)}
                  className="h-8 font-mono text-sm tabular-nums"
                />
                <Button type="submit" size="sm" disabled={isSaving} className="shrink-0">
                  {isSaving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    'Сохранить'
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        <div
          className={cn(
            'max-h-[50vh] space-y-2 overflow-y-auto pr-1',
            mode === 'update' ? 'mt-3' : 'mt-4',
          )}
        >
          {mode === 'update' ? (
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              История изменений
            </p>
          ) : null}

          {items.length === 0 && !isFetching ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Изменений пока не зафиксировано
            </p>
          ) : (
            items.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatSubscriberDate(entry.capturedAt)}
                  </span>
                  <SourceBadge source={entry.source} />
                </div>

                <div className="mt-2">
                  <p className="font-mono text-sm font-medium tabular-nums">
                    {formatNumber(metricValue(entry, metric))}
                    <span className="ml-1.5 text-xs font-normal">
                      <DeltaValue
                        value={metricDelta(entry, metric)}
                        label={`Δ ${METRIC_LABELS[metric]}`}
                      />
                    </span>
                  </p>
                </div>
              </div>
            ))
          )}

          {!useLocalHistory ? <div ref={sentinelRef} className="h-1" /> : null}
          {isFetching ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Загрузка…
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
