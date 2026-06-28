import {
  MetricSnapshotKind,
  PublicationStatus,
  type PublicationDto,
  type TopicDto,
} from '@spt/shared'
import { aggregateAll } from '@/lib/dashboard-utils'
import {
  countPublications,
  getSnapshot,
  snapshotToMetrics,
} from '@/features/content-table/lib/metrics'
import type { LiveSubscriberSource } from '@/lib/provider-connections'
import { providerIdFromEnum } from '@/lib/providers'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const MAX_WEEKLY_PUBLICATIONS = 5

const SUBSCRIBABLE_PROVIDER_IDS = new Set(['vk', 'youtube', 'instagram', 'tg'])

export type SidebarUserStats = {
  topicsCount: number
  publicationsPublished: number
  publicationsTotal: number
  totalViews: number
  connectedPlatforms: number
  totalSubscribers: number
}

export type WeeklyPublicationInsight = {
  id: string
  providerId: string
  label: string
  topicName: string
  publishedAt: string
  likes: number
  comments: number
  views: number
  likesAtPublish: number | null
  commentsAtPublish: number | null
  viewsAtPublish: number | null
  likesDelta: number | null
  commentsDelta: number | null
  viewsDelta: number | null
  subscribersAtPublish: number | null
  subscribersDelta: number | null
}

export function computeSidebarUserStats(
  topics: TopicDto[],
  subscriberSources: LiveSubscriberSource[],
): SidebarUserStats {
  const publicationCounts = topics.reduce(
    (acc, topic) => {
      const counts = countPublications(topic)
      return {
        published: acc.published + counts.published,
        total: acc.total + counts.total,
      }
    },
    { published: 0, total: 0 },
  )

  const metrics = aggregateAll(topics)

  return {
    topicsCount: topics.length,
    publicationsPublished: publicationCounts.published,
    publicationsTotal: publicationCounts.total,
    totalViews: metrics.views,
    connectedPlatforms: subscriberSources.length,
    totalSubscribers: subscriberSources.reduce(
      (sum, source) => sum + source.baseSubscribers,
      0,
    ),
  }
}

function findSubscriberSource(
  publication: Pick<
    PublicationDto,
    'subscriberSourceId' | 'provider' | 'channelName'
  >,
  sources: LiveSubscriberSource[],
): LiveSubscriberSource | null {
  if (publication.subscriberSourceId) {
    const linked = sources.find(
      (source) => source.sourceId === publication.subscriberSourceId,
    )
    if (linked) return linked
  }

  const providerId = providerIdFromEnum(publication.provider)
  if (!SUBSCRIBABLE_PROVIDER_IDS.has(providerId)) return null

  const matches = sources.filter((source) => source.providerId === providerId)
  if (matches.length === 0) return null
  if (matches.length === 1) return matches[0]!

  const channel = publication.channelName.toLowerCase()
  const byChannel = matches.find((source) =>
    source.handle.toLowerCase().includes(channel),
  )
  return byChannel ?? matches[0]!
}

export function getPublicationSubscribersAtPublish(
  publication: Pick<
    PublicationDto,
    'subscriberSourceId' | 'publishedAt' | 'provider' | 'channelName'
  >,
  sources: LiveSubscriberSource[],
): number | null {
  if (!publication.publishedAt) return null

  const source = findSubscriberSource(publication, sources)
  if (!source) return null

  return estimateSubscribersAtPublish(source, publication.publishedAt)?.atPublish ?? null
}

export function findLinkedSubscriberSource(
  subscriberSourceId: string | null,
  sources: LiveSubscriberSource[],
): LiveSubscriberSource | null {
  if (!subscriberSourceId) return null
  return sources.find((source) => source.sourceId === subscriberSourceId) ?? null
}

export function estimateSubscribersAtPublish(
  source: LiveSubscriberSource,
  publishedAt: string,
): { atPublish: number; delta: number } | null {
  const current = source.baseSubscribers
  const pubTime = new Date(publishedAt).getTime()
  if (Number.isNaN(pubTime)) return null

  if (source.lastChange) {
    const changeTime = new Date(source.lastChange.capturedAt).getTime()
    const atPublish =
      pubTime <= changeTime
        ? Math.max(0, source.lastChange.count - source.lastChange.delta)
        : source.lastChange.count

    return { atPublish, delta: current - atPublish }
  }

  if (!source.sourceId) {
    const daysSince = Math.max(0, (Date.now() - pubTime) / 86_400_000)
    const growth = Math.round(Math.min(daysSince * 4, 60) + (pubTime % 23))
    const atPublish = Math.max(0, current - growth)
    return { atPublish, delta: current - atPublish }
  }

  const growth = source.sessionDelta ?? 0
  if (growth === 0) return { atPublish: current, delta: 0 }

  const atPublish = Math.max(0, current - growth)
  return { atPublish, delta: growth }
}

export function resolveSubscribersBeforePublish(
  publication: {
    subscriberSourceId: string | null
    publishedAt: string | null
  },
  sources: LiveSubscriberSource[],
): number | null {
  return resolvePublicationSubscriberInsight(publication, sources)?.atPublish ?? null
}

export function resolvePublicationSubscriberInsight(
  publication: {
    subscriberSourceId: string | null
    publishedAt: string | null
  },
  sources: LiveSubscriberSource[],
): {
  atPublish: number
  delta: number
  sourceId: string
  handle: string
} | null {
  const source = findLinkedSubscriberSource(
    publication.subscriberSourceId,
    sources,
  )
  if (!source || !source.sourceId) return null

  const handle = source.handle

  if (publication.publishedAt) {
    const insight = estimateSubscribersAtPublish(source, publication.publishedAt)
    if (!insight) return null
    return {
      atPublish: insight.atPublish,
      delta: insight.delta,
      sourceId: source.sourceId,
      handle,
    }
  }

  const current = source.subscriberCount ?? source.baseSubscribers
  if (current === null || current === undefined) return null

  return {
    atPublish: current,
    delta: 0,
    sourceId: source.sourceId,
    handle,
  }
}

function publicationMetrics(publication: PublicationDto) {
  const live = getSnapshot(publication.snapshots, MetricSnapshotKind.LIVE)
  const atPublish = getSnapshot(
    publication.snapshots,
    MetricSnapshotKind.AT_PUBLISH,
  )
  const current = snapshotToMetrics(live ?? atPublish)
  const baseline = atPublish ? snapshotToMetrics(atPublish) : null

  return {
    ...current,
    likesAtPublish: baseline?.likes ?? null,
    commentsAtPublish: baseline?.comments ?? null,
    viewsAtPublish: baseline?.views ?? null,
    likesDelta:
      baseline && live ? current.likes - baseline.likes : null,
    commentsDelta:
      baseline && live ? current.comments - baseline.comments : null,
    viewsDelta: baseline && live ? current.views - baseline.views : null,
  }
}

export function collectWeeklyPublications(
  topics: TopicDto[],
  subscriberSources: LiveSubscriberSource[],
  now = Date.now(),
): WeeklyPublicationInsight[] {
  const weekAgo = now - WEEK_MS
  const items: WeeklyPublicationInsight[] = []

  for (const topic of topics) {
    for (const stage of topic.stages) {
      for (const publication of stage.publications) {
        if (publication.status !== PublicationStatus.PUBLISHED) continue
        if (!publication.publishedAt) continue

        const publishedAtMs = new Date(publication.publishedAt).getTime()
        if (Number.isNaN(publishedAtMs) || publishedAtMs < weekAgo) continue

        const metrics = publicationMetrics(publication)
        const source = findSubscriberSource(publication, subscriberSources)
        const subscriberInsight = source
          ? estimateSubscribersAtPublish(source, publication.publishedAt)
          : null

        items.push({
          id: publication.id,
          providerId: providerIdFromEnum(publication.provider),
          label: publication.label ?? publication.channelName,
          topicName: topic.name,
          publishedAt: publication.publishedAt,
          likes: metrics.likes,
          comments: metrics.comments,
          views: metrics.views,
          likesAtPublish: metrics.likesAtPublish,
          commentsAtPublish: metrics.commentsAtPublish,
          viewsAtPublish: metrics.viewsAtPublish,
          likesDelta: metrics.likesDelta,
          commentsDelta: metrics.commentsDelta,
          viewsDelta: metrics.viewsDelta,
          subscribersAtPublish: subscriberInsight?.atPublish ?? null,
          subscribersDelta: subscriberInsight?.delta ?? null,
        })
      }
    }
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, MAX_WEEKLY_PUBLICATIONS)
}

export function formatPublicationDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))
}

export function formatSubscriberDelta(delta: number): string {
  if (delta > 0) return `+${formatCompact(delta)}`
  if (delta < 0) return formatCompact(delta)
  return '0'
}

function formatCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return String(value)
}

export function getUserDisplayName(
  user: { email: string; name: string | null },
): string {
  const name = user.name?.trim()
  if (name) return name
  return user.email.split('@')[0] ?? user.email
}

export function getUserInitials(
  user: { email: string; name: string | null },
): string {
  const name = user.name?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  return user.email.slice(0, 2).toUpperCase()
}
