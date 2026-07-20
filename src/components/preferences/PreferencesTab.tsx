import { useState } from 'react'
import { SectionCard, Chip, EmptyState, BottomSheet, Field, inputCls, PrimaryButton, AddButton, DeleteButton } from '../ui'
import { CATEGORY_LABEL, SENTIMENT_LABEL, SENTIMENT_STYLE, SENTIMENT_DOT } from '../../labels'
import { preferencesRepo, nowIso } from '../../db/repo'
import type { Preference, PreferenceCategory, Sentiment } from '../../types'

const CATEGORIES = Object.keys(CATEGORY_LABEL) as PreferenceCategory[]
const SENTIMENTS = Object.keys(SENTIMENT_LABEL) as Sentiment[]

export function PreferencesTab({ personId, items }: { personId: string; items: Preference[] }) {
  const [filter, setFilter] = useState<PreferenceCategory | 'all'>('all')
  const [editing, setEditing] = useState<Preference | 'new' | null>(null)

  const shown = filter === 'all' ? items : items.filter(p => p.category === filter)
  const grouped = CATEGORIES.map(c => [c, shown.filter(p => p.category === c)] as const).filter(
    ([, list]) => list.length > 0,
  )

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>全部</Chip>
        {CATEGORIES.map(c => (
          <Chip key={c} selected={filter === c} onClick={() => setFilter(c)}>
            {CATEGORY_LABEL[c]}
          </Chip>
        ))}
      </div>

      {grouped.length === 0 && <EmptyState text="還沒有紀錄,點下方新增" />}

      {grouped.map(([cat, list]) => (
        <SectionCard key={cat} title={CATEGORY_LABEL[cat]}>
          <ul className="divide-y divide-neutral-100">
            {list.map(p => (
              <li key={p.id}>
                <button
                  onClick={() => setEditing(p)}
                  className="flex w-full items-start gap-3 py-2.5 text-left first:pt-0 last:pb-0"
                >
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${SENTIMENT_DOT[p.sentiment]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${SENTIMENT_STYLE[p.sentiment]}`}>
                        {SENTIMENT_LABEL[p.sentiment]}
                      </span>
                    </div>
                    {p.detail && <p className="text-sm text-neutral-600">{p.detail}</p>}
                    {p.note && <p className="text-xs text-neutral-500">{p.note}</p>}
                    {p.sourceContext && <p className="text-xs text-neutral-400">{p.sourceContext}</p>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>
      ))}

      <AddButton label="新增喜好" onClick={() => setEditing('new')} />

      {editing && (
        <PreferenceSheet
          personId={personId}
          existing={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function PreferenceSheet({ personId, existing, onClose }: {
  personId: string
  existing: Preference | null
  onClose: () => void
}) {
  const [category, setCategory] = useState<PreferenceCategory>(existing?.category ?? 'food')
  const [sentiment, setSentiment] = useState<Sentiment>(existing?.sentiment ?? 'like')
  const [name, setName] = useState(existing?.name ?? '')
  const [detail, setDetail] = useState(existing?.detail ?? '')
  const [note, setNote] = useState(existing?.note ?? '')
  const [sourceContext, setSourceContext] = useState(existing?.sourceContext ?? '')

  const submit = async () => {
    if (!name.trim()) return
    const patch = {
      category,
      sentiment,
      name: name.trim(),
      detail: detail.trim() || undefined,
      note: note.trim() || undefined,
      sourceContext: sourceContext.trim() || undefined,
      updatedAt: nowIso(),
    }
    if (existing) await preferencesRepo.update(existing.id, patch)
    else await preferencesRepo.add({ ...patch, personId, createdAt: nowIso() })
    onClose()
  }

  return (
    <BottomSheet open onClose={onClose} title={existing ? '編輯喜好' : '新增喜好'}>
      <div className="space-y-4">
        <Field label="分類">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_LABEL[c]}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label="名稱">
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="例:香菜、威士忌、進擊的巨人" />
        </Field>
        <Field label="喜好程度">
          <div className="flex gap-2">
            {SENTIMENTS.map(s => (
              <Chip key={s} selected={sentiment === s} onClick={() => setSentiment(s)}>
                {SENTIMENT_LABEL[s]}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label="子項目(選填)">
          <input className={inputCls} value={detail} onChange={e => setDetail(e.target.value)} placeholder="例:最喜歡的角色、專輯" />
        </Field>
        <Field label="備註(選填)">
          <input className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="例:不吃香菜但可接受九層塔" />
        </Field>
        <Field label="她什麼時候提到的?(選填)">
          <input className={inputCls} value={sourceContext} onChange={e => setSourceContext(e.target.value)} placeholder="例:第一次吃越南河粉時說的" />
        </Field>
        <PrimaryButton onClick={submit}>{existing ? '儲存' : '新增'}</PrimaryButton>
        {existing && (
          <DeleteButton onConfirm={async () => { await preferencesRepo.remove(existing.id); onClose() }} />
        )}
      </div>
    </BottomSheet>
  )
}
