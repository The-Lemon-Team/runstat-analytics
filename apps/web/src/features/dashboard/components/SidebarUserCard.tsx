import type { UserDto } from '@spt/shared'
import { Eye, LayoutGrid, Users } from 'lucide-react'
import { formatNumber } from '@/lib/dashboard-utils'
import {
  getUserDisplayName,
  getUserInitials,
  type SidebarUserStats,
} from '@/features/dashboard/lib/sidebar-user-stats'

type SidebarUserCardProps = {
  user: UserDto
  stats: SidebarUserStats
}

export function SidebarUserCard({ user, stats }: SidebarUserCardProps) {
  const displayName = getUserDisplayName(user)
  const initials = getUserInitials(user)

  return (
    <div className="overflow-hidden rounded-xl border border-sidebar-border bg-gradient-to-br from-sidebar-accent/70 to-sidebar-accent/30 p-3.5 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20 text-sm font-semibold text-sidebar-primary ring-2 ring-sidebar-primary/20"
          aria-hidden
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            {displayName}
          </p>
          <p className="truncate text-[11px] text-sidebar-foreground/60">
            {user.email}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-sidebar-border/50 pt-3">
        <div className="rounded-lg bg-sidebar/50 px-2 py-1.5 text-center">
          <div className="flex items-center justify-center gap-1">
            <LayoutGrid className="size-3 text-sidebar-foreground/45" />
            <p className="font-mono text-sm font-semibold text-sidebar-foreground">
              {stats.topicsCount}
            </p>
          </div>
          <p className="text-[9px] text-sidebar-foreground/45">Темы</p>
        </div>
        <div className="rounded-lg bg-sidebar/50 px-2 py-1.5 text-center">
          <div className="flex items-center justify-center gap-1">
            <Eye className="size-3 text-sidebar-foreground/45" />
            <p className="font-mono text-sm font-semibold text-sidebar-foreground">
              {formatNumber(stats.totalViews)}
            </p>
          </div>
          <p className="text-[9px] text-sidebar-foreground/45">Просмотры</p>
        </div>
        <div className="rounded-lg bg-sidebar/50 px-2 py-1.5 text-center">
          <div className="flex items-center justify-center gap-1">
            <Users className="size-3 text-sidebar-foreground/45" />
            <p className="font-mono text-sm font-semibold text-sidebar-foreground">
              {stats.connectedPlatforms > 0
                ? formatNumber(stats.totalSubscribers)
                : '—'}
            </p>
          </div>
          <p className="text-[9px] text-sidebar-foreground/45">Подписчики</p>
        </div>
      </div>
    </div>
  )
}
