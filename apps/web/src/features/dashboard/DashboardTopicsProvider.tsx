import { createContext, useContext, type ReactNode } from 'react'
import type { TopicDto } from '@spt/shared'
import { useDashboardTopics } from '@/features/dashboard/hooks/useDashboardTopics'

type DashboardTopicsContextValue = {
  sourceTopics: TopicDto[]
  isDemo: boolean
  handleCreateTopic: (name: string) => Promise<void>
  isCreatingTopic: boolean
}

const DashboardTopicsContext = createContext<DashboardTopicsContextValue | null>(
  null,
)

export function DashboardTopicsProvider({ children }: { children: ReactNode }) {
  const value = useDashboardTopics()
  return (
    <DashboardTopicsContext.Provider value={value}>
      {children}
    </DashboardTopicsContext.Provider>
  )
}

export function useDashboardTopicsContext() {
  const context = useContext(DashboardTopicsContext)
  if (!context) {
    throw new Error(
      'useDashboardTopicsContext must be used within DashboardTopicsProvider',
    )
  }
  return context
}
