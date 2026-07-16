const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('es-CL', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

export function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return dateFormatter.format(new Date(year, month - 1, day))
}

export function formatShortDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return shortDateFormatter.format(new Date(year, month - 1, day))
}

export function formatTime(value: string): string {
  return value.slice(0, 5)
}

export function todayISO(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function isToday(value: string): boolean {
  return value === todayISO()
}

export function isUpcoming(value: string): boolean {
  return value >= todayISO()
}
