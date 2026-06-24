import { useState } from 'react'
import { Users } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useDashboardShell } from '@/features/dashboard/DashboardShellContext'
import { resolvePublicationSubscriberInsight } from '@/features/dashboard/lib/sidebar-user-stats'
import { formatNumber } from '@/lib/dashboard-utils'
import type { PublicationView } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'
import { DeltaBadge } from './CompactMetricControl'
import { SubscriberHistoryModal } from './SubscriberHistoryModal'

export function PublicationSubscriberSection({
  publication,
  compact = false,
}: {
  publication: PublicationView
  compact?: boolean
}) {
  const { subscriberSources } = useDashboardShell()
  const [historyOpen, setHistoryOpen] = useState(false)

  if (!publication.subscriberSourceId) return null

  const insight = resolvePublicationSubscriberInsight(
    publication,
    subscriberSources,
  )
  if (!insight) return null

  const handle = publication.subscriberSourceHandle ?? insight.handle
  const isPersistedPublication = !publication.id.startsWith('pub-')
  const historyEnabled =
    Boolean(publication.publishedAt) && isPersistedPublication

  return (
    <>
      <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-1.5')}>
        <Separator className="bg-border/60" />
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">
              Подписчики до публикации
            </p>
            {handle ? (
              <p className="truncate text-[9px] text-muted-foreground/80">
                {handle}
              </p>
            ) : null}
          </div>
          <div className="inline-flex shrink-0 items-center gap-1">
            {historyEnabled ? (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                title="История подписчиков с момента публикации"
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border border-dashed border-border/70',
                  'bg-transparent px-1.5 py-0.5 transition-all',
                  'hover:border-border hover:bg-gradient-to-br hover:from-muted/55 hover:to-muted/20',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30',
                )}
              >
                <Users className="size-3 shrink-0 text-muted-foreground/80" />
                <DeltaBadge delta={insight.delta} />
              </button>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5">
                <Users className="size-3 shrink-0 text-muted-foreground/80" />
              </span>
            )}
            <span className="px-0.5 font-mono text-[11px] font-medium leading-none tabular-nums">
              {formatNumber(insight.atPublish)}
            </span>
          </div>
        </div>
      </div>

      {historyEnabled ? (
        <SubscriberHistoryModal
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          sourceId={insight.sourceId}
          providerId={publication.providerId}
          handle={handle}
          publicationScope={{
            publicationId: publication.id,
            publicationLabel: publication.label,
            since: publication.publishedAt,
          }}
        />
      ) : null}
    </>
  )
}
