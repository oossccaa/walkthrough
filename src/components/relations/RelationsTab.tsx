import { useState } from 'react'
import { SectionCard, EmptyState, AddButton, BottomSheet, Chip, Field, inputCls, PrimaryButton, DeleteButton } from '../ui'
import { RELATION_TYPE_LABEL, ROLE_RELATION_TYPES } from '../../labels'
import { fmt, durationLabel } from '../../utils/dates'
import { relationsRepo } from '../../db/repo'
import type { RelationPerson, RelationType, PersonRole } from '../../types'

export function RelationsTab({ personId, role, items }: {
  personId: string
  role: PersonRole
  items: RelationPerson[]
}) {
  const [editing, setEditing] = useState<RelationPerson | 'new' | null>(null)
  const types = ROLE_RELATION_TYPES[role]

  return (
    <div className="space-y-3">
      {types.map((type, idx) => {
        const list = items.filter(r => r.type === type)
        // 第一個區塊永遠顯示(含空狀態),其餘有資料才顯示
        if (list.length === 0 && idx !== 0) return null
        return (
          <SectionCard key={type} title={RELATION_TYPE_LABEL[type]}>
            {list.length === 0 ? (
              <EmptyState text="還沒有紀錄" />
            ) : (
              <ul className="divide-y divide-neutral-100">
                {list.map(r => (
                  <li key={r.id}>
                    <button onClick={() => setEditing(r)} className="w-full py-2.5 text-left first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{r.name}</span>
                        {r.role && (
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">{r.role}</span>
                        )}
                        {type === 'ex' && r.datingStart && r.datingEnd && (
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-600">
                            交往 {durationLabel(r.datingStart, r.datingEnd)}
                          </span>
                        )}
                      </div>
                      {type === 'ex' && r.datingStart && r.datingEnd && (
                        <p className="text-xs text-neutral-400">{fmt(r.datingStart)} ~ {fmt(r.datingEnd)}</p>
                      )}
                      {r.traits && <p className="mt-0.5 text-xs text-neutral-500">{r.traits}</p>}
                      {r.note && <p className="mt-0.5 text-xs font-medium text-red-600">{r.note}</p>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        )
      })}
      <AddButton label="新增人物" onClick={() => setEditing('new')} />

      {editing && (
        <RelationSheet
          personId={personId}
          allowedTypes={types}
          existing={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function RelationSheet({ personId, allowedTypes, existing, onClose }: {
  personId: string
  allowedTypes: RelationType[]
  existing: RelationPerson | null
  onClose: () => void
}) {
  const [type, setType] = useState<RelationType>(existing?.type ?? allowedTypes[0])
  const [name, setName] = useState(existing?.name ?? '')
  const [role, setRole] = useState(existing?.role ?? '')
  const [traits, setTraits] = useState(existing?.traits ?? '')
  const [note, setNote] = useState(existing?.note ?? '')
  const [datingStart, setDatingStart] = useState(existing?.datingStart ?? '')
  const [datingEnd, setDatingEnd] = useState(existing?.datingEnd ?? '')

  const isWork = type === 'work'

  const submit = async () => {
    if (!name.trim()) return
    const patch = {
      type,
      name: name.trim(),
      role: role.trim() || undefined,
      traits: traits.trim() || undefined,
      note: note.trim() || undefined,
      datingStart: type === 'ex' ? datingStart || undefined : undefined,
      datingEnd: type === 'ex' ? datingEnd || undefined : undefined,
    }
    if (existing) await relationsRepo.update(existing.id, patch)
    else await relationsRepo.add({ ...patch, personId })
    onClose()
  }

  return (
    <BottomSheet open onClose={onClose} title={existing ? '編輯人物' : '新增人物'}>
      <div className="space-y-4">
        <Field label="關係">
          <div className="flex flex-wrap gap-2">
            {allowedTypes.map(t => (
              <Chip key={t} selected={type === t} onClick={() => setType(t)}>{RELATION_TYPE_LABEL[t]}</Chip>
            ))}
          </div>
        </Field>
        <Field label="名字">
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder={isWork ? '例:Amy' : '例:Peggy'} />
        </Field>
        <Field label="身分(選填)">
          <input
            className={inputCls}
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder={isWork ? '例:特助、採購窗口、決策者' : '例:媽媽、閨蜜、大學同學'}
          />
        </Field>
        {type === 'ex' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="交往開始">
              <input type="date" className={inputCls} value={datingStart} onChange={e => setDatingStart(e.target.value)} />
            </Field>
            <Field label="交往結束">
              <input type="date" className={inputCls} value={datingEnd} onChange={e => setDatingEnd(e.target.value)} />
            </Field>
          </div>
        )}
        <Field label="特徵備註(選填,見面前速查用)">
          <input
            className={inputCls}
            value={traits}
            onChange={e => setTraits(e.target.value)}
            placeholder={isWork ? '例:行程都找他排、提案先過他這關' : '例:很重視禮貌,見面要帶伴手禮'}
          />
        </Field>
        <Field label="地雷/注意事項(選填,會以紅字顯示)">
          <input
            className={inputCls}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={isWork ? '例:別在他面前提競品' : '例:別提登山社'}
          />
        </Field>
        <PrimaryButton onClick={submit}>{existing ? '儲存' : '新增'}</PrimaryButton>
        {existing && (
          <DeleteButton onConfirm={async () => { await relationsRepo.remove(existing.id); onClose() }} />
        )}
      </div>
    </BottomSheet>
  )
}
