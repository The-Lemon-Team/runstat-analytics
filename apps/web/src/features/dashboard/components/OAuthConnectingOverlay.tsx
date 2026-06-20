import { Loader2 } from 'lucide-react'
import { providerOf } from '@/lib/provider-connections'

export function OAuthConnectingOverlay({ providerId }: { providerId: string }) {
  const provider = providerOf(providerId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={`Подключение ${provider.name}`}
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-8 py-7 shadow-lg">
        <Loader2 className="size-10 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-sm font-medium">Подготовка авторизации</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Открываем окно {provider.name}…
          </p>
        </div>
      </div>
    </div>
  )
}
