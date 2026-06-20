export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

export const MONTH_LABELS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const

export type DateRangeValue = {
  enabled: boolean
  from: Date | null
  to: Date | null
}

export const EMPTY_DATE_RANGE: DateRangeValue = {
  enabled: false,
  from: null,
  to: null,
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isAfterToday(date: Date): boolean {
  return startOfDay(date).getTime() > startOfDay(new Date()).getTime()
}

export function isAfterCurrentMonth(cursor: Date): boolean {
  const now = new Date()
  return (
    cursor.getFullYear() > now.getFullYear() ||
    (cursor.getFullYear() === now.getFullYear() &&
      cursor.getMonth() > now.getMonth())
  )
}

export function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []

  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d))
  }

  return cells
}

export function normalizeDateRange(from: Date, to: Date): { from: Date; to: Date } {
  const start = startOfDay(from)
  const end = startOfDay(to)
  return start.getTime() <= end.getTime()
    ? { from: start, to: end }
    : { from: end, to: start }
}

export function isDateInRange(
  date: Date,
  from: Date | null,
  to: Date | null,
): boolean {
  if (!from || !to) return false
  const { from: start, to: end } = normalizeDateRange(from, to)
  const time = startOfDay(date).getTime()
  return time >= start.getTime() && time <= end.getTime()
}

export function formatDateRangeLabel(range: DateRangeValue): string {
  if (!range.enabled || !range.from || !range.to) {
    return 'Период'
  }

  const { from, to } = normalizeDateRange(range.from, range.to)
  const sameMonth =
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth()

  if (sameDay(from, to)) {
    return from.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (sameMonth) {
    const month = from.toLocaleDateString('ru-RU', { month: 'short' })
    return `${from.getDate()}–${to.getDate()} ${month} ${from.getFullYear()}`
  }

  const fromLabel = from.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
  const toLabel = to.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${fromLabel} – ${toLabel}`
}
