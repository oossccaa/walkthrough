import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getReminders, type ReminderItem } from '../notify'

/** 即將到來的提醒(N 天內的重要日子、今明兩天的行程)。全部 Dexie 查詢,資料變動會即時更新 */
export function useReminders(): ReminderItem[] {
  return useLiveQuery(getReminders, []) ?? []
}

/**
 * 到期提醒橫幅。
 * - 首頁:不傳 personId,顯示全部並附上是誰、可點進該人頁面
 * - 人物頁:傳 personId,只顯示跟這個人有關(或沒指定人)的提醒
 */
export function ReminderBanner({ personId }: { personId?: string }) {
  const all = useReminders()
  const items = personId ? all.filter(i => !i.personId || i.personId === personId) : all

  if (items.length === 0) return null

  return (
    <div className="rounded-2xl border border-accent-200 bg-accent-100/60 p-3">
      <p className="mb-1.5 text-xs font-bold text-accent-700">提醒</p>
      <ul className="space-y-1">
        {items.map(i => {
          const body = (
            <>
              <span className="min-w-0">
                <span className="font-medium text-neutral-700">{i.title}</span>
                {!personId && <span className="block text-xs text-neutral-500">{i.sub}</span>}
              </span>
              <span className="shrink-0 text-xs font-bold text-accent-700">
                {i.days === 0 ? '今天' : `${i.days} 天後`}
              </span>
            </>
          )
          return (
            <li key={i.key}>
              {!personId && i.personId ? (
                <Link to={`/person/${i.personId}`} className="flex items-baseline justify-between gap-3 py-0.5 text-sm">
                  {body}
                </Link>
              ) : (
                <div className="flex items-baseline justify-between gap-3 py-0.5 text-sm">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
