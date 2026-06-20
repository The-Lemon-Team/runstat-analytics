import { useEffect, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { useCreateSubscriberSourceMutation } from '@/app/api/baseApi'
import {
  getSubscribableSourceType,
  parseYouTubeChannelInput,
  providerOf,
} from '@/lib/provider-connections'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/card'
import { ProviderBadge } from './ProviderBadge'

export function AddSubscriberSourceDialog({
  open,
  providerId,
  onOpenChange,
  onAdded,
}: {
  open: boolean
  providerId: string
  onOpenChange: (open: boolean) => void
  onAdded: () => void
}) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createSource, { isLoading }] = useCreateSubscriberSourceMutation()

  const sourceType = getSubscribableSourceType(providerId)
  const provider = providerOf(providerId)

  useEffect(() => {
    if (open) {
      setUrl('')
      setError(null)
    }
  }, [open, providerId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = parseYouTubeChannelInput(url)
    if (!parsed) {
      setError('Укажите ссылку на канал или @handle')
      return
    }

    try {
      await createSource({ input: url.trim() }).unwrap()
      onAdded()
      onOpenChange(false)
    } catch {
      setError('Канал не найден или YouTube API недоступен. Проверьте ссылку.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="relative">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ProviderBadge providerId={providerId} size="sm" />
            <DialogTitle>
              Добавить {sourceType?.addLabel ?? provider.name}
            </DialogTitle>
          </div>
          <DialogDescription>
            Вставьте ссылку на канал или @handle — подписчики появятся в блоке в
            реальном времени, а изменения будут сохраняться в истории.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-url">Канал YouTube</Label>
            <Input
              id="channel-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/@studio-s10"
              autoFocus
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Поддерживаются ссылки вида youtube.com/@handle, /channel/… и /c/…
            </p>
          </div>

          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={!url.trim() || isLoading}>
              <Plus className="size-4" />
              {isLoading ? 'Проверяем…' : 'Добавить канал'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
