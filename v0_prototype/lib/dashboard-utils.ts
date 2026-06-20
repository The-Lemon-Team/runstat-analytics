import type { Metrics, Stage, Topic } from "./dashboard-data"

export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1) + "M"
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1) + "K"
  }
  return value.toLocaleString("ru-RU")
}

const emptyMetrics: Metrics = { views: 0, likes: 0, comments: 0 }

export function sumMetrics(a: Metrics, b: Metrics): Metrics {
  return {
    views: a.views + b.views,
    likes: a.likes + b.likes,
    comments: a.comments + b.comments,
  }
}

export function aggregateStage(stage: Stage): Metrics {
  return stage.publications.reduce(
    (acc, pub) => sumMetrics(acc, pub.metrics),
    { ...emptyMetrics },
  )
}

export function aggregateTopic(topic: Topic): Metrics {
  return topic.stages.reduce(
    (acc, stage) => sumMetrics(acc, aggregateStage(stage)),
    { ...emptyMetrics },
  )
}

export function countPublications(topic: Topic): { total: number; published: number } {
  let total = 0
  let published = 0
  for (const stage of topic.stages) {
    for (const pub of stage.publications) {
      total += 1
      if (pub.status === "published") published += 1
    }
  }
  return { total, published }
}

export function aggregateAll(topics: Topic[]): Metrics {
  return topics.reduce(
    (acc, topic) => sumMetrics(acc, aggregateTopic(topic)),
    { ...emptyMetrics },
  )
}
