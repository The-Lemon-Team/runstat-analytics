export interface ParsedTelegramChannel {
  externalId: string
  handle: string
  profileUrl: string
  pollInput: string
}

export function parseTelegramChannelInput(
  input: string,
): ParsedTelegramChannel | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:t\.me|telegram\.me)\/(?:\+|joinchat\/)?([+\w-]+)/i,
  )
  if (urlMatch) {
    const slug = urlMatch[1]!
    const profileUrl = `https://t.me/${slug}`
    return {
      externalId: slug.toLowerCase(),
      handle: `@${slug.replace(/^\+/, '')}`,
      profileUrl,
      pollInput: profileUrl,
    }
  }

  const atMatch = trimmed.match(/^@([\w+][\w-]*)$/i)
  if (atMatch) {
    const slug = atMatch[1]!
    const profileUrl = `https://t.me/${slug}`
    return {
      externalId: slug.toLowerCase(),
      handle: `@${slug}`,
      profileUrl,
      pollInput: profileUrl,
    }
  }

  if (/^[\w-]+$/.test(trimmed)) {
    const slug = trimmed.toLowerCase()
    const profileUrl = `https://t.me/${slug}`
    return {
      externalId: slug,
      handle: `@${slug}`,
      profileUrl,
      pollInput: profileUrl,
    }
  }

  return null
}
