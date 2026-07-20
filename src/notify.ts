// 到期提醒:App 開啟時檢查「N 天內的紀念日」與「今明兩天的行程」。
// 畫面內一定會顯示;若使用者有授權瀏覽器通知,額外發系統通知(每項每天最多一次)。

import { db } from './db/db'
import { daysUntilNext, fmt } from './utils/dates'
import { today } from './db/repo'

export const REMIND_DAYS_AHEAD = 3

export interface ReminderItem {
  key: string
  personId?: string
  title: string
  sub: string
  days: number // 幾天後(0 = 今天)
}

export async function getReminders(): Promise<ReminderItem[]> {
  const [anniversaries, itineraries, persons] = await Promise.all([
    db.anniversaries.toArray(),
    db.itineraries.toArray(),
    db.persons.toArray(),
  ])
  const nameOf = (id?: string) => persons.find(p => p.id === id)?.name

  const items: ReminderItem[] = []

  for (const a of anniversaries) {
    if (!a.recurring) continue
    const d = daysUntilNext(a.date)
    if (d <= REMIND_DAYS_AHEAD) {
      const who = nameOf(a.personId)
      items.push({
        key: `ann-${a.id}-${today()}`,
        personId: a.personId,
        title: a.title,
        sub: `${who ? `${who}・` : ''}${fmt(a.date)}`,
        days: d,
      })
    }
  }

  const t = today()
  for (const it of itineraries) {
    const diff = Math.round((Date.parse(it.date) - Date.parse(t)) / 86_400_000)
    if (diff === 0 || diff === 1) {
      const who = nameOf(it.personId)
      items.push({
        key: `iti-${it.id}-${t}`,
        personId: it.personId,
        title: `${diff === 0 ? '今天' : '明天'}有行程:${it.stops[0]?.place ?? ''}${it.stops.length > 1 ? ` 等 ${it.stops.length} 站` : ''}`,
        sub: `${who ? `與 ${who}・` : ''}${fmt(it.date)}`,
        days: diff,
      })
    }
  }

  return items.sort((a, b) => a.days - b.days)
}

export function notificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

export async function enableNotifications(): Promise<boolean> {
  if (!('Notification' in window)) return false
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

/** App 開啟時呼叫:發系統通知,同一項目每天只發一次 */
export async function fireNotifications() {
  if (!notificationsEnabled()) return
  const items = await getReminders()
  if (items.length === 0) return
  const storageKey = 'ln:notified'
  let sent: string[] = []
  try {
    sent = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
  } catch { /* ignore */ }
  const fresh = items.filter(i => !sent.includes(i.key))
  for (const i of fresh) {
    new Notification(i.days === 0 ? `今天:${i.title}` : `${i.days} 天後:${i.title}`, { body: i.sub })
  }
  // 只保留今天的 key,避免無限長大
  const t = today()
  localStorage.setItem(storageKey, JSON.stringify(
    [...sent.filter(k => k.endsWith(t)), ...fresh.map(i => i.key)],
  ))
}
