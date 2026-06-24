import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuthProvider } from '@prisma/client'
import type { OAuthProfile } from './oauth.types'

const VK_API_VERSION = '5.199'
const VK_SCOPES = ['email', 'offline', 'groups', 'wall', 'photos'] as const

interface VkTokenResponse {
  access_token?: string
  expires_in?: number
  user_id?: number
  email?: string
  refresh_token?: string
  error?: string
  error_description?: string
}

interface VkUserItem {
  id: number
  first_name?: string
  last_name?: string
  photo_200?: string
}

@Injectable()
export class VkOAuthService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  buildAuthorizeUrl(state: string): string {
    const url = new URL('https://oauth.vk.com/authorize')
    url.searchParams.set('client_id', this.config.getOrThrow<string>('VK_APP_ID'))
    url.searchParams.set(
      'redirect_uri',
      this.config.getOrThrow<string>('VK_CALLBACK_URL'),
    )
    url.searchParams.set('scope', VK_SCOPES.join(','))
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('state', state)
    url.searchParams.set('v', VK_API_VERSION)
    url.searchParams.set('display', 'page')
    return url.toString()
  }

  async exchangeCodeForProfile(code: string): Promise<OAuthProfile> {
    const token = await this.fetchAccessToken(code)
    const user = await this.fetchUserProfile(token.access_token, token.user_id)

    const firstName = user.first_name ?? ''
    const lastName = user.last_name ?? ''
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || null

    return {
      provider: OAuthProvider.VK,
      externalAccountId: String(token.user_id),
      channelName: displayName,
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? null,
      expiresAt:
        token.expires_in != null
          ? new Date(Date.now() + token.expires_in * 1000)
          : null,
      scopes: [...VK_SCOPES],
      metadata: {
        email: token.email ?? null,
        firstName,
        lastName,
        photo: user.photo_200 ?? null,
      },
    }
  }

  private async fetchAccessToken(code: string): Promise<{
    access_token: string
    expires_in?: number
    user_id: number
    email?: string
    refresh_token?: string
  }> {
    const url = new URL('https://oauth.vk.com/access_token')
    url.searchParams.set('client_id', this.config.getOrThrow<string>('VK_APP_ID'))
    url.searchParams.set(
      'client_secret',
      this.config.getOrThrow<string>('VK_APP_SECRET'),
    )
    url.searchParams.set(
      'redirect_uri',
      this.config.getOrThrow<string>('VK_CALLBACK_URL'),
    )
    url.searchParams.set('code', code)

    const response = await fetch(url)
    const data = (await response.json()) as VkTokenResponse

    if (!data.access_token || data.user_id == null) {
      throw new Error(data.error_description ?? data.error ?? 'vk_token_exchange_failed')
    }

    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      user_id: data.user_id,
      email: data.email,
      refresh_token: data.refresh_token,
    }
  }

  private async fetchUserProfile(
    accessToken: string,
    userId: number,
  ): Promise<VkUserItem> {
    const endpoint = new URL('https://api.vk.com/method/users.get')
    endpoint.searchParams.set('access_token', accessToken)
    endpoint.searchParams.set('v', VK_API_VERSION)
    endpoint.searchParams.set('user_ids', String(userId))
    endpoint.searchParams.set('fields', 'photo_200')

    const response = await fetch(endpoint)
    const data = (await response.json()) as {
      response?: VkUserItem[]
      error?: { error_msg?: string }
    }

    if (data.error) {
      throw new Error(data.error.error_msg ?? 'vk_users_get_failed')
    }

    const user = data.response?.[0]
    if (!user) {
      throw new Error('vk_user_not_found')
    }

    return user
  }
}
