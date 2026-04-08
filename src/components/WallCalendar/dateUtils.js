/**
 * Returns the number of days in a month.
 */
export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Returns the weekday index (0=Mon … 6=Sun) of the 1st of the month.
 */
export function firstWeekdayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay() // 0=Sun
  return day === 0 ? 6 : day - 1 // shift to Mon-based
}

/**
 * Formats a Date as "YYYY-M-D" holiday-map key.
 */
export function toHolidayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/**
 * Clamps a date to midnight so comparisons are day-accurate.
 */
export function midnight(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * True if two Date objects represent the same calendar day.
 */
export function isSameDay(a, b) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * True if `date` falls strictly between `start` and `end` (exclusive).
 */
export function isBetween(date, start, end) {
  if (!start || !end) return false
  const d = midnight(date).getTime()
  const s = midnight(start).getTime()
  const e = midnight(end).getTime()
  const lo = Math.min(s, e)
  const hi = Math.max(s, e)
  return d > lo && d < hi
}

/**
 * Formats a range as a human-readable string.
 */
export function formatRange(start, end) {
  if (!start) return ''
  const opts = { month: 'short', day: 'numeric' }
  if (!end || isSameDay(start, end)) {
    return start.toLocaleDateString('en-US', { ...opts, year: 'numeric' })
  }
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth =
    sameYear && start.getMonth() === end.getMonth()
  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
  const endStr = end.toLocaleDateString('en-US', {
    ...(sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' }),
    year: 'numeric',
  })
  return `${startStr} – ${endStr}`
}

/**
 * Returns the number of days in a selected range (inclusive).
 */
export function rangeDays(start, end) {
  if (!start || !end) return 0
  const diff =
    Math.abs(midnight(end).getTime() - midnight(start).getTime())
  return Math.round(diff / 86_400_000) + 1
}
