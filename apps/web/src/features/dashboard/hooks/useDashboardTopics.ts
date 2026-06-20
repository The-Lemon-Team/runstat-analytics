import { useMemo, useState } from 'react'
import type { TopicDto } from '@spt/shared'
import {
  useCreateTopicMutation,
  useGetTopicsQuery,
} from '@/app/api/baseApi'
import { DEMO_TOPICS } from '@/features/content-table/lib/demo-data'

export function useDashboardTopics() {
  const { data: apiTopics, isError: topicsError } = useGetTopicsQuery()
  const [createTopic, { isLoading: isCreatingTopic }] = useCreateTopicMutation()
  const [demoTopics, setDemoTopics] = useState<TopicDto[]>([])

  const isDemo = topicsError || !apiTopics?.length

  const sourceTopics = useMemo(
    () => (isDemo ? [...DEMO_TOPICS, ...demoTopics] : (apiTopics ?? [])),
    [apiTopics, demoTopics, isDemo],
  )

  async function handleCreateTopic(name: string) {
    if (isDemo) {
      setDemoTopics((prev) => [
        ...prev,
        {
          id: `topic-local-${Date.now()}`,
          name,
          order: DEMO_TOPICS.length + prev.length,
          createdAt: new Date().toISOString(),
          stages: [],
        },
      ])
      return
    }

    await createTopic({ name }).unwrap()
  }

  return {
    sourceTopics,
    isDemo,
    handleCreateTopic,
    isCreatingTopic,
  }
}
