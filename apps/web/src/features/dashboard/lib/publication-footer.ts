import type { MetricHistoryEntryDto } from '@spt/shared'
import { resolvePublicationSubscriberInsight } from '@/features/dashboard/lib/sidebar-user-stats'
import type { PublicationView } from '@/lib/dashboard-utils'
import type { LiveSubscriberSource } from '@/lib/provider-connections'

export function showsPublicationSubscriberFooter(
  publication: PublicationView,
  subscriberSources: LiveSubscriberSource[],
): boolean {
  if (!publication.subscriberSourceId) return false
  return (
    resolvePublicationSubscriberInsight(publication, subscriberSources) !== null
  )
}

export function entryHasMetricChanges(entry: MetricHistoryEntryDto): boolean {
  return (
    entry.viewsDelta !== 0 ||
    entry.likesDelta !== 0 ||
    entry.commentsDelta !== 0
  )
}

export function pickLatestMetricHistoryEntry(
  local: MetricHistoryEntryDto | undefined,
  fetched: MetricHistoryEntryDto | undefined,
): MetricHistoryEntryDto | null {
  const entry = local ?? fetched
  if (!entry || !entryHasMetricChanges(entry)) return null
  return entry
}
