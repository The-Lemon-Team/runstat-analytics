import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubscriberSnapshotDto } from '@spt/shared'
import { useLazyGetSubscriberHistoryQuery } from '@/app/api/baseApi'
import { formatNumber, formatSubscriberDate } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/card'
import { ProviderBadge } from './ProviderBadge'

export function SubscriberHistoryModal({
  open,
  onOpenChange,
  sourceId,
  providerId,
  handle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceId: string | null
  providerId: string
  handle: string
}) {
  const [items, setItems] = useState<SubscriberSnapshotDto[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [fetchHistory, { isFetching }] = useLazyGetSubscriberHistoryQuery()

  const loadPage = useCallback(
    async (nextCursor?: string, reset = false) => {
      if (!sourceId) return
      const page = await fetchHistory({
        sourceId,
        cursor: nextCursor,
      }).unwrap()

      setItems((prev) => (reset ? page.items : [...prev, ...page.items]))
      setCursor(page.nextCursor)
      setHasMore(Boolean(page.nextCursor))
    },
    [fetchHistory, sourceId],
  )

  useEffect(() => {
    if (!open || !sourceId) return
    setItems([])
    setCursor(null)
    setHasMore(true)
    void loadPage(undefined, true)
  }, [open, sourceId, loadPage])

  useEffect(() => {
    if (!open || !hasMore || isFetching) return
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
  }, [open, hasMore, isFetching, cursor, loadPage])

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
              <DialogTitle>История подписчиков</DialogTitle>
              <DialogDescription className="truncate">{handle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {items.length === 0 && !isFetching ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Изменений пока не зафиксировано
            </p>
          ) : (
            items.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {formatNumber(entry.count)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatSubscriberDate(entry.capturedAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 font-mono text-sm tabular-nums',
                    entry.delta > 0 && 'text-success',
                    entry.delta < 0 && 'text-destructive',
                    entry.delta === 0 && 'text-muted-foreground',
                  )}
                >
                  {entry.delta > 0 ? '+' : ''}
                  {entry.delta}
                </span>
              </div>
            ))
          )}

          {isFetching ? (
            <p className="py-3 text-center text-xs text-muted-foreground">
              Загрузка…
            </p>
          ) : null}

          <div ref={sentinelRef} className="h-1" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
