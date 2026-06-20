import { CheckIcon, ClockIcon, ExternalLinkIcon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Publication } from "@/lib/dashboard-data"
import { getProvider } from "@/lib/dashboard-data"
import { formatNumber } from "@/lib/dashboard-utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ProviderBadge } from "./provider-badge"

function StatusDot({ status }: { status: Publication["status"] }) {
  if (status === "published") {
    return (
      <span className="inline-flex size-4 items-center justify-center rounded-full bg-success text-success-foreground">
        <CheckIcon className="size-3" />
      </span>
    )
  }
  if (status === "scheduled") {
    return (
      <span className="inline-flex size-4 items-center justify-center rounded-full bg-warning text-warning-foreground">
        <ClockIcon className="size-3" />
      </span>
    )
  }
  return (
    <span className="inline-flex size-4 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground">
      <PlusIcon className="size-2.5" />
    </span>
  )
}

export function PublicationSlot({ publication }: { publication: Publication }) {
  const provider = getProvider(publication.providerId)
  const isMissing = publication.status === "missing"

  return (
    <div
      className={cn(
        "group/slot relative flex flex-col gap-2 rounded-xl border bg-card p-3 transition-colors",
        isMissing
          ? "border-dashed border-border bg-muted/30"
          : "border-border hover:border-primary/40 hover:bg-accent/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <ProviderBadge providerId={publication.providerId} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium leading-tight">
              {publication.label}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {provider.name}
            </p>
          </div>
        </div>
        <StatusDot status={publication.status} />
      </div>

      {isMissing ? (
        <p className="text-[11px] italic text-muted-foreground">
          Слот свободен
        </p>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[11px] text-muted-foreground">
            просмотры{" "}
            <span className="text-foreground">
              {formatNumber(publication.metrics.views)}
            </span>
            , комм{" "}
            <span className="text-foreground">
              {formatNumber(publication.metrics.comments)}
            </span>
          </p>
          {publication.url ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/slot:opacity-100"
                  />
                }
              >
                <ExternalLinkIcon className="size-3.5" />
                <span className="sr-only">Открыть публикацию</span>
              </TooltipTrigger>
              <TooltipContent>Открыть пост</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      )}

      {!isMissing ? (
        <div className="flex items-center gap-1 border-t border-border/60 pt-1.5">
          <span className="font-mono text-[10px] text-muted-foreground">
            лайки{" "}
            <span className="text-foreground">
              {formatNumber(publication.metrics.likes)}
            </span>
          </span>
        </div>
      ) : null}
    </div>
  )
}
