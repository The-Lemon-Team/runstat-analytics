export type Metrics = {
  views: number
  likes: number
  comments: number
}

export type PublicationStatus = "published" | "scheduled" | "missing"

export type Publication = {
  id: string
  providerId: string
  /** Custom display label, e.g. "VK Юрий" */
  label: string
  stageId: string
  url: string
  status: PublicationStatus
  metrics: Metrics
}

export type Stage = {
  id: string
  name: string
  /** short helper line shown under the stage name */
  hint: string
  publications: Publication[]
}

export type Topic = {
  id: string
  name: string
  translation: string
  category: string
  stages: Stage[]
}

export type Provider = {
  id: string
  name: string
  abbr: string
  /** brand color for the provider badge */
  color: string
  textColor: string
}

export const PROVIDERS: Provider[] = [
  { id: "tg", name: "Telegram", abbr: "TG", color: "#229ED9", textColor: "#ffffff" },
  { id: "vk", name: "VKontakte", abbr: "VK", color: "#0077FF", textColor: "#ffffff" },
  { id: "youtube", name: "YouTube", abbr: "YT", color: "#FF0033", textColor: "#ffffff" },
  { id: "instagram", name: "Instagram", abbr: "IG", color: "#E1306C", textColor: "#ffffff" },
  { id: "club", name: "Club Solo Audio", abbr: "CS", color: "#0F766E", textColor: "#ffffff" },
  { id: "dzen", name: "Дзен", abbr: "DZ", color: "#262626", textColor: "#ffffff" },
]

export function getProvider(id: string): Provider {
  return (
    PROVIDERS.find((p) => p.id === id) ?? {
      id,
      name: id,
      abbr: id.slice(0, 2).toUpperCase(),
      color: "#64748B",
      textColor: "#ffffff",
    }
  )
}

export const STAGE_TEMPLATES = [
  { id: "anons", name: "Анонс эфира", hint: "Pre-stream announcements" },
  { id: "live", name: "Эфир (live)", hint: "Live broadcast posts" },
  { id: "shorts", name: "Нарезки (shorts/reels)", hint: "Short-form clips & reels" },
]

const m = (views: number, likes: number, comments: number): Metrics => ({
  views,
  likes,
  comments,
})

export const INITIAL_TOPICS: Topic[] = [
  {
    id: "sleep",
    name: "Сон",
    translation: "Sleep",
    category: "Wellness",
    stages: [
      {
        id: "anons",
        name: "Анонс эфира",
        hint: "Pre-stream announcements",
        publications: [
          { id: "p1", providerId: "tg", label: "TG S10", stageId: "anons", url: "https://t.me/s10/101", status: "published", metrics: m(678, 42, 0) },
          { id: "p2", providerId: "vk", label: "VK S10", stageId: "anons", url: "https://vk.com/s10?w=wall-1", status: "published", metrics: m(1240, 88, 5) },
          { id: "p3", providerId: "vk", label: "VK Юрий", stageId: "anons", url: "https://vk.com/yuri?w=wall-2", status: "published", metrics: m(540, 31, 2) },
          { id: "p4", providerId: "instagram", label: "Insta", stageId: "anons", url: "", status: "missing", metrics: m(0, 0, 0) },
        ],
      },
      {
        id: "live",
        name: "Эфир (live)",
        hint: "Live broadcast posts",
        publications: [
          { id: "p5", providerId: "youtube", label: "YouTube", stageId: "live", url: "https://youtube.com/watch?v=abc", status: "published", metrics: m(8430, 612, 47) },
          { id: "p6", providerId: "tg", label: "TG S10", stageId: "live", url: "https://t.me/s10/102", status: "published", metrics: m(2310, 154, 12) },
          { id: "p7", providerId: "club", label: "Club Solo Audio", stageId: "live", url: "https://club.solo/audio/1", status: "scheduled", metrics: m(0, 0, 0) },
        ],
      },
      {
        id: "shorts",
        name: "Нарезки (shorts/reels)",
        hint: "Short-form clips & reels",
        publications: [
          { id: "p8", providerId: "youtube", label: "YouTube Shorts", stageId: "shorts", url: "https://youtube.com/shorts/x1", status: "published", metrics: m(15200, 1840, 96) },
          { id: "p9", providerId: "instagram", label: "Insta Reels", stageId: "shorts", url: "https://instagram.com/reel/x2", status: "published", metrics: m(9800, 1120, 64) },
          { id: "p10", providerId: "vk", label: "VK Клипы", stageId: "shorts", url: "https://vk.com/clip-3", status: "published", metrics: m(4300, 380, 21) },
          { id: "p11", providerId: "tg", label: "TG S10", stageId: "shorts", url: "https://t.me/s10/103", status: "published", metrics: m(3100, 210, 8) },
        ],
      },
    ],
  },
  {
    id: "womens-running",
    name: "Женский бег",
    translation: "Women's Running",
    category: "Sport",
    stages: [
      {
        id: "anons",
        name: "Анонс эфира",
        hint: "Pre-stream announcements",
        publications: [
          { id: "r1", providerId: "tg", label: "TG S10", stageId: "anons", url: "https://t.me/s10/201", status: "published", metrics: m(920, 64, 3) },
          { id: "r2", providerId: "vk", label: "VK Юрий", stageId: "anons", url: "https://vk.com/yuri?w=wall-5", status: "published", metrics: m(1450, 102, 9) },
          { id: "r3", providerId: "instagram", label: "Insta", stageId: "anons", url: "https://instagram.com/p/run1", status: "published", metrics: m(2100, 340, 18) },
        ],
      },
      {
        id: "live",
        name: "Эфир (live)",
        hint: "Live broadcast posts",
        publications: [
          { id: "r4", providerId: "youtube", label: "YouTube", stageId: "live", url: "https://youtube.com/watch?v=run", status: "published", metrics: m(12400, 980, 73) },
          { id: "r5", providerId: "vk", label: "VK S10", stageId: "live", url: "https://vk.com/s10?w=wall-6", status: "published", metrics: m(5600, 410, 34) },
          { id: "r6", providerId: "club", label: "Club Solo Audio", stageId: "live", url: "", status: "missing", metrics: m(0, 0, 0) },
        ],
      },
      {
        id: "shorts",
        name: "Нарезки (shorts/reels)",
        hint: "Short-form clips & reels",
        publications: [
          { id: "r7", providerId: "instagram", label: "Insta Reels", stageId: "shorts", url: "https://instagram.com/reel/run2", status: "published", metrics: m(28400, 3120, 184) },
          { id: "r8", providerId: "youtube", label: "YouTube Shorts", stageId: "shorts", url: "https://youtube.com/shorts/run3", status: "published", metrics: m(19700, 2240, 142) },
          { id: "r9", providerId: "tg", label: "TG S10", stageId: "shorts", url: "https://t.me/s10/203", status: "scheduled", metrics: m(0, 0, 0) },
        ],
      },
    ],
  },
]

