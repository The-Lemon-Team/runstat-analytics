import { useState } from 'react'
import { ArrowDown, ArrowUp, Heart, MessageCircle, Users } from 'lucide-react'
import { formatNumber } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'
import {
  formatPublicationDate,
  formatSubscriberDelta,
  type WeeklyPublicationInsight,
} from '@/features/dashboard/lib/sidebar-user-stats'
import { PublicationMetricsModal } from './PublicationMetricsModal'
import { ProviderBadge } from './ProviderBadge'

function MetricValue({
  icon: Icon,
  value,
  iconClassName,
  title,
}: {
  icon: typeof Heart
  value: number
  iconClassName: string
  title: string
}) {
  return (
    <span
      className="inline-flex items-center gap-0.5 font-mono text-[10px] text-foreground/80"
      title={title}
    >
      <Icon className={cn('size-2.5', iconClassName)} />
      {formatNumber(value)}
    </span>
  )
}

function DeltaStatBadge({
  icon: Icon,
  delta,
  label,
  onClick,
}: {
  icon: typeof Heart
  delta: number
  label: string
  onClick: () => void
}) {
  const positive = delta > 0
  const negative = delta < 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold leading-none tabular-nums transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        positive &&
          'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:shadow-sm hover:ring-1 hover:ring-emerald-500/25 dark:text-emerald-400',
        negative &&
          'bg-destructive/10 text-destructive hover:bg-destructive/20 hover:shadow-sm hover:ring-1 hover:ring-destructive/25',
        !positive &&
          !negative &&
          'bg-muted text-muted-foreground hover:bg-muted/80 hover:ring-1 hover:ring-border',
      )}
      title={`${label}: ${delta > 0 ? '+' : ''}${formatNumber(delta)}. Нажмите для деталей`}
    >
      <Icon className="size-2.5 shrink-0" />
      {positive ? <ArrowUp className="size-2.5 shrink-0" /> : null}
      {negative ? <ArrowDown className="size-2.5 shrink-0" /> : null}
      {delta > 0 ? '+' : ''}
      {formatNumber(delta)}
    </button>
  )
}

type WeeklyPublicationCardProps = {
  publication: WeeklyPublicationInsight
  onOpenMetrics: (publication: WeeklyPublicationInsight) => void
}

function WeeklyPublicationCard({
  publication,
  onOpenMetrics,
}: WeeklyPublicationCardProps) {
  const engagementDeltas = [
    publication.likesDelta !== null && publication.likesDelta !== 0
      ? {
          key: 'likes' as const,
          icon: Heart,
          delta: publication.likesDelta,
          label: 'Лайки',
          iconClassName: 'text-rose-500/80',
        }
      : null,
    publication.commentsDelta !== null && publication.commentsDelta !== 0
      ? {
          key: 'comments' as const,
          icon: MessageCircle,
          delta: publication.commentsDelta,
          label: 'Комментарии',
          iconClassName: 'text-sky-500/80',
        }
      : null,
  ].filter(Boolean)

  const hasEngagementStats = engagementDeltas.length > 0

  return (
    <li className="rounded-md border border-border/80 bg-background/60 p-2 transition-colors hover:border-primary/25 hover:bg-muted/30">
      <div className="flex items-start gap-2">
        <ProviderBadge
          providerId={publication.providerId}
          size="xs"
          className="mt-px shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium leading-tight">
            {publication.label}
          </p>
          <p className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground">
            {publication.topicName} ·{' '}
            {formatPublicationDate(publication.publishedAt)}
          </p>
        </div>

        {hasEngagementStats ? (
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            {engagementDeltas.map((item) =>
              item ? (
                <DeltaStatBadge
                  key={item.key}
                  icon={item.icon}
                  delta={item.delta}
                  label={item.label}
                  onClick={() => onOpenMetrics(publication)}
                />
              ) : null,
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex items-end justify-between gap-2 border-t border-border/60 pt-2">
        {publication.subscribersAtPublish !== null ? (
          <div className="min-w-0">
            <p className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">
              Подписчики
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 font-mono text-[11px] font-medium leading-none">
                <Users className="size-2.5 text-muted-foreground" />
                {formatNumber(publication.subscribersAtPublish)}
              </span>
              {publication.subscribersDelta !== null ? (
                <button
                  type="button"
                  onClick={() => onOpenMetrics(publication)}
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none tabular-nums transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    publication.subscribersDelta > 0 &&
                      'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:shadow-sm hover:ring-1 hover:ring-emerald-500/25 dark:text-emerald-400',
                    publication.subscribersDelta < 0 &&
                      'bg-destructive/10 text-destructive hover:bg-destructive/20 hover:shadow-sm hover:ring-1 hover:ring-destructive/25',
                    publication.subscribersDelta === 0 &&
                      'bg-muted text-muted-foreground hover:bg-muted/80 hover:ring-1 hover:ring-border',
                  )}
                  title="Дельта подписчиков с момента публикации. Нажмите для деталей"
                >
                  {publication.subscribersDelta > 0 ? (
                    <ArrowUp className="size-2" />
                  ) : publication.subscribersDelta < 0 ? (
                    <ArrowDown className="size-2" />
                  ) : null}
                  {formatSubscriberDelta(publication.subscribersDelta)}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <span className="text-[10px] leading-tight text-muted-foreground">
            Площадка не подключена
          </span>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <MetricValue
            icon={Heart}
            value={publication.likes}
            iconClassName="text-rose-500/80"
            title="Лайки"
          />
          <MetricValue
            icon={MessageCircle}
            value={publication.comments}
            iconClassName="text-sky-500/80"
            title="Комментарии"
          />
        </div>
      </div>
    </li>
  )
}

type WeeklyPublicationsPanelProps = {
  publications: WeeklyPublicationInsight[]
}

export function WeeklyPublicationsPanel({
  publications,
}: WeeklyPublicationsPanelProps) {
  const [selectedPublication, setSelectedPublication] =
    useState<WeeklyPublicationInsight | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function openMetrics(publication: WeeklyPublicationInsight) {
    setSelectedPublication(publication)
    setModalOpen(true)
  }

  return (
    <>
      <section className="rounded-xl border border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Публикации за неделю
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Подписчики на момент выхода и рост после публикации
            </p>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 font-mono text-sm font-semibold text-primary">
            {publications.length}
          </span>
        </div>

        {publications.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            Нет публикаций за последние 7 дней
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {publications.map((publication) => (
              <WeeklyPublicationCard
                key={publication.id}
                publication={publication}
                onOpenMetrics={openMetrics}
              />
            ))}
          </ul>
        )}
      </section>

      <PublicationMetricsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        publication={selectedPublication}
      />
    </>
  )
}
