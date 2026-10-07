import { useState } from 'react'
import { SectionCard, EmptyState, AddButton, BottomSheet, Chip, Field, inputCls, PrimaryButton, DeleteButton, useDirty } from '../ui'
import { useToast } from '../toast'
import { fmt } from '../../utils/dates'
import { giftsRepo } from '../../db/repo'
import type { Gift, GiftDirection } from '../../types'

export function GiftsTab({ personId, items }: { personId: string; items: Gift[] }) {
  const [editing, setEditing] = useState<Gift | 'new' | null>(null)
  const wishlist = items.filter(g => g.direction === 'wishlist')
  const given = items.filter(g => g.direction === 'given')

  return (
    <div className="space-y-3">
      <SectionCard title="想要的" subtitle="對方提過需要或想要的東西,送禮時參考">
        {wishlist.length === 0 ? (
          <EmptyState text="還沒記錄想要的東西" />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {wishlist.map(g => (
              <li key={g.id}>
                <button onClick={() => setEditing(g)} className="w-full py-2.5 text-left first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{g.name}</span>
                    {g.purchased && (
                      <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-bold text-accent-700">已買待送</span>
                    )}
                    {g.price != null && <span className="text-xs text-neutral-400">${g.price.toLocaleString()}</span>}
                  </div>
                  {g.sourceContext && <p className="mt-0.5 text-xs text-neutral-500">{g.sourceContext}</p>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="送過的">
        {given.length === 0 ? (
          <EmptyState text="還沒送過禮物" />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {given.map(g => (
              <li key={g.id}>
                <button onClick={() => setEditing(g)} className="w-full py-2.5 text-left first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{g.name}</span>
                    {g.occasion && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">{g.occasion}</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400">
                    {fmt(g.date)}
                    {g.price != null && ` ・ $${g.price.toLocaleString()}`}
                  </p>
                  {g.reaction && <p className="mt-0.5 text-xs text-neutral-500">對方的反應:{g.reaction}</p>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <AddButton label="新增禮物" onClick={() => setEditing('new')} />

      {editing && (
        <GiftSheet personId={personId} existing={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

function GiftSheet({ personId, existing, onClose }: {
  personId: string
  existing: Gift | null
  onClose: () => void
}) {
  const [direction, setDirection] = useState<GiftDirection>(existing?.direction ?? 'wishlist')
  const [name, setName] = useState(existing?.name ?? '')
  const [date, setDate] = useState(existing?.date ?? '')
  const [occasion, setOccasion] = useState(existing?.occasion ?? '')
  const [reaction, setReaction] = useState(existing?.reaction ?? '')
  const [price, setPrice] = useState(existing?.price?.toString() ?? '')
  const [sourceContext, setSourceContext] = useState(existing?.sourceContext ?? '')
  const [purchased, setPurchased] = useState(existing?.purchased ?? false)
  const [tried, setTried] = useState(false)
  const dirty = useDirty([direction, name, date, occasion, reaction, price, sourceContext, purchased])
  const toast = useToast()
  const priceInvalid = price.trim() !== '' && !(Number(price) >= 0)

  const submit = async () => {
    if (!name.trim() || priceInvalid) return setTried(true)
    const isGiven = direction === 'given'
    const patch = {
      direction,
      name: name.trim(),
      date: isGiven ? date || undefined : undefined,
      occasion: isGiven ? occasion.trim() || undefined : undefined,
      reaction: isGiven ? reaction.trim() || undefined : undefined,
      sourceContext: !isGiven ? sourceContext.trim() || undefined : undefined,
      purchased: !isGiven ? purchased : undefined,
      price: price.trim() ? Number(price) : undefined,
    }
    if (existing) await giftsRepo.update(existing.id, patch)
    else await giftsRepo.add({ ...patch, personId })
    toast(existing ? '已儲存' : '已新增')
    onClose()
  }

  return (
    <BottomSheet open onClose={onClose} dirty={dirty} title={existing ? '編輯禮物' : '新增禮物'}>
      <div className="space-y-4">
        <Field label="類型">
          <div className="flex gap-2">
            <Chip selected={direction === 'wishlist'} onClick={() => setDirection('wishlist')}>想要的</Chip>
            <Chip selected={direction === 'given'} onClick={() => setDirection('given')}>送過的</Chip>
          </div>
        </Field>
        <Field label="名稱" required error={tried && !name.trim() ? '請填寫名稱' : undefined}>
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="例:香氛蠟燭" />
        </Field>
        {direction === 'given' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="送出日期">
                <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
              </Field>
              <Field label="場合(選填)">
                <input className={inputCls} value={occasion} onChange={e => setOccasion(e.target.value)} placeholder="生日、謝禮、升遷祝賀…" />
              </Field>
            </div>
            <Field label="對方的反應(選填)">
              <input className={inputCls} value={reaction} onChange={e => setReaction(e.target.value)} placeholder="例:很喜歡,當天就用上了" />
            </Field>
          </>
        ) : (
          <>
            <Field label="怎麼知道對方想要?(選填)">
              <input className={inputCls} value={sourceContext} onChange={e => setSourceContext(e.target.value)} placeholder="例:聊天時說舊的耳機一直斷線" />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={purchased} onChange={e => setPurchased(e.target.checked)} className="h-4 w-4 accent-accent-500" />
              已買好,還沒送出
            </label>
          </>
        )}
        <Field label="價格(選填)" error={priceInvalid ? '請輸入 0 以上的數字' : undefined}>
          <input type="number" inputMode="numeric" min={0} className={inputCls} value={price} onChange={e => setPrice(e.target.value)} placeholder="1280" />
        </Field>
        <PrimaryButton onClick={submit}>{existing ? '儲存' : '新增'}</PrimaryButton>
        {existing && (
          <DeleteButton onDelete={async () => {
            const undo = await giftsRepo.remove(existing.id)
            onClose()
            toast('已刪除', { action: { label: '復原', onClick: undo } })
          }} />
        )}
      </div>
    </BottomSheet>
  )
}
