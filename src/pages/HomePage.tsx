import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROLE_LABEL, ROLE_STYLE, ROLE_ORDER } from '../labels'
import { useApp } from '../store'
import { THEMES, isThemeKey } from '../theme'
import { inputCls } from '../components/ui'
import { ReminderBanner, useReminders } from '../components/ReminderBanner'
import type { Person } from '../types'

// 人數少時一眼就看得完,不需要搜尋框
const SEARCH_MIN_PERSONS = 4

const matches = (p: Person, q: string) =>
  [p.name, p.nickname, p.company, p.jobTitle, p.notes].some(v => v?.toLowerCase().includes(q))

export function HomePage() {
  const { persons, ready, loadDemo } = useApp()
  const reminders = useReminders()
  const [query, setQuery] = useState('')

  if (!ready) return null

  const q = query.trim().toLowerCase()
  const shown = q ? persons.filter(p => matches(p, q)) : persons
  const groups = ROLE_ORDER
    .map(role => ({ role, list: shown.filter(p => p.role === role) }))
    .filter(g => g.list.length > 0)

  return (
    <div className="space-y-4 pb-20">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-neutral-800">Tiedto</h1>
          <p className="text-xs text-neutral-500">記下身邊每個人的喜好與大小事</p>
        </div>
        <Link
          to="/settings"
          className="-mr-2 flex h-9 items-center rounded-lg px-2 text-sm font-medium text-neutral-500 active:bg-neutral-100"
        >
          設定
        </Link>
      </header>

      <ReminderBanner />

      {persons.length >= SEARCH_MIN_PERSONS && (
        <div className="relative">
          <input
            type="search"
            className={`${inputCls} pr-10`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜尋名字、暱稱、公司、備註"
            aria-label="搜尋名冊"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="清除搜尋"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-neutral-500"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {q && shown.length === 0 && (
        <p className="py-6 text-center text-sm text-neutral-500">
          找不到符合「{query.trim()}」的人
          <button onClick={() => setQuery('')} className="ml-2 font-bold text-accent-600 underline">清除</button>
        </p>
      )}

      {persons.length === 0 && (
        <div className="rounded-2xl bg-paper p-6 shadow-sm border border-neutral-200/60 text-center">
          <p className="font-bold text-neutral-700">還沒有任何人</p>
          <p className="mt-1 text-xs text-neutral-500">新增第一個人,選好身份就能開始記錄。</p>
          <Link
            to="/person/new"
            className="mt-4 inline-block rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-bold text-white active:bg-accent-700"
          >
            ＋ 新增第一個人
          </Link>
          <br />
          <button onClick={loadDemo} className="mt-3 text-xs text-neutral-500 underline">
            先用示範資料看看畫面
          </button>
        </div>
      )}

      {groups.map(({ role, list }) => (
        <section key={role} className="space-y-2">
          <h2 className="px-1 text-xs font-bold text-neutral-500">
            {ROLE_LABEL[role]}({list.length})
          </h2>
          <div className="space-y-2">
            {list.map(p => {
              const next = reminders.find(r => r.personId === p.id)
              return (
              <Link
                key={p.id}
                to={`/person/${p.id}`}
                className="flex items-center gap-4 rounded-2xl bg-paper p-4 shadow-sm border border-neutral-200/60 active:bg-accent-50"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-400 text-lg font-black text-white"
                  style={isThemeKey(p.color) ? { backgroundColor: THEMES[p.color].shades[400] } : undefined}
                >
                  {p.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">{p.name}</span>
                    {p.nickname && <span className="text-xs text-neutral-400">{p.nickname}</span>}
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${ROLE_STYLE[p.role]}`}>
                      {ROLE_LABEL[p.role]}
                    </span>
                  </div>
                  {next && (
                    <p className="mt-0.5 truncate text-xs font-bold text-accent-700">
                      {next.days === 0 ? '今天' : `${next.days} 天後`}・{next.title}
                    </p>
                  )}
                  {p.notes && <p className="mt-0.5 truncate text-xs text-neutral-500">{p.notes}</p>}
                </div>
                <span className="text-neutral-400">›</span>
              </Link>
              )
            })}
          </div>
        </section>
      ))}

      {persons.length > 0 && (
        <Link
          to="/person/new"
          className="block w-full rounded-2xl border-2 border-dashed border-accent-300 py-3 text-center text-sm font-bold text-accent-600 active:bg-accent-50"
        >
          ＋ 新增一個人
        </Link>
      )}
    </div>
  )
}
