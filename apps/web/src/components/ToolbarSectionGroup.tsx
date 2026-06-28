import { Children, Fragment, type ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type ToolbarSectionGroupProps = {
  children: ReactNode
  className?: string
}

export function ToolbarSectionGroup({
  children,
  className,
}: ToolbarSectionGroupProps) {
  const sections = Children.toArray(children).filter(Boolean)

  if (sections.length === 0) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/60 px-2 py-1',
        className,
      )}
    >
      {sections.map((section, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <Separator orientation="vertical" className="h-7" />
          ) : null}
          <div className="flex items-center">{section}</div>
        </Fragment>
      ))}
    </div>
  )
}
