import { getProviderUi } from '@/lib/providers'
import type { LiveSubscriberSource } from '@/lib/provider-connections'
import { Label } from '@/components/ui/label'
import { ProviderBadge } from './ProviderBadge'

export function SubscriberChannelSelect({
  providerId,
  sources,
  value,
  onChange,
  disabled,
}: {
  providerId: string
  sources: LiveSubscriberSource[]
  value: string | null
  onChange: (sourceId: string | null) => void
  disabled?: boolean
}) {
  const provider = getProviderUi(providerId)
  const matchingSources = sources.filter(
    (source) =>
      source.sourceId &&
      getProviderUi(source.providerId).provider === provider.provider,
  )

  return (
    <div className="space-y-2">
      <Label htmlFor="subscriber-channel">Канал подписчиков</Label>
      <select
        id="subscriber-channel"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || matchingSources.length === 0}
        className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
      >
        <option value="">Не привязан</option>
        {matchingSources.map((source) => (
          <option key={source.sourceId} value={source.sourceId}>
            {source.handle}
          </option>
        ))}
      </select>
      {matchingSources.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Подключите канал {provider.name} в блоке подписчиков, чтобы привязать
          публикацию.
        </p>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {value ? (
            <>
              <ProviderBadge providerId={providerId} size="sm" />
              <span>Публикация будет учитываться в истории этого канала.</span>
            </>
          ) : (
            <span>Опционально — для корреляции с историей подписчиков.</span>
          )}
        </div>
      )}
    </div>
  )
}
