import { useState } from 'react'
import { SectionCard, EmptyState, Chip, AddButton, BottomSheet, Field, inputCls, PrimaryButton, DeleteButton } from '../ui'
import { ANNIVERSARY_TEMPLATES } from '../../labels'
import { fmt, daysSince, daysUntilNext } from '../../utils/dates'
import { anniversariesRepo } from '../../db/repo'
import type { Anniversary } from '../../types'

export function AnniversariesTab({ personId, items }: { personId: string; items: Anniversary[] }) {
  const [editing, setEditing] = useState<Anniversary | 'new' | null>(null)
  const [templateTitle, setTemplateTitle] = useState('')

  const sorted = [...items].sort((a, b) =>
    (a.recurring ? daysUntilNext(a.date) : 9999) - (b.recurring ? daysUntilNext(b.date) : 9999),
  )

  return (
    <div className="space-y-3">
      <SectionCard title="快速新增" subtitle="點一下套用「第一次___」範本">
        <div className="flex flex-wrap gap-2">
          {ANNIVERSARY_TEMPLATES.map(t => (
            <Chip key={t} onClick={() => { setTemplateTitle(t); setEditing('new') }}>{t}</Chip>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="紀念日">
        {sorted.length === 0 ? (
          <EmptyState text="還沒有紀念日" />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {sorted.map(a => {
              const passed = daysSince(a.date)
              const next = a.recurring ? daysUntilNext(a.date) : null
              return (
                <li key={a.id}>
                  <button onClick={() => setEditing(a)} className="flex w-full items-center justify-between gap-3 py-3 text-left first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{a.title}</span>
                        {a.recurring && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">每年</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">
                        {fmt(a.date)}
                        {passed > 0 && ` ・ 已經 ${passed} 天`}
                      </p>
                      {a.note && <p className="mt-0.5 text-xs text-neutral-500">{a.note}</p>}
                    </div>
                    {next != null && (
                      <div className={`shrink-0 rounded-xl px-3 py-1.5 text-center ${next <= 7 ? 'bg-accent-500 text-white' : 'bg-accent-50 text-accent-600'}`}>
                        <div className="text-lg font-bold leading-none">{next}</div>
                        <div className="text-[10px]">{next === 0 ? '就是今天' : '天後'}</div>
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>

      <AddButton label="新增紀念日" onClick={() => { setTemplateTitle(''); setEditing('new') }} />

      {editing && (
        <AnniversarySheet
          personId={personId}
          existing={editing === 'new' ? null : editing}
          defaultTitle={templateTitle}
          onClose={() => { setEditing(null); setTemplateTitle('') }}
        />
      )}
    </div>
  )
}

function AnniversarySheet({ personId, existing, defaultTitle, onClose }: {
  personId: string
  existing: Anniversary | null
  defaultTitle: string
  onClose: () => void
}) {
  const [title, setTitle] = useState(existing?.title ?? defaultTitle)
  const [date, setDate] = useState(existing?.date ?? '')
  const [recurring, setRecurring] = useState(existing?.recurring ?? true)
  const [note, setNote] = useState(existing?.note ?? '')

  const submit = async () => {
    if (!title.trim() || !date) return
    const patch = { title: title.trim(), date, recurring, note: note.trim() || undefined }
    if (existing) await anniversariesRepo.update(existing.id, patch)
    else await anniversariesRepo.add({ ...patch, personId })
    onClose()
  }

  return (
    <BottomSheet open onClose={onClose} title={existing ? '編輯紀念日' : '新增紀念日'}>
      <div className="space-y-4">
        <Field label="名稱">
          <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="例:第一次見面" />
        </Field>
        <Field label="日期">
          <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="h-4 w-4 accent-accent-500" />
          每年提醒(顯示週年倒數)
        </label>
        <Field label="備註(選填)">
          <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="例:想要儀式感,提早訂餐廳" />
        </Field>
        <PrimaryButton onClick={submit}>{existing ? '儲存' : '新增'}</PrimaryButton>
        {existing && (
          <DeleteButton onConfirm={async () => { await anniversariesRepo.remove(existing.id); onClose() }} />
        )}
      </div>
    </BottomSheet>
  )
}
