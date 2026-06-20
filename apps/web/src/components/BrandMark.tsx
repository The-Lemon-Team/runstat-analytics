import { cn } from '@/lib/utils'

const BRAND_NAME = 'Runstat Analytics'
const BRAND_TAGLINE = 'Аналитика публикаций и аудитории'
const BRAND_EMOJI = '🏃‍♂️‍➡️'

type BrandMarkProps = {
  className?: string
  nameClassName?: string
  taglineClassName?: string
  logoClassName?: string
}

export function BrandMark({
  className,
  nameClassName,
  taglineClassName,
  logoClassName,
}: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        role="img"
        aria-label={BRAND_NAME}
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-[1.35rem] leading-none select-none',
          logoClassName,
        )}
      >
        {BRAND_EMOJI}
      </span>
      <div className="leading-tight">
        <p className={cn('text-sm font-semibold', nameClassName)}>{BRAND_NAME}</p>
        <p className={cn('text-xs text-sidebar-foreground/60', taglineClassName)}>
          {BRAND_TAGLINE}
        </p>
      </div>
    </div>
  )
}

export function BrandTextLogo({
  className,
}: {
  className?: string
}) {
  return (
    <img
      src="/logos/text_logo.png"
      alt={BRAND_NAME}
      className={cn('h-4 w-auto object-contain opacity-60', className)}
    />
  )
}
