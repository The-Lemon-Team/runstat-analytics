import { Eye, MessageCircle, Plus, ThumbsUp } from 'lucide-react'
import type { StageView } from '@/lib/dashboard-utils'
import { aggregateStageView, formatNumber } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { PublicationSlot } from './PublicationSlot'

export function StageRow({
  stage,
  index,
  onAddPublication,
  compact = false,
}: {
  stage: StageView
  index: number
  onAddPublication: (stageId: string) => void
  compact?: boolean
}) {
  const totals = aggregateStageView(stage)
  const publishedCount = stage.publications.filter(
    (p) => p.status === 'published',
  ).length

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-muted/20',
        compact ? 'p-2' : 'rounded-xl p-3 md:p-4',
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-center justify-between',
          compact ? 'mb-2 gap-2' : 'mb-3 gap-3',
        )}
      >
        <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
          <span
            className={cn(
              'flex shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono font-semibold text-primary',
              compact ? 'size-6 text-[10px]' : 'size-7 text-xs',
            )}
          >
            {index + 1}
          </span>
          <div>
            <h4
              className={cn(
                'font-semibold leading-tight',
                compact ? 'text-xs' : 'text-sm',
              )}
            >
              {stage.name}
            </h4>
            {stage.hint ? (
              <p className="text-[10px] text-muted-foreground">{stage.hint}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Eye className="size-3" />
              {formatNumber(totals.views)}
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <ThumbsUp className="size-3" />
              {formatNumber(totals.likes)}
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <MessageCircle className="size-3" />
              {formatNumber(totals.comments)}
            </span>
          </div>
          <Badge variant="secondary" className="h-5 px-1.5 font-mono text-[10px]">
            {publishedCount}/{stage.publications.length}
          </Badge>
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          compact ? 'gap-1.5' : 'gap-2.5',
        )}
      >
        {stage.publications.map((pub) => (
          <PublicationSlot key={pub.id} publication={pub} compact={compact} />
        ))}

        <button
          type="button"
          onClick={() => onAddPublication(stage.id)}
          className={cn(
            'flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-transparent text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/40 hover:text-foreground',
            compact ? 'min-h-[84px]' : 'min-h-[104px] rounded-xl',
          )}
        >
          <span
            className={cn(
              'flex items-center justify-center rounded-full bg-primary/10 text-primary',
              compact ? 'size-6' : 'size-7',
            )}
          >
            <Plus className={compact ? 'size-3.5' : 'size-4'} />
          </span>
          <span className="text-[10px] font-medium">Add Publication</span>
        </button>
      </div>
    </div>
  )
}
