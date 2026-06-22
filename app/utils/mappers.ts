import type { CalendarDate } from '@internationalized/date'

export const calendarDateToISO = (date: CalendarDate | undefined) => {
  if (!date) return ''

  const utcTimestamp = Date.UTC(date.year, date.month - 1, date.day)
  return new Date(utcTimestamp).toISOString()
}
