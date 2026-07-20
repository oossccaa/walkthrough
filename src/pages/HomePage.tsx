import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { STATUS_LABEL, STATUS_STYLE } from '../labels'
import { daysSince } from '../utils/dates'
import { useApp } from '../store'
import { inputCls, PrimaryButton } from '../components/ui'
import { THEMES, isThemeKey } from '../theme'
import type { Person } from '../types'

function datingDays(p: Person): number | null {
  if (p.status !== 'dating') return null
  const entry = [...p.statusHistory].reverse().find(h => h.status === 'dating')
  return entry ? daysSince(entry.date) : null
}

export function HomePage() {
  const { persons, multiMode, ready, primaryId } = useApp()
  const active = persons.filter(p => p.status !== 'archived')

  if (!ready) return null

  // 第一次使用:先填她的名字
  if (persons.length === 0) return <Onboarding />

  // 預設單一對象:首頁直接進「主要對象」的主頁
  if (!multiMode) {
    const primary = persons.find(p => p.id === primaryId) ?? active[0] ?? persons[0]
    return <Navigate to={`/person/${primary.id}`} replace />
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-neutral-800">戀愛攻略筆記</h1>
          <p className="text-xs text-neutral-400">約會前 30 秒,不忘記她說過的話</p>
        </div>
        <Link to="/settings" className="text-sm text-neutral-400">設定</Link>
      </header>

      <div className="space-y-3">
        {active.map(p => {
          const days = datingDays(p)
          return (
            <Link
              key={p.id}
              to={`/person/${p.id}`}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-neutral-200/60 active:bg-accent-50"
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-400 text-xl font-black text-white"
                style={isThemeKey(p.color) ? { backgroundColor: THEMES[p.color].shades[400] } : undefined}
              >
                {p.name.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold">{p.name}</span>
                  {p.nickname && <span className="text-xs text-neutral-400">{p.nickname}</span>}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                  {days != null && (
                    <span className="text-xs font-bold text-accent-600">在一起 {days} 天</span>
                  )}
                </div>
              </div>
              <span className="text-neutral-300">›</span>
            </Link>
          )
        })}

        <Link
          to="/person/new"
          className="block w-full rounded-2xl border-2 border-dashed border-accent-200 py-3 text-center text-sm font-medium text-accent-500 active:bg-accent-50"
        >
          ＋ 新增對象
        </Link>
      </div>
    </div>
  )
}

function Onboarding() {
  const { addPerson, loadDemo } = useApp()
  const [name, setName] = useState('')

  return (
    <div className="flex min-h-dvh flex-col justify-center pb-24">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-neutral-200/60">
        <h1 className="text-2xl font-black text-neutral-800">戀愛攻略筆記</h1>
        <p className="mt-1 text-sm text-neutral-400">記下她說過的每句話,約會前 30 秒速查。</p>

        <div className="mt-8 space-y-3">
          <label className="block text-sm font-bold text-neutral-700">她叫什麼名字?</label>
          <input
            className={inputCls}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="輸入她的名字或暱稱"
            autoFocus
          />
          <PrimaryButton onClick={() => name.trim() && addPerson(name)}>開始記錄</PrimaryButton>
        </div>

        <button onClick={loadDemo} className="mt-4 w-full text-center text-xs text-neutral-400 underline">
          先用示範資料看看畫面
        </button>
      </div>
      <p className="mt-6 text-center text-[11px] text-neutral-400">
        資料只存在你的手機,不上傳、不需帳號。
      </p>
    </div>
  )
}
