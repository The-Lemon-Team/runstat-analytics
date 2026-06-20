"use client"

import * as React from "react"
import {
  BarChart3Icon,
  CalendarDaysIcon,
  LayoutGridIcon,
  type LucideIcon,
  RadioIcon,
  SettingsIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  hint: string
  icon: LucideIcon
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Workspace",
    items: [
      { label: "Контент-сетка", hint: "Content grid", icon: LayoutGridIcon },
      { label: "Эфиры", hint: "Live broadcasts", icon: RadioIcon },
      { label: "Аналитика", hint: "Analytics", icon: BarChart3Icon },
      { label: "Календарь", hint: "Schedule", icon: CalendarDaysIcon },
    ],
  },
  {
    section: "Agency",
    items: [
      { label: "Команда", hint: "Team", icon: UsersIcon },
      { label: "Достижения", hint: "Highlights", icon: TrophyIcon },
      { label: "Настройки", hint: "Settings", icon: SettingsIcon },
    ],
  },
]

export function DashboardSidebar() {
  const [active, setActive] = React.useState("Контент-сетка")

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar/80 p-4 text-sidebar-foreground backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-2 pt-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <TrophyIcon className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Studio S10</p>
          <p className="text-xs text-sidebar-foreground/60">Sports Content</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.section} className="flex flex-col gap-1">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              {group.section}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = active === item.label
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActive(item.label)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-border"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive ? (
                    <span className="size-1.5 rounded-full bg-sidebar-primary" />
                  ) : null}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3 backdrop-blur">
        <p className="text-xs font-medium">Сезон 2026</p>
        <p className="mt-0.5 text-[11px] text-sidebar-foreground/60">
          Все площадки синхронизированы
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-foreground/15">
          <div className="h-full w-[78%] rounded-full bg-sidebar-primary" />
        </div>
      </div>
    </aside>
  )
}
