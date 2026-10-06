import { useState } from 'react'
import { useMatch } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { BottomSheet, Chip, EmptyState, Field, inputCls, PrimaryButton, DeleteButton, useDirty } from '../ui'
import { useToast } from '../toast'
import { fmt } from '../../utils/dates'
import { db } from '../../db/db'
import { itinerariesRepo, nowIso, today } from '../../db/repo'
import { useApp } from '../../store'
import type { Itinerary, ItineraryStop, ItineraryTimeType } from '../../types'

// ---- 右下角圓形浮動按鈕 ----

export function ItineraryFab() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mode, setMode] = useState<'none' | 'view' | 'add'>('none')
  const [editing, setEditing] = useState<Itinerary | null>(null)
  const { persons } = useApp()

  // 在某人的主頁開啟時,新增行程預設帶入這個人
  const personMatch = useMatch('/person/:id')
  const currentPersonId = persons.some(p => p.id === personMatch?.params.id) ? personMatch?.params.id : undefined

  // 表單頁不顯示,避免蓋住底部的儲存/刪除按鈕
  const onNewForm = useMatch('/person/new')
  const onEditForm = useMatch('/person/:id/edit')
  if (onNewForm || onEditForm) return null

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        {menuOpen && (
          <>
            <button
              onClick={() => { setMode('view'); setMenuOpen(false) }}
              className="rounded-xl bg-paper px-4 py-2.5 text-sm font-bold text-neutral-700 shadow-lg border border-neutral-100"
            >
              觀看行程
            </button>
            <button
              onClick={() => { setMode('add'); setMenuOpen(false) }}
              className="rounded-xl bg-paper px-4 py-2.5 text-sm font-bold text-neutral-700 shadow-lg border border-neutral-100"
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

      <ViewItinerarySheet
        open={mode === 'view' && !editing}
        onClose={() => setMode('none')}
        onEdit={setEditing}
      />
      {mode === 'add' && <ItinerarySheet defaultPersonId={currentPersonId} onClose={() => setMode('none')} />}
      {editing && <ItinerarySheet existing={editing} onClose={() => setEditing(null)} />}
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

function ViewItinerarySheet({ open, onClose, onEdit }: {
  open: boolean
  onClose: () => void
  onEdit: (it: Itinerary) => void
}) {
  const itineraries = useLiveQuery(() => db.itineraries.toArray(), []) ?? []
  const { persons } = useApp()
  const personName = (id?: string) => persons.find(p => p.id === id)?.name
  const t = today()
  const upcoming = itineraries.filter(i => i.date >= t).sort((a, b) => a.date.localeCompare(b.date))
  const past = itineraries.filter(i => i.date < t).sort((a, b) => b.date.localeCompare(a.date))

  const renderList = (list: Itinerary[]) =>
    list.map(it => (
      <button
        key={it.id}
        onClick={() => onEdit(it)}
        className="block w-full rounded-2xl border border-neutral-200/60 bg-paper p-3 text-left active:bg-accent-50"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="font-bold">{fmt(it.date)}</span>
          {personName(it.personId) && (
            <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-bold text-accent-700">
              與 {personName(it.personId)}
            </span>
          )}
          <span className="ml-auto text-xs font-medium text-accent-600">編輯 ›</span>
        </div>
        <ItineraryTimeline stops={it.stops} />
      </button>
    ))

  return (
    <BottomSheet open={open} onClose={onClose} title="行程" subtitle="點一下行程可以編輯或刪除">
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

// ---- 新增 / 編輯行程 ----

interface DraftStop {
  place: string
  timeType: ItineraryTimeType
  startTime: string
  endTime: string
  note: string
}

const emptyStop = (): DraftStop => ({ place: '', timeType: 'range', startTime: '', endTime: '', note: '' })

const toDraft = (s: ItineraryStop): DraftStop => ({
  place: s.place,
  timeType: s.timeType,
  startTime: s.startTime ?? '',
  endTime: s.endTime ?? '',
  note: s.note ?? '',
})

function ItinerarySheet({ existing, defaultPersonId, onClose }: {
  existing?: Itinerary
  defaultPersonId?: string
  onClose: () => void
}) {
  const { persons } = useApp()
  const toast = useToast()
  const [date, setDate] = useState(existing?.date ?? '')
  const [personId, setPersonId] = useState<string | undefined>(existing ? existing.personId : defaultPersonId)
  const [stops, setStops] = useState<DraftStop[]>(existing ? existing.stops.map(toDraft) : [emptyStop()])
  const [tried, setTried] = useState(false)
  const dirty = useDirty([date, personId, stops])
  const hasStop = stops.some(s => s.place.trim())

  const updateStop = (i: number, patch: Partial<DraftStop>) =>
    setStops(prev => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const submit = async () => {
    const validStops = stops.filter(s => s.place.trim())
    if (!date || validStops.length === 0) return setTried(true)
    const now = nowIso()
    const data = {
      // 名冊只有一個人時,行程自動掛在這個人身上
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
      updatedAt: now,
    }
    if (existing) await itinerariesRepo.update(existing.id, data)
    else await itinerariesRepo.add({ ...data, createdAt: now })
    toast(existing ? '行程已儲存' : '行程已新增')
    onClose()
  }

  return (
    <BottomSheet open onClose={onClose} dirty={dirty} title={existing ? '編輯行程' : '新增行程'}>
      <div className="space-y-4">
        <Field label="日期" required error={tried && !date ? '請選擇日期' : undefined}>
          <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
        </Field>

        {persons.length > 1 && (
          <Field label="和誰(選填)">
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
                <span className="text-xs font-bold text-neutral-500">行程點 {i + 1}</span>
                {stops.length > 1 && (
                  <button
                    className="text-xs text-neutral-500 underline"
                    onClick={() => setStops(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    移除
                  </button>
                )}
              </div>
              <Field
                label="地點"
                required={i === 0}
                error={i === 0 && tried && !hasStop ? '至少要填一個地點' : undefined}
              >
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
        {existing && (
          <DeleteButton
            label="刪除這份行程"
            onDelete={async () => {
              const undo = await itinerariesRepo.remove(existing.id)
              onClose()
              toast('已刪除行程', { action: { label: '復原', onClick: undo } })
            }}
          />
        )}
      </div>
    </BottomSheet>
  )
}
