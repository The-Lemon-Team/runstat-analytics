import { ArrowDown, ArrowUp, Eye, Users } from 'lucide-react'
import { formatNumber, formatSubscriberDate } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/card'
import {
  formatPublicationDate,
  type WeeklyPublicationInsight,
} from '@/features/dashboard/lib/sidebar-user-stats'
import { ProviderBadge } from './ProviderBadge'

type MetricRow = {
  label: string
  atPublish: number | null
  current: number
  delta: number | null
}

function buildMetricRows(publication: WeeklyPublicationInsight): MetricRow[] {
  const rows: MetricRow[] = [
    {
      label: 'Лайки',
      atPublish: publication.likesAtPublish,
      current: publication.likes,
      delta: publication.likesDelta,
    },
    {
      label: 'Комментарии',
      atPublish: publication.commentsAtPublish,
      current: publication.comments,
      delta: publication.commentsDelta,
    },
    {
      label: 'Просмотры',
      atPublish: publication.viewsAtPublish,
      current: publication.views,
      delta: publication.viewsDelta,
    },
  ]

  if (publication.subscribersAtPublish !== null) {
    rows.push({
      label: 'Подписчики',
      atPublish: publication.subscribersAtPublish,
      current:
        publication.subscribersAtPublish +
        (publication.subscribersDelta ?? 0),
      delta: publication.subscribersDelta,
    })
  }

  return rows
}

function DeltaCell({ delta }: { delta: number | null }) {
  if (delta === null) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-mono font-semibold tabular-nums',
        delta > 0 && 'text-emerald-600 dark:text-emerald-400',
        delta < 0 && 'text-destructive',
        delta === 0 && 'text-muted-foreground',
      )}
    >
      {delta > 0 ? <ArrowUp className="size-3" /> : null}
      {delta < 0 ? <ArrowDown className="size-3" /> : null}
      {delta > 0 ? '+' : ''}
      {formatNumber(delta)}
    </span>
  )
}

export function PublicationMetricsModal({
  open,
  onOpenChange,
  publication,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publication: WeeklyPublicationInsight | null
}) {
  if (!publication) return null

  const rows = buildMetricRows(publication)
  const hasBaseline = rows.some((row) => row.atPublish !== null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="relative max-w-md"
      >
        <DialogHeader>
          <div className="flex items-start gap-3 pr-8">
            <ProviderBadge providerId={publication.providerId} size="sm" />
            <div className="min-w-0">
              <DialogTitle>{publication.label}</DialogTitle>
              <DialogDescription>
                {publication.topicName} ·{' '}
                {formatPublicationDate(publication.publishedAt)}
              </DialogDescription>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatSubscriberDate(publication.publishedAt)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {hasBaseline
              ? 'Сравнение показателей на момент публикации и сейчас.'
              : 'Актуальные показатели публикации. Снимок на момент выхода пока недоступен.'}
          </p>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Метрика</th>
                  <th className="px-3 py-2 font-medium">На публикации</th>
                  <th className="px-3 py-2 font-medium">Сейчас</th>
                  <th className="px-3 py-2 font-medium">Δ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium">{row.label}</td>
                    <td className="px-3 py-2.5 font-mono tabular-nums text-muted-foreground">
                      {row.atPublish !== null
                        ? formatNumber(row.atPublish)
                        : '—'}
                    </td>
                    <td className="px-3 py-2.5 font-mono tabular-nums">
                      {formatNumber(row.current)}
                    </td>
                    <td className="px-3 py-2.5">
                      <DeltaCell delta={row.delta} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {publication.subscribersAtPublish === null ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="size-3.5 shrink-0" />
              Подписчики недоступны — площадка не подключена
            </p>
          ) : null}

          {hasBaseline ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="size-3.5 shrink-0" />
              Δ — прирост с момента публикации поста
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
