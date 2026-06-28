import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Heart,
  Layers,
  MessageCircle,
} from 'lucide-react'
import type { TopicDto } from '@spt/shared'
import { PublicationStatus } from '@spt/shared'
import { formatNumber } from '@/features/content-table/lib/metrics'
import { ProviderBadge } from '@/features/dashboard/components/ProviderBadge'
import { formatSubscriberDate } from '@/lib/dashboard-utils'
import { providerIdFromEnum } from '@/lib/providers'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  filterTopicPublications,
  type TopicsFilterOptions,
} from '@/features/topics/lib/topic-filters'
import { getPublicationSubscribersAtPublish } from '@/features/dashboard/lib/sidebar-user-stats'
import type { LiveSubscriberSource } from '@/lib/provider-connections'

const STATUS_LABELS: Record<PublicationStatus, string> = {
  [PublicationStatus.PUBLISHED]: 'Опубликовано',
  [PublicationStatus.PLANNED]: 'Запланировано',
}

function PublicationMetrics({
  status,
  metrics,
  compact,
  presentation,
}: {
  status: PublicationStatus
  metrics: { views: number; likes: number; comments: number }
  compact?: boolean
  presentation?: boolean
}) {
  if (status !== PublicationStatus.PUBLISHED) {
    return null
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center text-muted-foreground',
        presentation
          ? 'gap-4 text-sm'
          : compact
            ? 'gap-2 text-[11px]'
            : 'gap-3 text-xs',
      )}
    >
      {presentation ? (
        <span className="inline-flex items-center gap-1.5 tabular-nums font-medium text-foreground">
          {formatNumber(metrics.views)} просм.
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1 tabular-nums">
        <Heart className={presentation ? 'size-4' : compact ? 'size-3' : 'size-3.5'} />
        {formatNumber(metrics.likes)}
      </span>
      <span className="inline-flex items-center gap-1 tabular-nums">
        <MessageCircle
          className={presentation ? 'size-4' : compact ? 'size-3' : 'size-3.5'}
        />
        {formatNumber(metrics.comments)}
      </span>
    </div>
  )
}

function TopicListGroup({
  topic,
  filters,
  compact = false,
  presentation = false,
  subscriberSources = [],
}: {
  topic: TopicDto
  filters: Pick<TopicsFilterOptions, 'dateRange'>
  compact?: boolean
  presentation?: boolean
  subscriberSources?: LiveSubscriberSource[]
}) {
  const [open, setOpen] = useState(true)
  const publications = filterTopicPublications(topic, filters)
  const totalPublications = topic.stages.reduce(
    (sum, stage) => sum + stage.publications.length,
    0,
  )

  return (
    <li
      className={cn(
        'overflow-hidden border border-border',
        presentation
          ? 'rounded-lg bg-background'
          : compact
            ? 'rounded-lg bg-muted/10'
            : 'rounded-xl bg-card',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex w-full items-center text-left transition-colors hover:bg-muted/40',
          presentation
            ? 'gap-3 px-4 py-3'
            : compact
              ? 'gap-2 px-2.5 py-2'
              : 'gap-3 px-4 py-3',
        )}
      >
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary',
            presentation ? 'size-9' : compact ? 'size-7' : 'size-10 rounded-lg',
          )}
        >
          <Layers className={presentation ? 'size-4' : compact ? 'size-3.5' : 'size-5'} />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate font-medium',
              presentation ? 'text-base' : compact ? 'text-sm' : undefined,
            )}
          >
            {topic.name}
          </p>
          {!presentation ? (
            <p className="text-[11px] text-muted-foreground">
              {formatSubscriberDate(topic.createdAt)} · {topic.stages.length}{' '}
              {topic.stages.length === 1 ? 'этап' : 'этапов'} ·{' '}
              {filters.dateRange.enabled
                ? `${publications.length} из ${totalPublications}`
                : totalPublications}{' '}
              {totalPublications === 1 ? 'публикация' : 'публикаций'}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {publications.length}{' '}
              {publications.length === 1 ? 'публикация' : 'публикаций'}
            </p>
          )}
        </div>

        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        publications.length === 0 ? (
          <p
            className={cn(
              'border-t border-border text-muted-foreground',
              compact ? 'px-2.5 py-2 text-xs' : 'px-4 py-3 text-sm',
            )}
          >
            Нет публикаций для выбранного периода
          </p>
        ) : (
          <ul className="border-t border-border">
            {publications.map((pub) => {
              const subscribersAtPublish = presentation
                ? getPublicationSubscribersAtPublish(pub, subscriberSources)
                : null

              return (
              <li
                key={pub.id}
                className={cn(
                  'flex items-center gap-2 border-b border-border/60 last:border-b-0',
                  presentation
                    ? 'gap-4 px-4 py-3 sm:pl-12'
                    : compact
                      ? 'px-2.5 py-1.5 sm:pl-9'
                      : 'gap-3 px-4 py-2.5 sm:pl-14',
                )}
              >
                <ProviderBadge
                  providerId={providerIdFromEnum(pub.provider)}
                  size={presentation ? 'sm' : compact ? 'xs' : 'sm'}
                />

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'truncate font-medium',
                      presentation ? 'text-base' : compact ? 'text-xs' : 'text-sm',
                    )}
                  >
                    {pub.label}
                  </p>
                  <p
                    className={cn(
                      'truncate text-muted-foreground',
                      presentation ? 'text-sm' : 'text-[11px]',
                    )}
                  >
                    {pub.stageName}
                    {!presentation && pub.date
                      ? ` · ${formatSubscriberDate(pub.date.toISOString())}`
                      : ''}
                  </p>
                  {presentation && pub.comment ? (
                    <p
                      className="mt-1 line-clamp-2 text-sm italic text-muted-foreground"
                      title={pub.comment}
                    >
                      {pub.comment}
                    </p>
                  ) : null}
                </div>

                {presentation ? (
                  <Badge
                    className={
                      pub.status === PublicationStatus.PUBLISHED
                        ? 'shrink-0 border-success/30 bg-success/12 text-success hover:bg-success/12'
                        : 'shrink-0 border-warning/40 bg-warning/15 text-warning-foreground hover:bg-warning/15'
                    }
                  >
                    {STATUS_LABELS[pub.status]}
                  </Badge>
                ) : (
                  <Badge
                    variant={
                      pub.status === PublicationStatus.PUBLISHED
                        ? 'default'
                        : 'outline'
                    }
                    className="hidden shrink-0 sm:inline-flex"
                  >
                    {STATUS_LABELS[pub.status]}
                  </Badge>
                )}

                {presentation ? (
                  <span className="shrink-0 text-sm text-muted-foreground">
                    <span className="block text-[10px] uppercase tracking-wide">
                      Дата
                    </span>
                    <span className="whitespace-nowrap font-medium tabular-nums text-foreground">
                      {pub.date
                        ? formatSubscriberDate(pub.date.toISOString())
                        : '—'}
                    </span>
                  </span>
                ) : null}

                {presentation && subscribersAtPublish !== null ? (
                  <span className="shrink-0 text-sm text-muted-foreground">
                    <span className="block text-[10px] uppercase tracking-wide">
                      Подписчики до
                    </span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {formatNumber(subscribersAtPublish)}
                    </span>
                  </span>
                ) : null}

                <PublicationMetrics
                  status={pub.status}
                  metrics={pub.metrics}
                  compact={compact}
                  presentation={presentation}
                />

                {!presentation && pub.postUrl ? (
                  <a
                    href={pub.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                    aria-label="Открыть публикацию"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                ) : !presentation ? (
                  <ChevronRight className="size-4 shrink-0 text-transparent" />
                ) : null}
              </li>
              )
            })}
          </ul>
        )
      ) : null}
    </li>
  )
}

export function TopicsList({
  topics,
  filters,
  compact = false,
  presentation = false,
  subscriberSources = [],
}: {
  topics: TopicDto[]
  filters: TopicsFilterOptions
  compact?: boolean
  presentation?: boolean
  subscriberSources?: LiveSubscriberSource[]
}) {
  return (
    <ul className={cn('flex flex-col', presentation ? 'gap-2' : compact ? 'gap-1.5' : 'gap-3')}>
      {topics.map((topic) => (
        <TopicListGroup
          key={topic.id}
          topic={topic}
          filters={filters}
          compact={compact}
          presentation={presentation}
          subscriberSources={subscriberSources}
        />
      ))}
    </ul>
  )
}
