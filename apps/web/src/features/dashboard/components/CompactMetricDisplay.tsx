import type { LucideIcon } from 'lucide-react'
import { formatNumber } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'
import { DeltaBadge } from './CompactMetricControl'

export function CompactMetricDisplay({
  icon: Icon,
  iconClassName,
  value,
  delta,
}: {
  icon: LucideIcon
  iconClassName: string
  value: number
  delta?: number
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
        {delta !== undefined ? <DeltaBadge delta={delta} /> : null}
      </span>
      <span className="px-0.5 font-mono text-[11px] tabular-nums text-foreground">
        {formatNumber(value)}
      </span>
    </div>
  )
}
