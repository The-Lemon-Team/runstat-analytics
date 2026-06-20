import { UnderDevelopment } from '@/components/UnderDevelopment'
import { CalendarView } from '@/features/calendar/CalendarView'
import { useDashboardTopicsContext } from '@/features/dashboard/DashboardTopicsProvider'
import { SettingsView } from '@/features/settings/SettingsView'
import type { DashboardNavItem } from '@/features/dashboard/lib/nav'

export function CalendarPage() {
  const { sourceTopics } = useDashboardTopicsContext()
  return <CalendarView topics={sourceTopics} />
}

export function SettingsPage() {
  return <SettingsView />
}

export function UnderDevelopmentPage({ title }: { title: DashboardNavItem }) {
  return <UnderDevelopment title={title} />
}
