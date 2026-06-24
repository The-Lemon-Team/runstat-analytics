import { Provider, type Publication } from '@prisma/client'

export function publicationMatchesSubscriberSource(
  publication: Pick<Publication, 'provider' | 'channelName'>,
  source: {
    provider: Provider
    externalId: string
    handle: string | null
    title: string | null
  },
): boolean {
  if (publication.provider !== source.provider) return false

  const channel = publication.channelName.toLowerCase().trim()
  if (!channel) return false

  const candidates = [
    source.handle?.toLowerCase(),
    source.title?.toLowerCase(),
    source.externalId.toLowerCase(),
  ].filter(Boolean) as string[]

  return candidates.some(
    (candidate) =>
      channel.includes(candidate) ||
      candidate.includes(channel) ||
      channel.replace(/^@/, '') === candidate.replace(/^@/, ''),
  )
}
