import { useState } from 'react'
import { SectionCard, EmptyState, AddButton, BottomSheet, Field, inputCls, PrimaryButton, DeleteButton } from '../ui'
import { fmt } from '../../utils/dates'
import { promisesRepo, today } from '../../db/repo'
import type { PromiseItem, PersonRole } from '../../types'

export function PromisesTab({ personId, role, items }: { personId: string; role: PersonRole; items: PromiseItem[] }) {
  const [editing, setEditing] = useState<PromiseItem | 'new' | null>(null)
  const isPartner = role === 'partner'
  const word = isPartner ? '約定' : '承諾'
  const todo = items.filter(p => !p.completed)
  const done = items.filter(p => p.completed)

  const toggle = (p: PromiseItem) =>
    promisesRepo.update(p.id, p.completed
      ? { completed: false, completedDate: undefined }
      : { completed: true, completedDate: today() })

  return (
    <div className="space-y-3">
      <SectionCard
        title={isPartner ? '我們的約定' : '承諾事項'}
        subtitle={isPartner ? '以後要一起做的事' : '答應對方要做的事'}
      >
        {todo.length === 0 ? (
          <EmptyState text={`還沒有${word}`} />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {todo.map(p => (
              <li key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <button
                  aria-label="標記完成"
                  onClick={() => toggle(p)}
                  className="h-5 w-5 shrink-0 rounded border border-neutral-300"
                />
                <button onClick={() => setEditing(p)} className="min-w-0 flex-1 text-left">
                  <span className="font-medium">{p.content}</span>
                  {p.note && <p className="text-xs text-neutral-500">{p.note}</p>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title={isPartner ? '已完成的回憶' : '已完成'}>
        {done.length === 0 ? (
          <EmptyState text={`完成的${word}會收在這裡`} />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {done.map(p => (
              <li key={p.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <button
                    aria-label="取消完成"
                    onClick={() => toggle(p)}
                    className="h-5 w-5 shrink-0 rounded border border-accent-500 bg-accent-500"
                  />
                  <button onClick={() => setEditing(p)} className="min-w-0 flex-1 text-left">
                    <span className="font-medium text-neutral-400 line-through decoration-neutral-300">{p.content}</span>
                    <p className="text-xs text-neutral-400">
                      {fmt(p.completedDate)} 達成
                      {p.note && ` ・ ${p.note}`}
                    </p>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <AddButton label={`新增${word}`} onClick={() => setEditing('new')} />

      {editing && (
        <PromiseSheet
          personId={personId}
          word={word}
          isPartner={isPartner}
          existing={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function PromiseSheet({ personId, word, isPartner, existing, onClose }: {
  personId: string
  word: string
  isPartner: boolean
  existing: PromiseItem | null
  onClose: () => void
}) {
  const [content, setContent] = useState(existing?.content ?? '')
  const [note, setNote] = useState(existing?.note ?? '')

  const submit = async () => {
    if (!content.trim()) return
    const patch = { content: content.trim(), note: note.trim() || undefined }
    if (existing) await promisesRepo.update(existing.id, patch)
    else await promisesRepo.add({ ...patch, personId, completed: false })
    onClose()
  }

  return (
    <BottomSheet open onClose={onClose} title={existing ? `編輯${word}` : `新增${word}`}>
      <div className="space-y-4">
        <Field label={`${word}內容`}>
          <input
            className={inputCls}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={isPartner ? '例:一起去日本跨年' : '例:下次拜訪帶新品報價'}
          />
        </Field>
        <Field label="備註(選填)">
          <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} />
        </Field>
        <PrimaryButton onClick={submit}>{existing ? '儲存' : '新增'}</PrimaryButton>
        {existing && (
          <DeleteButton onConfirm={async () => { await promisesRepo.remove(existing.id); onClose() }} />
        )}
      </div>
    </BottomSheet>
  )
}
