import { Link } from 'react-router-dom'
import { ROLE_LABEL, ROLE_STYLE, ROLE_ORDER } from '../labels'
import { useApp } from '../store'
import { THEMES, isThemeKey } from '../theme'

export function HomePage() {
  const { persons, ready, loadDemo } = useApp()

  if (!ready) return null

  const groups = ROLE_ORDER
    .map(role => ({ role, list: persons.filter(p => p.role === role) }))
    .filter(g => g.list.length > 0)

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-neutral-800">Tiedto</h1>
          <p className="text-xs text-neutral-400">記下身邊每個人的喜好與大小事</p>
        </div>
        <Link to="/settings" className="text-sm text-neutral-400">設定</Link>
      </header>

      {persons.length === 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-200/60 text-center">
          <p className="font-bold text-neutral-700">還沒有任何人</p>
          <p className="mt-1 text-xs text-neutral-400">新增第一個人,選好身份就能開始記錄。</p>
          <button onClick={loadDemo} className="mt-4 text-xs text-neutral-400 underline">
            先用示範資料看看畫面
          </button>
        </div>
      )}

      {groups.map(({ role, list }) => (
        <section key={role} className="space-y-2">
          <h2 className="px-1 text-xs font-bold text-neutral-400">
            {ROLE_LABEL[role]}({list.length})
          </h2>
          <div className="space-y-2">
            {list.map(p => (
              <Link
                key={p.id}
                to={`/person/${p.id}`}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-neutral-200/60 active:bg-accent-50"
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
                  {p.notes && <p className="mt-0.5 truncate text-xs text-neutral-400">{p.notes}</p>}
                </div>
                <span className="text-neutral-300">›</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <Link
        to="/person/new"
        className="block w-full rounded-2xl border-2 border-dashed border-accent-200 py-3 text-center text-sm font-medium text-accent-500 active:bg-accent-50"
      >
        ＋ 新增
      </Link>
    </div>
  )
}
