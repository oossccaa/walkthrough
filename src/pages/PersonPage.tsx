import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { STATUS_LABEL, STATUS_STYLE } from '../labels'
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

const TABS = [
  { key: 'quick', label: '速查' },
  { key: 'preferences', label: '喜好' },
  { key: 'places', label: '地點' },
  { key: 'relations', label: '人物' },
  { key: 'gifts', label: '禮物' },
  { key: 'anniversaries', label: '紀念日' },
  { key: 'promises', label: '約定' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function PersonPage() {
  const { id } = useParams()
  const { persons, multiMode, ready } = useApp()
  const [tab, setTab] = useState<TabKey>('quick')
  const person = persons.find(p => p.id === id)

  const preferences = useLiveQuery(() => db.preferences.where('personId').equals(id!).toArray(), [id]) ?? []
  const places = useLiveQuery(() => db.places.where('personId').equals(id!).toArray(), [id]) ?? []
  const relations = useLiveQuery(() => db.relations.where('personId').equals(id!).toArray(), [id]) ?? []
  const gifts = useLiveQuery(() => db.gifts.where('personId').equals(id!).toArray(), [id]) ?? []
  const anniversaries = useLiveQuery(() => db.anniversaries.where('personId').equals(id!).toArray(), [id]) ?? []
  const promises = useLiveQuery(() => db.promises.where('personId').equals(id!).toArray(), [id]) ?? []
  const itineraries = useLiveQuery(() => db.itineraries.where('personId').equals(id!).toArray(), [id]) ?? []

  // 多對象模式:這一頁改用她的專屬色系,離開時還原全域主題
  const personColor = multiMode && person && isThemeKey(person.color) ? person.color : null
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
        找不到這位對象 <Link to="/" className="text-accent-600 underline">回首頁</Link>
      </div>
    )
  }

  const datingEntry = [...person.statusHistory].reverse().find(h => h.status === 'dating')

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <div className="mb-3 flex items-center justify-between">
          {multiMode ? (
            <Link to="/" className="text-sm text-neutral-400">‹ 返回</Link>
          ) : (
            <span className="text-sm font-bold text-neutral-400">戀愛攻略筆記</span>
          )}
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
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[person.status]}`}>
                {STATUS_LABEL[person.status]}
              </span>
            </div>
            <div className="mt-1 space-y-0.5 text-xs text-neutral-400">
              {person.status === 'dating' && datingEntry && (
                <p className="font-bold text-accent-600">在一起 {daysSince(datingEntry.date)} 天</p>
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
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-accent-500 text-white' : 'bg-white text-neutral-500 border border-neutral-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="pb-24">
        {tab === 'quick' && (
          <QuickCard
            preferences={preferences}
            gifts={gifts}
            anniversaries={anniversaries}
            relations={relations}
            itineraries={itineraries}
          />
        )}
        {tab === 'preferences' && <PreferencesTab personId={person.id} items={preferences} />}
        {tab === 'places' && <PlacesTab personId={person.id} items={places} />}
        {tab === 'relations' && <RelationsTab personId={person.id} items={relations} />}
        {tab === 'gifts' && <GiftsTab personId={person.id} items={gifts} />}
        {tab === 'anniversaries' && <AnniversariesTab personId={person.id} items={anniversaries} />}
        {tab === 'promises' && <PromisesTab personId={person.id} items={promises} />}
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
