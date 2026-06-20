export const DASHBOARD_NAV = {
  content: 'Контент-сетка',
  topics: 'Темы',
  broadcasts: 'Эфиры',
  analytics: 'Аналитика',
  calendar: 'Календарь',
  team: 'Команда',
  achievements: 'Достижения',
  settings: 'Настройки',
} as const

export type DashboardNavItem =
  (typeof DASHBOARD_NAV)[keyof typeof DASHBOARD_NAV]

export const DASHBOARD_PATHS: Record<DashboardNavItem, string> = {
  [DASHBOARD_NAV.content]: '/',
  [DASHBOARD_NAV.topics]: '/topics',
  [DASHBOARD_NAV.broadcasts]: '/broadcasts',
  [DASHBOARD_NAV.analytics]: '/analytics',
  [DASHBOARD_NAV.calendar]: '/calendar',
  [DASHBOARD_NAV.team]: '/team',
  [DASHBOARD_NAV.achievements]: '/achievements',
  [DASHBOARD_NAV.settings]: '/settings',
}

export function navFromPath(pathname: string): DashboardNavItem {
  const sorted = Object.entries(DASHBOARD_PATHS).sort(
    ([, a], [, b]) => b.length - a.length,
  )

  for (const [nav, path] of sorted) {
    if (path !== '/' && pathname.startsWith(path)) {
      return nav as DashboardNavItem
    }
  }

  return DASHBOARD_NAV.content
}

export const UNDER_DEVELOPMENT_PAGES: DashboardNavItem[] = [
  DASHBOARD_NAV.broadcasts,
  DASHBOARD_NAV.analytics,
  DASHBOARD_NAV.team,
  DASHBOARD_NAV.achievements,
]

export const PAGES_WITH_CUSTOM_HEADER = new Set<DashboardNavItem>([
  DASHBOARD_NAV.content,
  DASHBOARD_NAV.topics,
])

export const PAGE_TITLES: Record<DashboardNavItem, { title: string; subtitle: string }> = {
  [DASHBOARD_NAV.content]: {
    title: 'Content Metrics',
    subtitle: 'Трекинг публикаций по темам, этапам и площадкам',
  },
  [DASHBOARD_NAV.topics]: {
    title: 'Темы',
    subtitle: 'Список контент-тем и публикаций',
  },
  [DASHBOARD_NAV.broadcasts]: {
    title: 'Эфиры',
    subtitle: 'Управление прямыми трансляциями',
  },
  [DASHBOARD_NAV.analytics]: {
    title: 'Аналитика',
    subtitle: 'Сводная аналитика по площадкам',
  },
  [DASHBOARD_NAV.calendar]: {
    title: 'Календарь',
    subtitle: 'Публикации по датам',
  },
  [DASHBOARD_NAV.team]: {
    title: 'Команда',
    subtitle: 'Участники и роли',
  },
  [DASHBOARD_NAV.achievements]: {
    title: 'Достижения',
    subtitle: 'Цели и прогресс сезона',
  },
  [DASHBOARD_NAV.settings]: {
    title: 'Настройки',
    subtitle: 'Профиль и параметры аккаунта',
  },
}
