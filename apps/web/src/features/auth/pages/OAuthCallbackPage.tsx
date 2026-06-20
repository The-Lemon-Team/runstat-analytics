import { useEffect, useState } from 'react'
import { OAUTH_POPUP_MESSAGE, type OAuthPopupResult } from '@/lib/startOAuth'

export function OAuthCallbackPage() {
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const message: OAuthPopupResult = {
      type: OAUTH_POPUP_MESSAGE,
      success: params.get('oauth') === 'success',
      provider: params.get('provider') ?? undefined,
      error: params.get('message') ?? undefined,
    }

    if (window.opener) {
      window.opener.postMessage(message, window.location.origin)
      window.close()
      return
    }

    setStandalone(true)
  }, [])

  if (!standalone) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Закрываем окно…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm text-muted-foreground">
        Авторизация завершена. Это окно можно закрыть.
      </p>
    </div>
  )
}
