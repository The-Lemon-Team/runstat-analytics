import { useEffect, useRef, useState } from 'react'
import { Loader2, Users } from 'lucide-react'
import { formatNumber } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'

export function SubscriberCountControl({
  value,
  onSave,
  onOpenHistory,
  isSaving = false,
  editable = true,
}: {
  value: number | null
  onSave: (value: number) => Promise<void>
  onOpenHistory?: () => void
  isSaving?: boolean
  editable?: boolean
}) {
  const [draft, setDraft] = useState(value === null ? '' : String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value === null ? '' : String(value))
  }, [value])

  function resetDraft() {
    setDraft(value === null ? '' : String(value))
  }

  async function commit() {
    const trimmed = draft.trim()
    if (!trimmed) {
      resetDraft()
      return
    }

    const parsed = Number.parseInt(trimmed, 10)
    if (!Number.isFinite(parsed)) {
      resetDraft()
      return
    }

    const next = Math.max(0, parsed)
    setDraft(String(next))

    if (next !== (value ?? -1)) {
      await onSave(next)
    }
  }

  if (!editable) {
    return (
      <button
        type="button"
        onClick={onOpenHistory}
        className="font-mono text-sm font-semibold tabular-nums tracking-tight"
      >
        {value === null ? '—' : formatNumber(value)}
      </button>
    )
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onOpenHistory}
        disabled={isSaving || !onOpenHistory}
        title={onOpenHistory ? 'История' : undefined}
        className={cn(
          'inline-flex items-center gap-0.5 rounded-md border border-dashed border-border/70',
          'bg-transparent px-1 py-0.5 transition-all',
          onOpenHistory &&
            'hover:border-border hover:bg-gradient-to-br hover:from-muted/55 hover:to-muted/20',
          'disabled:cursor-default disabled:opacity-60',
        )}
      >
        <Users className="size-3 shrink-0 text-primary/70" />
      </button>

      <div className="relative inline-flex items-center">
        <input
          ref={inputRef}
          type="number"
          min={0}
          inputMode="numeric"
          value={draft}
          disabled={isSaving}
          placeholder="—"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void commit()
              inputRef.current?.blur()
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              resetDraft()
              inputRef.current?.blur()
            }
          }}
          onBlur={() => {
            void commit()
          }}
          className={cn(
            'h-5 w-12 border-0 border-b border-border/70 bg-transparent px-0.5 text-center',
            'text-[11px] font-mono font-semibold tabular-nums text-foreground',
            'transition-colors placeholder:text-muted-foreground/50',
            'focus:border-primary focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-60',
            '[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          )}
          aria-label="Количество подписчиков"
        />
        {isSaving ? (
          <Loader2 className="absolute -right-3.5 size-2.5 animate-spin text-muted-foreground" />
        ) : null}
      </div>
    </div>
  )
}
