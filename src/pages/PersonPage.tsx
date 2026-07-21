import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ROLE_LABEL, ROLE_STYLE, ROLE_MODULES, type ModuleKey } from '../labels'
import { daysSince, fmt } from '../utils/dates'
import { useApp } from '../store'
import { db } from '../db/db'
import { getReminders, type ReminderItem } from '../notify'
import { applyPersonTheme, restoreGlobalTheme, isThemeKey } from '../theme'
import { QuickCard } from '../components/quickcard/QuickCard'
import { PreferencesTab } from '../components/preferences/PreferencesTab'
import { PlacesTab } from '../components/places/PlacesTab'
import { RelationsTab } from '../components/relations/RelationsTab'
import { GiftsTab } from '../components/gifts/GiftsTab'
import { AnniversariesTab } from '../components/anniversaries/AnniversariesTab'
import { PromisesTab } from '../components/promises/PromisesTab'

const TAB_LABEL: Record<ModuleKey, string> = {
  quick: '速查',
  preferences: '喜好',
  places: '地點',
  relations: '人物',
  gifts: '禮物',
  anniversaries: '紀念日',
  promises: '約定',
}

export function PersonPage() {
  const { id } = useParams()
  const { persons, ready } = useApp()
  const [tab, setTab] = useState<ModuleKey>('quick')
  const person = persons.find(p => p.id === id)

  const preferences = useLiveQuery(() => db.preferences.where('personId').equals(id!).toArray(), [id]) ?? []
  const places = useLiveQuery(() => db.places.where('personId').equals(id!).toArray(), [id]) ?? []
  const relations = useLiveQuery(() => db.relations.where('personId').equals(id!).toArray(), [id]) ?? []
  const gifts = useLiveQuery(() => db.gifts.where('personId').equals(id!).toArray(), [id]) ?? []
  const anniversaries = useLiveQuery(() => db.anniversaries.where('personId').equals(id!).toArray(), [id]) ?? []
  const promises = useLiveQuery(() => db.promises.where('personId').equals(id!).toArray(), [id]) ?? []
  const itineraries = useLiveQuery(() => db.itineraries.where('personId').equals(id!).toArray(), [id]) ?? []

  // 這一頁改用這個人的專屬色系,離開時還原全域主題
  const personColor = person && isThemeKey(person.color) ? person.color : null
  useEffect(() => {
    if (personColor) {
      applyPersonTheme(personColor)
      return restoreGlobalTheme
    }
  }, [personColor])

  if (!ready) return null

  if (!person) {
    return (
      <div className="py-20 text-center text-neutral-400">
        找不到這個人 <Link to="/" className="text-accent-600 underline">回名冊</Link>
      </div>
    )
  }

  const modules = ROLE_MODULES[person.role]
  const activeTab = modules.includes(tab) ? tab : 'quick'

  // 對象:若有「在一起」紀念日,顯示在一起天數
  const together = person.role === 'partner'
    ? anniversaries.find(a => a.title.includes('在一起'))
    : undefined

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <div className="mb-3 flex items-center justify-between">
          <Link to="/" className="text-sm text-neutral-400">‹ 名冊</Link>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="text-sm text-neutral-400">設定</Link>
            <Link to={`/person/${person.id}/edit`} className="text-sm font-medium text-accent-600">編輯</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-400 text-2xl font-black text-white">
            {person.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">{person.name}</h1>
              {person.nickname && <span className="text-sm text-neutral-400">{person.nickname}</span>}
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${ROLE_STYLE[person.role]}`}>
                {ROLE_LABEL[person.role]}
              </span>
            </div>
            <div className="mt-1 space-y-0.5 text-xs text-neutral-400">
              {together && (
                <p className="font-bold text-accent-600">在一起 {daysSince(together.date)} 天</p>
              )}
              {person.birthday && <p>生日 {fmt(person.birthday)}</p>}
              {person.metAt?.date && (
                <p>{fmt(person.metAt.date)} 認識{person.metAt.place && `於${person.metAt.place}`}</p>
              )}
            </div>
          </div>
        </div>
        {person.notes && (
          <p className="mt-3 rounded-xl bg-white border border-neutral-200/60 px-3 py-2 text-xs text-neutral-600">
            {person.notes}
          </p>
        )}
      </header>

      <ReminderBanner personId={person.id} />

      <nav className="sticky top-0 z-10 -mx-4 bg-accent-50/90 px-4 py-2 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto">
          {modules.map(m => (
            <button
              key={m}
              onClick={() => setTab(m)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeTab === m ? 'bg-accent-500 text-white' : 'bg-white text-neutral-500 border border-neutral-200'
              }`}
            >
              {TAB_LABEL[m]}
            </button>
          ))}
        </div>
      </nav>

      <div className="pb-24">
        {activeTab === 'quick' && (
          <QuickCard
            role={person.role}
            preferences={preferences}
            gifts={gifts}
            anniversaries={anniversaries}
            relations={relations}
            itineraries={itineraries}
          />
        )}
        {activeTab === 'preferences' && <PreferencesTab personId={person.id} items={preferences} />}
        {activeTab === 'places' && <PlacesTab personId={person.id} items={places} />}
        {activeTab === 'relations' && <RelationsTab personId={person.id} items={relations} />}
        {activeTab === 'gifts' && <GiftsTab personId={person.id} items={gifts} />}
        {activeTab === 'anniversaries' && <AnniversariesTab personId={person.id} items={anniversaries} />}
        {activeTab === 'promises' && <PromisesTab personId={person.id} items={promises} />}
      </div>
    </div>
  )
}

/** 到期提醒橫幅:N 天內的紀念日、今明兩天的行程 */
function ReminderBanner({ personId }: { personId: string }) {
  const [items, setItems] = useState<ReminderItem[]>([])

  useEffect(() => {
    let alive = true
    getReminders().then(all => {
      if (alive) setItems(all.filter(i => !i.personId || i.personId === personId))
    })
    return () => { alive = false }
  }, [personId])

  if (items.length === 0) return null

  return (
    <div className="rounded-2xl border border-accent-200 bg-accent-100/60 p-3">
      <p className="mb-1.5 text-xs font-bold text-accent-700">提醒</p>
      <ul className="space-y-1">
        {items.map(i => (
          <li key={i.key} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 font-medium text-neutral-700">{i.title}</span>
            <span className="shrink-0 text-xs font-bold text-accent-700">
              {i.days === 0 ? '今天' : `${i.days} 天後`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
