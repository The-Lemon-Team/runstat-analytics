/** Brand palette aligned with Runstat Analytics (hsl 159° teal-green). */
export const EXCEL_THEME = {
  brandName: 'Runstat Analytics',
  tagline: 'Аналитика публикаций и аудитории',
  colors: {
    primary: 'FF2D9B6F',
    primaryDark: 'FF1F6B4D',
    accent: 'FFE8F3EF',
    headerText: 'FFFFFFFF',
    rowAlt: 'FFF4FAF7',
    rowEven: 'FFFFFFFF',
    border: 'FFD4E5DE',
    mutedText: 'FF6B7F78',
    published: 'FF2D9B6F',
    planned: 'FFD97706',
  },
} as const

export const EXCEL_FONTS = {
  brand: { name: 'Segoe UI', size: 16, bold: true },
  tagline: { name: 'Segoe UI', size: 10, italic: true },
  meta: { name: 'Segoe UI', size: 9 },
  header: { name: 'Segoe UI', size: 10, bold: true },
  body: { name: 'Segoe UI', size: 10 },
  bodyBold: { name: 'Segoe UI', size: 10, bold: true },
} as const

export const EXPORT_COLUMNS = [
  { key: 'topic', header: 'Тема', width: 28 },
  { key: 'stage', header: 'Этап', width: 18 },
  { key: 'publication', header: 'Публикация', width: 32 },
  { key: 'provider', header: 'Площадка', width: 14 },
  { key: 'status', header: 'Статус', width: 14 },
  { key: 'note', header: 'Комментарий', width: 28 },
  { key: 'date', header: 'Дата', width: 22 },
  { key: 'subscribersAtPublish', header: 'Подписчиков до публикации', width: 16 },
  { key: 'views', header: 'Просмотры', width: 12 },
  { key: 'likes', header: 'Лайки', width: 10 },
  { key: 'comments', header: 'Комментарии', width: 14 },
  { key: 'url', header: 'Ссылка на пост', width: 48 },
] as const
