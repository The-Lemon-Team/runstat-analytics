export interface ParsedInstagramAccount {
  externalId: string
  handle: string
  profileUrl: string
  pollInput: string
}

export function parseInstagramInput(
  input: string,
): ParsedInstagramAccount | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([a-zA-Z0-9._]+)/i,
  )
  if (urlMatch) {
    const slug = urlMatch[1]!.toLowerCase()
    const profileUrl = `https://instagram.com/${slug}`
    return {
      externalId: slug,
      handle: `@${slug}`,
      profileUrl,
      pollInput: profileUrl,
    }
  }

  const atMatch = trimmed.match(/^@([a-zA-Z0-9._]+)$/i)
  if (atMatch) {
    const slug = atMatch[1]!.toLowerCase()
    const profileUrl = `https://instagram.com/${slug}`
    return {
      externalId: slug,
      handle: `@${slug}`,
      profileUrl,
      pollInput: profileUrl,
    }
  }

  if (/^[a-zA-Z0-9._]+$/.test(trimmed)) {
    const slug = trimmed.toLowerCase()
    const profileUrl = `https://instagram.com/${slug}`
    return {
      externalId: slug,
      handle: `@${slug}`,
      profileUrl,
      pollInput: profileUrl,
    }
  }

  return null
}
