import { getOAuthApiRouteId, providerOf } from '@/lib/provider-connections'

export const OAUTH_POPUP_MESSAGE = 'spt:oauth' as const

export type OAuthPopupResult = {
  type: typeof OAUTH_POPUP_MESSAGE
  success: boolean
  provider?: string
  error?: string
}

export type StartProviderOAuthOptions = {
  onPreparingChange?: (preparing: boolean) => void
}

const POPUP_FEATURES = 'width=520,height=720,menubar=no,toolbar=no,status=no'
const OAUTH_TIMEOUT_MS = 10 * 60 * 1000

function isOAuthPopupResult(data: unknown): data is OAuthPopupResult {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    data.type === OAUTH_POPUP_MESSAGE &&
    'success' in data &&
    typeof data.success === 'boolean'
  )
}

function setPreparing(
  options: StartProviderOAuthOptions | undefined,
  preparing: boolean,
) {
  options?.onPreparingChange?.(preparing)
}

function writePopupLoading(popup: Window, providerName: string) {
  popup.document.open()
  popup.document.write(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Авторизация</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #09090b;
      color: #fafafa;
    }
    .wrap { text-align: center; padding: 24px; max-width: 280px; }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.15);
      border-top-color: #fafafa;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { font-size: 14px; color: #a1a1aa; line-height: 1.5; }
    strong { color: #fafafa; font-weight: 500; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="spinner" aria-hidden="true"></div>
    <p>Открываем авторизацию <strong>${providerName}</strong>…</p>
  </div>
</body>
</html>`)
  popup.document.close()
}

function waitForOAuthPopup(popup: Window): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!isOAuthPopupResult(event.data)) return

      cleanup()
      try {
        popup.close()
      } catch {
        // Popup may already be closed or cross-origin.
      }

      if (event.data.success) {
        resolve()
      } else {
        reject(new Error(event.data.error ?? 'OAuth failed'))
      }
    }

    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('OAuth timed out'))
    }, OAUTH_TIMEOUT_MS)

    function cleanup() {
      window.removeEventListener('message', onMessage)
      window.clearTimeout(timeout)
    }

    window.addEventListener('message', onMessage)
  })
}

export async function startProviderOAuth(
  providerId: string,
  options?: StartProviderOAuthOptions,
): Promise<void> {
  if (providerId === 'youtube') {
    throw new Error(
      'YouTube не требует авторизации — вставьте ссылку на видео при добавлении публикации',
    )
  }

  const token = localStorage.getItem('accessToken')
  if (!token) {
    throw new Error('Not authenticated')
  }

  const routeId = getOAuthApiRouteId(providerId)
  const providerName = providerOf(providerId).name
  setPreparing(options, true)

  const popup = window.open('about:blank', 'spt-oauth', POPUP_FEATURES)
  if (!popup) {
    setPreparing(options, false)
    throw new Error('Popup blocked')
  }

  writePopupLoading(popup, providerName)

  try {
    const response = await fetch(
      `/api/oauth/authorize/${routeId}?popup=1`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    if (!response.ok) {
      throw new Error('Failed to start OAuth')
    }

    const { url } = (await response.json()) as { url: string }
    popup.location.href = url
  } catch (error) {
    popup.close()
    setPreparing(options, false)
    throw error
  }

  setPreparing(options, false)
  await waitForOAuthPopup(popup)
}
