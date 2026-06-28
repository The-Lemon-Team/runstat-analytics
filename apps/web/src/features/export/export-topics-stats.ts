import ExcelJS from 'exceljs'
import { PROVIDER_LABELS, PublicationStatus } from '@spt/shared'
import { formatSubscriberDate } from '@/lib/dashboard-utils'
import type { TopicPublicationRow } from '@/features/topics/lib/topic-filters'
import { EXCEL_FONTS, EXCEL_THEME, EXPORT_COLUMNS } from './excel-theme'

function formatExportDate(date: Date): string {
  return formatSubscriberDate(date.toISOString())
}

type ExportRowData = {
  topic: string
  stage: string
  publication: string
  provider: string
  status: string
  note: string
  date: string
  subscribersAtPublish: number | ''
  views: number | ''
  likes: number | ''
  comments: number | ''
  url: string
  isPublished: boolean
}

function buildExportRows(rows: TopicPublicationRow[]): ExportRowData[] {
  return rows.map((row) => {
    const isPublished = row.status === PublicationStatus.PUBLISHED

    return {
      topic: row.topicName,
      stage: row.stageName,
      publication: row.label,
      provider: PROVIDER_LABELS[row.provider],
      status: isPublished ? 'Опубликовано' : 'Запланировано',
      note: row.comment ?? '',
      date: row.date ? formatExportDate(row.date) : '',
      subscribersAtPublish:
        isPublished && row.subscribersAtPublish != null
          ? row.subscribersAtPublish
          : '',
      views: isPublished ? row.metrics.views : '',
      likes: isPublished ? row.metrics.likes : '',
      comments: isPublished ? row.metrics.comments : '',
      url: row.postUrl ?? '',
      isPublished,
    }
  })
}

function estimateColumnWidth(
  values: string[],
  minWidth: number,
  maxWidth: number,
): number {
  const maxLen = values.reduce((max, value) => Math.max(max, value.length), 0)
  const width = Math.ceil(maxLen * 1.05) + 2
  return Math.min(Math.max(width, minWidth), maxWidth)
}

function applyBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: 'thin', color: { argb: EXCEL_THEME.colors.border } },
    left: { style: 'thin', color: { argb: EXCEL_THEME.colors.border } },
    bottom: { style: 'thin', color: { argb: EXCEL_THEME.colors.border } },
    right: { style: 'thin', color: { argb: EXCEL_THEME.colors.border } },
  }
}

export type ExportTopicsStatsOptions = {
  filename?: string
  periodLabel?: string
}

export async function exportTopicsStatsToExcel(
  rows: TopicPublicationRow[],
  options?: ExportTopicsStatsOptions,
): Promise<void> {
  if (rows.length === 0) return

  const data = buildExportRows(rows)
  const colCount = EXPORT_COLUMNS.length
  const generatedAt = new Date().toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = EXCEL_THEME.brandName
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Статистика', {
    views: [{ state: 'frozen', ySplit: 5 }],
  })

  const dateColumnWidth = estimateColumnWidth(
    data.map((row) => row.date),
    EXPORT_COLUMNS.find((col) => col.key === 'date')!.width,
    28,
  )
  const urlColumnWidth = estimateColumnWidth(
    data.map((row) => row.url),
    EXPORT_COLUMNS.find((col) => col.key === 'url')!.width,
    64,
  )

  sheet.columns = EXPORT_COLUMNS.map((col) => ({
    key: col.key,
    width:
      col.key === 'date'
        ? dateColumnWidth
        : col.key === 'url'
          ? urlColumnWidth
          : col.width,
  }))

  // Brand banner
  sheet.mergeCells(1, 1, 1, colCount)
  const brandCell = sheet.getCell(1, 1)
  brandCell.value = EXCEL_THEME.brandName
  brandCell.font = { ...EXCEL_FONTS.brand, color: { argb: EXCEL_THEME.colors.headerText } }
  brandCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: EXCEL_THEME.colors.primary },
  }
  brandCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  sheet.getRow(1).height = 32

  // Tagline
  sheet.mergeCells(2, 1, 2, colCount)
  const taglineCell = sheet.getCell(2, 1)
  taglineCell.value = EXCEL_THEME.tagline
  taglineCell.font = { ...EXCEL_FONTS.tagline, color: { argb: EXCEL_THEME.colors.headerText } }
  taglineCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: EXCEL_THEME.colors.primaryDark },
  }
  taglineCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  sheet.getRow(2).height = 20

  // Meta row
  sheet.mergeCells(3, 1, 3, colCount)
  const metaParts = ['Статистика публикаций']
  if (options?.periodLabel) {
    metaParts.push(`Период: ${options.periodLabel}`)
  }
  metaParts.push(`Сформировано: ${generatedAt}`)
  const metaCell = sheet.getCell(3, 1)
  metaCell.value = metaParts.join('  ·  ')
  metaCell.font = { ...EXCEL_FONTS.meta, color: { argb: EXCEL_THEME.colors.mutedText } }
  metaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: EXCEL_THEME.colors.accent },
  }
  metaCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  sheet.getRow(3).height = 18

  // Spacer
  sheet.getRow(4).height = 6

  // Column headers
  const headerRow = sheet.getRow(5)
  EXPORT_COLUMNS.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1)
    cell.value = col.header
    cell.font = { ...EXCEL_FONTS.header, color: { argb: EXCEL_THEME.colors.headerText } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: EXCEL_THEME.colors.primary },
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    applyBorder(cell)
  })
  headerRow.height = 24

  // Data rows
  data.forEach((row, rowIndex) => {
    const excelRow = sheet.getRow(6 + rowIndex)
    const isAlt = rowIndex % 2 === 1
    const bgColor = isAlt ? EXCEL_THEME.colors.rowAlt : EXCEL_THEME.colors.rowEven

    const values = [
      row.topic,
      row.stage,
      row.publication,
      row.provider,
      row.status,
      row.note,
      row.date,
      row.subscribersAtPublish,
      row.views,
      row.likes,
      row.comments,
      row.url,
    ]

    values.forEach((value, colIndex) => {
      const cell = excelRow.getCell(colIndex + 1)
      cell.value = value
      cell.font = {
        ...EXCEL_FONTS.body,
        color: {
          argb:
            colIndex === 4
              ? row.isPublished
                ? EXCEL_THEME.colors.published
                : EXCEL_THEME.colors.planned
              : colIndex === 5 && row.note
                ? EXCEL_THEME.colors.mutedText
                : 'FF1A2E28',
        },
        bold: colIndex === 4,
        italic: colIndex === 5 && Boolean(row.note),
      }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor },
      }
      applyBorder(cell)

      if (colIndex >= 7 && colIndex <= 10 && typeof value === 'number') {
        cell.numFmt = '#,##0'
        cell.alignment = { horizontal: 'right' }
      }

      if (colIndex === 5 && row.note) {
        cell.alignment = { vertical: 'top', wrapText: true }
      }

      if (colIndex === 6 && row.date) {
        cell.alignment = { vertical: 'middle', wrapText: true }
      }

      if (colIndex === 11 && row.url) {
        cell.value = { text: row.url, hyperlink: row.url }
        cell.font = {
          ...EXCEL_FONTS.body,
          color: { argb: EXCEL_THEME.colors.primary },
          underline: true,
        }
        cell.alignment = { vertical: 'top', wrapText: true }
      }
    })

    const wrappedLines = Math.max(
      1,
      row.note ? Math.ceil(row.note.length / 28) : 1,
      row.url ? Math.ceil(row.url.length / urlColumnWidth) : 1,
    )
    excelRow.height = Math.max(20, wrappedLines * 15)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = options?.filename ?? `topics-stats-${date}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}
