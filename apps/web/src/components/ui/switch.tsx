import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  size?: 'default' | 'sm'
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-4 w-7' : 'h-6 w-11',
        checked
          ? 'border-primary bg-primary'
          : 'border-muted-foreground/35 bg-muted-foreground/25',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none block rounded-full bg-background shadow-md ring-1 ring-black/10 transition-transform dark:ring-white/10',
          size === 'sm' ? 'size-3' : 'size-5',
          checked
            ? size === 'sm'
              ? 'translate-x-3'
              : 'translate-x-5'
            : 'translate-x-0.5',
        )}
      />
    </button>
  ),
)
Switch.displayName = 'Switch'
