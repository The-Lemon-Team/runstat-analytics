import type { Metrics, Provider, PublicationDto, TopicDto } from '@spt/shared'
import { PublicationStatus } from '@spt/shared'
import { aggregatePublication } from '@/features/content-table/lib/metrics'
import { getPublicationSubscribersAtPublish } from '@/features/dashboard/lib/sidebar-user-stats'
import {
  formatDateRangeLabel,
  isDateInRange,
  type DateRangeValue,
} from '@/features/calendar/lib/calendar-utils'
import type { LiveSubscriberSource } from '@/lib/provider-connections'

export { MONTH_LABELS } from '@/features/calendar/lib/calendar-utils'

export function getPublicationDate(pub: PublicationDto): Date | null {
  const dateStr = pub.publishedAt ?? pub.snapshots[0]?.capturedAt
  return dateStr ? new Date(dateStr) : null
}

export type TopicPublicationRow = {
  id: string
  topicId: string
  topicName: string
  stageName: string
  label: string
  provider: Provider
  status: PublicationStatus
  postUrl: string | null
  comment: string | null
  date: Date | null
  publishedAt: string | null
  channelName: string
  subscriberSourceId: string | null
  subscribersAtPublish: number | null
  metrics: Metrics
}

export function flattenTopicPublications(
  topic: TopicDto,
  subscriberSources?: LiveSubscriberSource[],
): TopicPublicationRow[] {
  const rows: TopicPublicationRow[] = []

  for (const stage of topic.stages) {
    for (const pub of stage.publications) {
      rows.push({
        id: pub.id,
        topicId: topic.id,
        topicName: topic.name,
        stageName: stage.name,
        label: pub.label ?? pub.channelName,
        provider: pub.provider,
        status: pub.status,
        postUrl: pub.postUrl,
        comment: pub.comment,
        date: getPublicationDate(pub),
        publishedAt: pub.publishedAt,
        channelName: pub.channelName,
        subscriberSourceId: pub.subscriberSourceId,
        subscribersAtPublish: subscriberSources
          ? getPublicationSubscribersAtPublish(pub, subscriberSources)
          : null,
        metrics: aggregatePublication(pub),
      })
    }
  }

  return rows
}

export type TopicsFilterOptions = {
  query: string
  dateRange: DateRangeValue
}

export function formatTopicsFilterPeriod(
  dateRange: DateRangeValue,
): string {
  if (!dateRange.enabled) return ''
  return formatDateRangeLabel(dateRange)
}

function matchesDateRange(
  date: Date | null,
  dateRange: DateRangeValue,
): boolean {
  if (!dateRange.enabled || !dateRange.from || !dateRange.to) return false
  if (!date) return false
  return isDateInRange(date, dateRange.from, dateRange.to)
}

export function filterTopics(
  topics: TopicDto[],
  { query, dateRange }: TopicsFilterOptions,
): TopicDto[] {
  const q = query.trim().toLowerCase()

  return topics.filter((topic) => {
    if (q) {
      const matchesTopic = topic.name.toLowerCase().includes(q)
      const matchesPublication = topic.stages.some((stage) =>
        stage.publications.some((pub) =>
          (pub.label ?? pub.channelName).toLowerCase().includes(q),
        ),
      )
      if (!matchesTopic && !matchesPublication) return false
    }

    if (!dateRange.enabled) return true

    if (matchesDateRange(new Date(topic.createdAt), dateRange)) {
      return true
    }

    return topic.stages.some((stage) =>
      stage.publications.some((pub) =>
        matchesDateRange(getPublicationDate(pub), dateRange),
      ),
    )
  })
}

export function filterTopicPublications(
  topic: TopicDto,
  { dateRange }: Pick<TopicsFilterOptions, 'dateRange'>,
  subscriberSources?: LiveSubscriberSource[],
): TopicPublicationRow[] {
  const rows = flattenTopicPublications(topic, subscriberSources)

  if (!dateRange.enabled) return rows

  return rows.filter((row) => matchesDateRange(row.date, dateRange))
}

export function flattenFilteredTopicsPublications(
  topics: TopicDto[],
  filters: Pick<TopicsFilterOptions, 'dateRange'>,
  subscriberSources?: LiveSubscriberSource[],
): TopicPublicationRow[] {
  return topics.flatMap((topic) =>
    filterTopicPublications(topic, filters, subscriberSources),
  )
}
