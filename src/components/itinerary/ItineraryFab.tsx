import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BottomSheet, Chip, EmptyState, Field, inputCls, PrimaryButton } from '../ui'
import { fmt } from '../../utils/dates'
import { db } from '../../db/db'
import { itinerariesRepo, nowIso, today } from '../../db/repo'
import { useApp } from '../../store'
import type { Itinerary, ItineraryStop, ItineraryTimeType } from '../../types'

// ---- 右下角圓形浮動按鈕 ----

export function ItineraryFab() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mode, setMode] = useState<'none' | 'view' | 'add'>('none')

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        {menuOpen && (
          <>
            <button
              onClick={() => { setMode('view'); setMenuOpen(false) }}
              className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 shadow-lg border border-neutral-100"
            >
              觀看行程
            </button>
            <button
              onClick={() => { setMode('add'); setMenuOpen(false) }}
              className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 shadow-lg border border-neutral-100"
            >
              新增行程
            </button>
          </>
        )}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-2xl text-white shadow-xl shadow-accent-300/60 transition-transform active:scale-95 ${menuOpen ? 'rotate-45' : ''}`}
          aria-label="行程"
        >
          ＋
        </button>
      </div>

      <ViewItinerarySheet open={mode === 'view'} onClose={() => setMode('none')} />
      {mode === 'add' && <AddItinerarySheet onClose={() => setMode('none')} />}
    </>
  )
}

// ---- 行程時間軸(觀看行程與對象主頁共用) ----

export function stopTimeLabel(s: ItineraryStop) {
  if (s.timeType === 'fixed') return s.startTime ?? ''
  return [s.startTime, s.endTime].filter(Boolean).join(' – ')
}

export function ItineraryTimeline({ stops }: { stops: ItineraryStop[] }) {
  return (
    <ol className="relative ml-2 space-y-3 border-l-2 border-accent-200 pl-4">
      {stops.map(s => (
        <li key={s.id} className="relative">
          <span className="absolute -left-5.25 top-1.5 h-2.5 w-2.5 rounded-full bg-accent-400" />
          <div className="text-xs font-bold text-accent-600">{stopTimeLabel(s)}</div>
          <div className="font-medium">{s.place}</div>
          {s.note && <div className="text-xs text-neutral-500">{s.note}</div>}
        </li>
      ))}
    </ol>
  )
}

// ---- 觀看行程 ----

function ViewItinerarySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const itineraries = useLiveQuery(() => db.itineraries.toArray(), []) ?? []
  const { persons } = useApp()
  const personName = (id?: string) => persons.find(p => p.id === id)?.name
  const t = today()
  const upcoming = itineraries.filter(i => i.date >= t).sort((a, b) => a.date.localeCompare(b.date))
  const past = itineraries.filter(i => i.date < t).sort((a, b) => b.date.localeCompare(a.date))

  const renderList = (list: Itinerary[]) =>
    list.map(it => (
      <div key={it.id} className="rounded-2xl border border-neutral-200/60 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-bold">{fmt(it.date)}</span>
          {personName(it.personId) && (
            <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-bold text-accent-700">
              與 {personName(it.personId)}
            </span>
          )}
          <button
            onClick={() => { if (confirm('刪除這份行程?')) itinerariesRepo.remove(it.id) }}
            className="ml-auto text-xs text-neutral-400 underline"
          >
            刪除
          </button>
        </div>
        <ItineraryTimeline stops={it.stops} />
      </div>
    ))

  return (
    <BottomSheet open={open} onClose={onClose} title="行程">
      <div className="space-y-3">
        {itineraries.length === 0 && <EmptyState text="還沒有行程,先去新增一個吧" />}
        {upcoming.length > 0 && (
          <>
            <p className="text-xs font-bold text-neutral-400">即將到來</p>
            {renderList(upcoming)}
          </>
        )}
        {past.length > 0 && (
          <>
            <p className="pt-1 text-xs font-bold text-neutral-400">過去的行程</p>
            <div className="space-y-3 opacity-60">{renderList(past)}</div>
          </>
        )}
      </div>
    </BottomSheet>
  )
}

// ---- 新增行程 ----

interface DraftStop {
  place: string
  timeType: ItineraryTimeType
  startTime: string
  endTime: string
  note: string
}

const emptyStop = (): DraftStop => ({ place: '', timeType: 'range', startTime: '', endTime: '', note: '' })

function AddItinerarySheet({ onClose }: { onClose: () => void }) {
  const { persons } = useApp()
  const [date, setDate] = useState('')
  const [personId, setPersonId] = useState<string | undefined>(undefined)
  const [stops, setStops] = useState<DraftStop[]>([emptyStop()])

  const updateStop = (i: number, patch: Partial<DraftStop>) =>
    setStops(prev => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const submit = async () => {
    const validStops = stops.filter(s => s.place.trim())
    if (!date || validStops.length === 0) return
    const now = nowIso()
    await itinerariesRepo.add({
      // 單一對象模式下,行程自動掛在唯一的對象上
      personId: personId ?? (persons.length === 1 ? persons[0].id : undefined),
      date,
      stops: validStops.map((s, i) => ({
        id: `${Date.now()}-${i}`,
        place: s.place.trim(),
        timeType: s.timeType,
        startTime: s.startTime || undefined,
        endTime: s.timeType === 'range' ? s.endTime || undefined : undefined,
        note: s.note.trim() || undefined,
      })),
      createdAt: now,
      updatedAt: now,
    })
    onClose()
  }

  return (
    <BottomSheet open onClose={onClose} title="新增行程">
      <div className="space-y-4">
        <Field label="日期">
          <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
        </Field>

        {persons.length > 1 && (
          <Field label="對象">
            <div className="flex flex-wrap gap-2">
              {persons.map(p => (
                <Chip key={p.id} selected={personId === p.id} onClick={() => setPersonId(p.id)}>
                  {p.name}
                </Chip>
              ))}
              <Chip selected={personId === undefined} onClick={() => setPersonId(undefined)}>不指定</Chip>
            </div>
          </Field>
        )}

        <div className="space-y-3">
          {stops.map((s, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400">行程點 {i + 1}</span>
                {stops.length > 1 && (
                  <button
                    className="text-xs text-neutral-400 underline"
                    onClick={() => setStops(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    移除
                  </button>
                )}
              </div>
              <Field label="地點">
                <input
                  className={inputCls}
                  value={s.place}
                  onChange={e => updateStop(i, { place: e.target.value })}
                  placeholder="例:大稻埕碼頭"
                />
              </Field>
              <Field label="時間">
                <div className="mb-2 flex gap-2">
                  <Chip selected={s.timeType === 'range'} onClick={() => updateStop(i, { timeType: 'range' })}>時間區間</Chip>
                  <Chip selected={s.timeType === 'fixed'} onClick={() => updateStop(i, { timeType: 'fixed' })}>固定時間</Chip>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    className={inputCls}
                    value={s.startTime}
                    onChange={e => updateStop(i, { startTime: e.target.value })}
                  />
                  {s.timeType === 'range' && (
                    <>
                      <span className="text-neutral-400">–</span>
                      <input
                        type="time"
                        className={inputCls}
                        value={s.endTime}
                        onChange={e => updateStop(i, { endTime: e.target.value })}
                      />
                    </>
                  )}
                </div>
              </Field>
              <Field label="備註(選填)">
                <input
                  className={inputCls}
                  value={s.note}
                  onChange={e => updateStop(i, { note: e.target.value })}
                  placeholder="例:訂位 2 位,靠窗"
                />
              </Field>
            </div>
          ))}
          <button
            onClick={() => setStops(prev => [...prev, emptyStop()])}
            className="w-full rounded-2xl border-2 border-dashed border-accent-200 py-2.5 text-sm font-medium text-accent-500 active:bg-accent-50"
          >
            ＋ 新增行程點
          </button>
        </div>

        <PrimaryButton onClick={submit}>儲存行程</PrimaryButton>
      </div>
    </BottomSheet>
  )
}
