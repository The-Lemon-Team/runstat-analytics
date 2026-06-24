import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuthConnectionStatus, OAuthProvider, Prisma } from '@prisma/client'
import type { OAuthConnectionDto } from '@spt/shared'
import { TokenCryptoService } from '../common/crypto/token-crypto.service'
import { PrismaService } from '../prisma/prisma.service'
import type { OAuthProfile, OAuthStatePayload } from './oauth.types'

@Injectable()
export class OAuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TokenCryptoService) private readonly crypto: TokenCryptoService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  buildAuthorizeUrl(
    provider: OAuthProvider,
    userId: string,
    popup = false,
  ): string {
    const returnUrl = this.config.getOrThrow<string>('WEB_URL')
    const state = Buffer.from(
      JSON.stringify({ mode: 'connect', userId, returnUrl, popup }),
    ).toString('base64url')

    const routes: Partial<Record<OAuthProvider, string>> = {
      [OAuthProvider.FACEBOOK]: '/api/oauth/facebook',
      [OAuthProvider.VK]: '/api/oauth/vk',
    }

    const route = routes[provider]
    if (!route) {
      throw new Error(`OAuth is not configured for provider: ${provider}`)
    }

    const apiUrl = this.config.getOrThrow<string>('API_URL')
    return `${apiUrl}${route}?state=${state}`
  }

  buildVkLoginUrl(returnUrl?: string): string {
    const webUrl = this.config.getOrThrow<string>('WEB_URL')
    const state = Buffer.from(
      JSON.stringify({
        mode: 'login',
        returnUrl: returnUrl ?? webUrl,
      }),
    ).toString('base64url')
    const apiUrl = this.config.getOrThrow<string>('API_URL')
    return `${apiUrl}/oauth/vk?state=${state}`
  }

  async upsertConnection(
    userId: string,
    profile: OAuthProfile,
  ): Promise<OAuthConnectionDto> {
    const data = {
      channelName: profile.channelName,
      accessTokenEnc: this.crypto.encrypt(profile.accessToken),
      refreshTokenEnc: profile.refreshToken
        ? this.crypto.encrypt(profile.refreshToken)
        : null,
      scopes: profile.scopes,
      status: OAuthConnectionStatus.ACTIVE,
      expiresAt: profile.expiresAt,
      subscriberCount: profile.subscriberCount ?? undefined,
      metadata: profile.metadata as Prisma.InputJsonValue,
    }

    const connection = await this.prisma.withFreshConnection((db) =>
      db.oAuthConnection.upsert({
        where: {
          userId_provider_externalAccountId: {
            userId,
            provider: profile.provider,
            externalAccountId: profile.externalAccountId,
          },
        },
        create: {
          userId,
          provider: profile.provider,
          externalAccountId: profile.externalAccountId,
          ...data,
        },
        update: data,
      }),
    )

    return this.toDto(connection)
  }

  async listConnections(userId: string): Promise<OAuthConnectionDto[]> {
    const rows = await this.prisma.withFreshConnection((db) =>
      db.oAuthConnection.findMany({
        where: { userId },
        orderBy: { provider: 'asc' },
      }),
    )
    return rows.map((row) => this.toDto(row))
  }

  async revokeConnection(userId: string, connectionId: string): Promise<void> {
    await this.prisma.withFreshConnection((db) =>
      db.oAuthConnection.updateMany({
        where: { id: connectionId, userId },
        data: { status: OAuthConnectionStatus.REVOKED },
      }),
    )
  }

  getDecryptedAccessToken(connection: {
    accessTokenEnc: string
  }): string {
    return this.crypto.decrypt(connection.accessTokenEnc)
  }

  getDecryptedRefreshToken(connection: {
    refreshTokenEnc: string | null
  }): string | null {
    if (!connection.refreshTokenEnc) return null
    return this.crypto.decrypt(connection.refreshTokenEnc)
  }

  async requireFacebookAccessToken(userId: string): Promise<string> {
    const connection = await this.prisma.oAuthConnection.findFirst({
      where: {
        userId,
        provider: OAuthProvider.FACEBOOK,
        status: OAuthConnectionStatus.ACTIVE,
      },
      orderBy: { updatedAt: 'desc' },
    })

    if (!connection) {
      throw new UnauthorizedException(
        'Instagram is not connected. Authorize via Meta in Settings.',
      )
    }

    return this.getDecryptedAccessToken(connection)
  }

  async requireVkAccessToken(userId: string): Promise<string> {
    const connection = await this.prisma.oAuthConnection.findFirst({
      where: {
        userId,
        provider: OAuthProvider.VK,
        status: OAuthConnectionStatus.ACTIVE,
      },
      orderBy: { updatedAt: 'desc' },
    })

    if (!connection) {
      throw new UnauthorizedException(
        'VK is not connected. Sign in with VK or connect in Settings.',
      )
    }

    return this.getDecryptedAccessToken(connection)
  }

  parseState(state: string): OAuthStatePayload {
    const decoded = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf8'),
    ) as Partial<OAuthStatePayload> & { userId?: string; returnUrl?: string }
    return {
      mode: decoded.mode ?? (decoded.userId ? 'connect' : 'login'),
      userId: decoded.userId,
      returnUrl: decoded.returnUrl ?? this.config.getOrThrow<string>('WEB_URL'),
      popup: decoded.popup,
    }
  }

  buildCallbackRedirect(
    returnUrl: string,
    params: { success: boolean; provider?: OAuthProvider; error?: string },
    popup = false,
    mode: 'login' | 'connect' = 'connect',
  ): string {
    const path =
      mode === 'login'
        ? '/auth/vk/callback'
        : popup
          ? '/oauth/callback'
          : '/settings/integrations'
    const url = new URL(`${returnUrl}${path}`)
    url.searchParams.set('oauth', params.success ? 'success' : 'error')
    if (params.provider) url.searchParams.set('provider', params.provider)
    if (params.error) url.searchParams.set('message', params.error)
    return url.toString()
  }

  buildLoginCallbackRedirect(
    returnUrl: string,
    tokens: { accessToken: string; refreshToken: string; user: { id: string; email: string; name: string | null } },
  ): string {
    const url = new URL(`${returnUrl}/auth/vk/callback`)
    const hash = new URLSearchParams({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: JSON.stringify(tokens.user),
    }).toString()
    return `${url.toString()}#${hash}`
  }

  mapRouteProvider(route: string): OAuthProvider | null {
    const normalized = route.toLowerCase()
    const map: Record<string, OAuthProvider> = {
      facebook: OAuthProvider.FACEBOOK,
      instagram: OAuthProvider.FACEBOOK,
      vk: OAuthProvider.VK,
    }
    return map[normalized] ?? null
  }

  private toDto(connection: {
    id: string
    provider: OAuthProvider
    channelName: string | null
    externalAccountId: string
    status: OAuthConnectionStatus
    subscriberCount: number | null
    expiresAt: Date | null
  }): OAuthConnectionDto {
    return {
      id: connection.id,
      provider: connection.provider,
      channelName: connection.channelName,
      externalAccountId: connection.externalAccountId,
      status: connection.status,
      subscriberCount: connection.subscriberCount,
      expiresAt: connection.expiresAt?.toISOString() ?? null,
    }
  }
}
