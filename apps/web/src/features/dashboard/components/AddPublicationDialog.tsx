import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { useLazyGetYouTubeMetricsQuery } from '@/app/api/baseApi'
import { PROVIDER_UI } from '@/lib/providers'
import type { PublicationViewStatus } from '@/lib/dashboard-utils'
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

export interface NewPublicationInput {
  providerId: string
  label: string
  stageId: string
  url: string
  status: PublicationViewStatus
  metrics?: { views: number; likes: number; comments: number }
}

export interface StageOption {
  topicId: string
  topicName: string
  stageId: string
  stageName: string
}

export function AddPublicationDialog({
  open,
  onOpenChange,
  stageOptions,
  defaultStageKey,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stageOptions: StageOption[]
  defaultStageKey?: string
  onSubmit: (topicId: string, input: NewPublicationInput) => void
}) {
  const [providerId, setProviderId] = useState('tg')
  const [label, setLabel] = useState('')
  const [stageKey, setStageKey] = useState(defaultStageKey ?? '')
  const [url, setUrl] = useState('')
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetchYouTubeMetrics, { isFetching }] = useLazyGetYouTubeMetricsQuery()

  useEffect(() => {
    if (open) {
      const firstKey = stageOptions[0]
        ? `${stageOptions[0].topicId}::${stageOptions[0].stageId}`
        : ''
      setProviderId('tg')
      setLabel('')
      setStageKey(defaultStageKey ?? firstKey)
      setUrl('')
      setFetchError(null)
    }
  }, [open, defaultStageKey, stageOptions])

  const selectedStage = stageOptions.find(
    (s) => `${s.topicId}::${s.stageId}` === stageKey,
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedStage) return

    const trimmedUrl = url.trim()
    const provider = PROVIDER_UI.find((p) => p.id === providerId)
    let metrics: NewPublicationInput['metrics']
    let resolvedLabel = label.trim() || provider?.name || providerId

    setFetchError(null)

    if (providerId === 'youtube' && trimmedUrl) {
      try {
        const data = await fetchYouTubeMetrics(trimmedUrl).unwrap()
        metrics = {
          views: data.views,
          likes: data.likes,
          comments: data.comments,
        }
        if (!label.trim() && data.title) {
          resolvedLabel = data.title
        }
      } catch {
        setFetchError(
          'Не удалось загрузить статистику YouTube. Проверьте ссылку и YOUTUBE_API_KEY на сервере.',
        )
        return
      }
    }

    onSubmit(selectedStage.topicId, {
      providerId,
      label: resolvedLabel,
      stageId: selectedStage.stageId,
      url: trimmedUrl,
      status: trimmedUrl ? 'published' : 'scheduled',
      metrics,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="relative">
        <DialogHeader>
          <DialogTitle>Add Publication</DialogTitle>
          <DialogDescription>
            Привяжите новый пост к этапу контента. Выберите площадку, укажите
            метку и вставьте ссылку.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <select
              id="provider"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              {PROVIDER_UI.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
            <div className="pt-1">
              <ProviderBadge providerId={providerId} size="sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pub-label">Custom label</Label>
            <Input
              id="pub-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="например, VK Юрий"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <select
              id="stage"
              value={stageKey}
              onChange={(e) => setStageKey(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              {stageOptions.map((option) => (
                <option
                  key={`${option.topicId}::${option.stageId}`}
                  value={`${option.topicId}::${option.stageId}`}
                >
                  {option.topicName} — {option.stageName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pub-url">Post URL</Label>
            <Input
              id="pub-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
            />
            <p className="text-xs text-muted-foreground">
              {providerId === 'youtube'
                ? 'Для YouTube достаточно ссылки — статистика подтянется автоматически.'
                : 'Оставьте пустым, чтобы создать запланированный слот.'}
            </p>
          </div>

          {fetchError ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {fetchError}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isFetching}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={!selectedStage || isFetching}>
              {isFetching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {isFetching ? 'Загружаем…' : 'Add Publication'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
