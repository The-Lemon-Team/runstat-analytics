import { cn } from "@/lib/utils"
import { getProvider } from "@/lib/dashboard-data"

export function ProviderBadge({
  providerId,
  size = "default",
  className,
}: {
  providerId: string
  size?: "sm" | "default"
  className?: string
}) {
  const provider = getProvider(providerId)
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-mono font-semibold tracking-tight",
        size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs",
        className,
      )}
      style={{ backgroundColor: provider.color, color: provider.textColor }}
      aria-hidden="true"
    >
      {provider.abbr}
    </span>
  )
}
