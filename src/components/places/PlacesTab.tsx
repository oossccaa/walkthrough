import { useState } from 'react'
import { SectionCard, EmptyState, AddButton, BottomSheet, Chip, Field, inputCls, PrimaryButton, DeleteButton } from '../ui'
import { PLACE_TYPE_LABEL } from '../../labels'
import { fmt } from '../../utils/dates'
import { placesRepo, today } from '../../db/repo'
import type { Place, PlaceType } from '../../types'

const TYPES = Object.keys(PLACE_TYPE_LABEL) as PlaceType[]
const ORDER: PlaceType[] = ['she_wants_to_go', 'promised_together', 'visited']

export function PlacesTab({ personId, items }: { personId: string; items: Place[] }) {
  const [editing, setEditing] = useState<Place | 'new' | null>(null)

  return (
    <div className="space-y-3">
      {ORDER.map(type => {
        const list = items.filter(p => p.type === type)
        return (
          <SectionCard key={type} title={PLACE_TYPE_LABEL[type]}>
            {list.length === 0 ? (
              <EmptyState text="還沒有紀錄" />
            ) : (
              <ul className="divide-y divide-neutral-100">
                {list.map(p => (
                  <li key={p.id} className="flex items-center gap-2 py-2.5 first:pt-0 last:pb-0">
                    {type === 'promised_together' && (
                      <button
                        aria-label={p.completed ? '取消完成' : '標記完成'}
                        onClick={() =>
                          placesRepo.update(p.id, p.completed
                            ? { completed: false, completedDate: undefined }
                            : { completed: true, completedDate: today() })
                        }
                        className={`h-5 w-5 shrink-0 rounded border ${
                          p.completed ? 'border-accent-500 bg-accent-500' : 'border-neutral-300'
                        }`}
                      />
                    )}
                    <button onClick={() => setEditing(p)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${p.completed ? 'text-neutral-400' : ''}`}>{p.name}</span>
                        {p.completed && p.completedDate && (
                          <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-bold text-accent-700">
                            {fmt(p.completedDate)} 達成
                          </span>
                        )}
                        {p.date && <span className="text-xs text-neutral-400">{fmt(p.date)}</span>}
                      </div>
                      {p.note && <p className="mt-0.5 text-xs text-neutral-500">{p.note}</p>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        )
      })}
      <AddButton label="新增地點" onClick={() => setEditing('new')} />

      {editing && (
        <PlaceSheet personId={personId} existing={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

function PlaceSheet({ personId, existing, onClose }: {
  personId: string
  existing: Place | null
  onClose: () => void
}) {
  const [type, setType] = useState<PlaceType>(existing?.type ?? 'she_wants_to_go')
  const [name, setName] = useState(existing?.name ?? '')
  const [date, setDate] = useState(existing?.date ?? '')
  const [note, setNote] = useState(existing?.note ?? '')

  const submit = async () => {
    if (!name.trim()) return
    const patch = { type, name: name.trim(), date: date || undefined, note: note.trim() || undefined }
    if (existing) await placesRepo.update(existing.id, patch)
    else await placesRepo.add({ ...patch, personId })
    onClose()
  }

  return (
    <BottomSheet open onClose={onClose} title={existing ? '編輯地點' : '新增地點'}>
      <div className="space-y-4">
        <Field label="類型">
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <Chip key={t} selected={type === t} onClick={() => setType(t)}>{PLACE_TYPE_LABEL[t]}</Chip>
            ))}
          </div>
        </Field>
        <Field label="地點名稱">
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="例:嵐山竹林" />
        </Field>
        {type === 'visited' && (
          <Field label="去過的日期(選填)">
            <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
          </Field>
        )}
        <Field label="備註(選填)">
          <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="例:夜景很美,晚上去更好" />
        </Field>
        <PrimaryButton onClick={submit}>{existing ? '儲存' : '新增'}</PrimaryButton>
        {existing && (
          <DeleteButton onConfirm={async () => { await placesRepo.remove(existing.id); onClose() }} />
        )}
      </div>
    </BottomSheet>
  )
}
