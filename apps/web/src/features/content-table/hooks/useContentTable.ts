import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { TopicDto } from '@spt/shared'
import type { LiveSubscriberSource } from '@/lib/provider-connections'
import {
  type ContentTableRow,
  flattenTopicsToRows,
} from '../lib/metrics'

function buildVisibleRows(
  allRows: ContentTableRow[],
  expandedTopics: Set<string>,
  expandedStages: Set<string>,
): ContentTableRow[] {
  const visible: ContentTableRow[] = []

  for (const row of allRows) {
    if (row.kind === 'topic') {
      visible.push(row)
      continue
    }

    if (row.kind === 'stage') {
      if (expandedTopics.has(row.topicId)) {
        visible.push(row)
      }
      continue
    }

    if (
      row.kind === 'publication' &&
      row.stageId &&
      expandedTopics.has(row.topicId) &&
      expandedStages.has(`${row.topicId}::${row.stageId}`)
    ) {
      visible.push(row)
    }
  }

  return visible
}

export function useContentTable(
  topics: TopicDto[],
  options?: {
    subscriberSources?: LiveSubscriberSource[]
    showSubscribersColumn?: boolean
    showCommentColumn?: boolean
    showDateColumn?: boolean
  },
) {
  const subscriberSources = options?.subscriberSources
  const showSubscribersColumn = options?.showSubscribersColumn ?? false
  const showCommentColumn = options?.showCommentColumn ?? false
  const showDateColumn = options?.showDateColumn ?? false

  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(
    () => new Set(topics.map((t) => t.id)),
  )
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    () =>
      new Set(
        topics.flatMap((t) => t.stages.map((s) => `${t.id}::${s.id}`)),
      ),
  )

  const allRows = useMemo(
    () => flattenTopicsToRows(topics, subscriberSources),
    [topics, subscriberSources],
  )

  const visibleRows = useMemo(
    () => buildVisibleRows(allRows, expandedTopics, expandedStages),
    [allRows, expandedTopics, expandedStages],
  )

  const columns = useMemo<ColumnDef<ContentTableRow>[]>(
    () => [
      {
        id: 'name',
        header: 'Тема / Этап / Публикация',
        accessorKey: 'name',
      },
      {
        id: 'status',
        header: 'Статус',
      },
      ...(showDateColumn
        ? [
            {
              id: 'date',
              header: 'Дата',
            } satisfies ColumnDef<ContentTableRow>,
          ]
        : []),
      ...(showSubscribersColumn
        ? [
            {
              id: 'subscribers',
              header: 'Подписчики до',
            } satisfies ColumnDef<ContentTableRow>,
          ]
        : []),
      ...(showCommentColumn
        ? [
            {
              id: 'comment',
              header: 'Комментарий',
            } satisfies ColumnDef<ContentTableRow>,
          ]
        : []),
      {
        id: 'views',
        header: 'Просмотры',
        accessorFn: (row) => row.metrics.views,
      },
      {
        id: 'likes',
        header: 'Лайки',
        accessorFn: (row) => row.metrics.likes,
      },
      {
        id: 'comments',
        header: 'Комм.',
        accessorFn: (row) => row.metrics.comments,
      },
      {
        id: 'er',
        header: 'ER',
      },
    ],
    [showSubscribersColumn, showCommentColumn, showDateColumn],
  )

  const table = useReactTable({
    data: visibleRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: (row) => row.id,
  })

  function toggleTopic(topicId: string): void {
    setExpandedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) next.delete(topicId)
      else next.add(topicId)
      return next
    })
  }

  function toggleStage(topicId: string, stageId: string): void {
    const key = `${topicId}::${stageId}`
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function isTopicExpanded(topicId: string): boolean {
    return expandedTopics.has(topicId)
  }

  function isStageExpanded(topicId: string, stageId: string): boolean {
    return expandedStages.has(`${topicId}::${stageId}`)
  }

  return {
    table,
    visibleRows,
    showSubscribersColumn,
    showCommentColumn,
    showDateColumn,
    toggleTopic,
    toggleStage,
    isTopicExpanded,
    isStageExpanded,
  }
}
