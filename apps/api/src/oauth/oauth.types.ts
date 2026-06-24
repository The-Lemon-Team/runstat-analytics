import { OAuthProvider } from '@prisma/client'

export interface OAuthProfile {
  provider: OAuthProvider
  externalAccountId: string
  channelName: string | null
  accessToken: string
  refreshToken: string | null
  expiresAt: Date | null
  scopes: string[]
  metadata: Record<string, unknown>
  subscriberCount?: number | null
}

export type OAuthStateMode = 'login' | 'connect'

export interface OAuthStatePayload {
  mode: OAuthStateMode
  userId?: string
  returnUrl: string
  popup?: boolean
}
