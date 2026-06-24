import type { LucideIcon } from 'lucide-react'
import { BarChart3 } from 'lucide-react'
import { formatNumber } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'

export type MetricField = 'views' | 'likes' | 'comments'

const METRIC_ARIA_LABELS: Record<MetricField, string> = {
  views: 'Количество просмотров',
  likes: 'Количество лайков',
  comments: 'Количество комментариев',
}

export function DeltaBadge({
  delta,
  prominent = false,
}: {
  delta: number
  /** Stronger styling for attention-worthy negative changes. */
  prominent?: boolean
}) {
  if (delta === 0) return null

  return (
    <span
      className={cn(
        'font-mono text-[9px] font-semibold leading-none tabular-nums',
        delta > 0 && 'text-emerald-600 dark:text-emerald-400',
        delta < 0 &&
          (prominent
            ? 'rounded bg-destructive/15 px-1 py-0.5 text-destructive ring-1 ring-destructive/25'
            : 'text-destructive'),
      )}
    >
      {delta > 0 ? '+' : ''}
      {formatNumber(delta)}
    </span>
  )
}

export function CompactMetricControl({
  field,
  icon: Icon,
  iconClassName,
  value,
  delta,
  onUpdate,
  prominentDelta = false,
}: {
  field: MetricField
  icon: LucideIcon
  iconClassName: string
  value: number
  delta: number
  onUpdate: () => void
  prominentDelta?: boolean
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-dashed border-border/60',
        'bg-transparent px-1 py-0.5',
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-dashed border-border/70',
          'bg-transparent px-1.5 py-0.5',
        )}
      >
        <Icon className={cn('size-3 shrink-0', iconClassName)} />
        <DeltaBadge delta={delta} prominent={prominentDelta} />
      </span>

      <span
        className="px-0.5 font-mono text-[11px] tabular-nums text-foreground"
        aria-label={METRIC_ARIA_LABELS[field]}
      >
        {formatNumber(value)}
      </span>

      <button
        type="button"
        onClick={onUpdate}
        title="Обновить статистику"
        className={cn(
          'inline-flex items-center rounded-md border border-dashed border-border/70',
          'bg-transparent p-0.5 transition-all',
          'hover:border-border hover:bg-gradient-to-br hover:from-muted/55 hover:to-muted/20',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30',
        )}
      >
        <BarChart3 className="size-2.5 text-muted-foreground" />
      </button>
    </div>
  )
}
