import { useState } from 'react'
import { SectionCard, EmptyState, AddButton, BottomSheet, Field, inputCls, PrimaryButton, DeleteButton, CheckButton, useDirty } from '../ui'
import { useToast } from '../toast'
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
                <CheckButton checked={false} label="標記完成" onClick={() => toggle(p)} />
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
                  <CheckButton checked label="取消完成" onClick={() => toggle(p)} />
                  <button onClick={() => setEditing(p)} className="min-w-0 flex-1 text-left">
                    <span className="font-medium text-neutral-400 line-through decoration-neutral-300">{p.content}</span>
                    <p className="text-xs text-neutral-500">
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
  const [tried, setTried] = useState(false)
  const dirty = useDirty([content, note])
  const toast = useToast()

  const submit = async () => {
    if (!content.trim()) return setTried(true)
    const patch = { content: content.trim(), note: note.trim() || undefined }
    if (existing) await promisesRepo.update(existing.id, patch)
    else await promisesRepo.add({ ...patch, personId, completed: false })
    toast(existing ? '已儲存' : '已新增')
    onClose()
  }

  return (
    <BottomSheet open onClose={onClose} dirty={dirty} title={existing ? `編輯${word}` : `新增${word}`}>
      <div className="space-y-4">
        <Field label={`${word}內容`} required error={tried && !content.trim() ? `請填寫${word}內容` : undefined}>
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
          <DeleteButton onDelete={async () => {
            const undo = await promisesRepo.remove(existing.id)
            onClose()
            toast('已刪除', { action: { label: '復原', onClick: undo } })
          }} />
        )}
      </div>
    </BottomSheet>
  )
}
