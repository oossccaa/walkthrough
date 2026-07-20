import { differenceInCalendarDays, format, parseISO, setYear, addYears, isBefore } from 'date-fns'

export function fmt(iso?: string): string {
  if (!iso) return ''
  return format(parseISO(iso), 'yyyy/MM/dd')
}

/** 距今天數(過去日期為正) */
export function daysSince(iso: string): number {
  return differenceInCalendarDays(new Date(), parseISO(iso))
}

/** 下次週年日期(recurring 用) */
export function nextOccurrence(iso: string): Date {
  const orig = parseISO(iso)
  const today = new Date()
  let next = setYear(orig, today.getFullYear())
  if (isBefore(next, today) && differenceInCalendarDays(next, today) !== 0) {
    next = addYears(next, 1)
  }
  return next
}

/** 距下次週年還有幾天(今天 = 0) */
export function daysUntilNext(iso: string): number {
  return differenceInCalendarDays(nextOccurrence(iso), new Date())
}

/** 交往長度描述,例:1 年 3 個月 */
export function durationLabel(startIso: string, endIso?: string): string {
  const start = parseISO(startIso)
  const end = endIso ? parseISO(endIso) : new Date()
  const days = differenceInCalendarDays(end, start)
  if (days < 31) return `${days} 天`
  const months = Math.floor(days / 30.44)
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  if (years === 0) return `${months} 個月`
  return remMonths === 0 ? `${years} 年` : `${years} 年 ${remMonths} 個月`
}
