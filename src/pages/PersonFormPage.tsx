import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SectionCard, Chip, Field, inputCls, PrimaryButton, DeleteButton } from '../components/ui'
import { STATUS_LABEL } from '../labels'
import { useApp } from '../store'
import { addPerson, updatePerson, deletePerson } from '../db/repo'
import { THEMES, THEME_KEYS, isThemeKey } from '../theme'
import type { PersonStatus } from '../types'

const STATUSES: PersonStatus[] = ['crush', 'ambiguous', 'dating', 'archived']

export function PersonFormPage() {
  const { id } = useParams()
  const { persons, ready } = useApp()

  // 等 IndexedDB 載入完成再掛表單,避免編輯時抓不到既有資料
  if (!ready) return null

  const existing = id ? persons.find(p => p.id === id) : undefined
  if (id && !existing) {
    return (
      <div className="py-20 text-center text-neutral-400">
        找不到這位對象 <Link to="/" className="text-accent-600 underline">回首頁</Link>
      </div>
    )
  }

  return <PersonForm existing={existing} />
}

function PersonForm({ existing }: { existing?: import('../types').Person }) {
  const navigate = useNavigate()
  const { multiMode } = useApp()

  const [color, setColor] = useState<string | undefined>(
    isThemeKey(existing?.color) ? existing?.color : undefined,
  )
  const [name, setName] = useState(existing?.name ?? '')
  const [nickname, setNickname] = useState(existing?.nickname ?? '')
  const [status, setStatus] = useState<PersonStatus>(existing?.status ?? 'ambiguous')
  const [birthday, setBirthday] = useState(existing?.birthday ?? '')
  const [metDate, setMetDate] = useState(existing?.metAt?.date ?? '')
  const [metPlace, setMetPlace] = useState(existing?.metAt?.place ?? '')
  const [metStory, setMetStory] = useState(existing?.metAt?.story ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const submit = async () => {
    if (!name.trim()) return
    const metAt = (metDate || metPlace || metStory)
      ? { date: metDate || undefined, place: metPlace.trim() || undefined, story: metStory.trim() || undefined }
      : undefined
    const data = {
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      status,
      birthday: birthday || undefined,
      metAt,
      notes: notes.trim() || undefined,
      color,
    }
    if (existing) {
      await updatePerson(existing.id, data)
      navigate(`/person/${existing.id}`)
    } else {
      const p = await addPerson(data)
      navigate(`/person/${p.id}`)
    }
  }

  return (
    <div className="space-y-4 pb-10">
      <header className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate(-1)} className="text-sm text-neutral-400">‹ 返回</button>
        <h1 className="text-xl font-black">{existing ? '編輯對象' : '新增對象'}</h1>
      </header>

      <SectionCard>
        <div className="space-y-4">
          <Field label="名字">
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="她的名字" />
          </Field>
          <Field label="暱稱(選填)">
            <input className={inputCls} value={nickname} onChange={e => setNickname(e.target.value)} />
          </Field>
          <Field label="目前狀態">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <Chip key={s} selected={status === s} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</Chip>
              ))}
            </div>
          </Field>
          <Field label="生日(選填)">
            <input type="date" className={inputCls} value={birthday} onChange={e => setBirthday(e.target.value)} />
          </Field>
          {multiMode && (
            <Field label="她的專屬顏色(她的頁面會用這個色系)">
              <div className="flex flex-wrap items-center gap-3 py-1">
                {THEME_KEYS.map(k => (
                  <button
                    key={k}
                    type="button"
                    aria-label={THEMES[k].label}
                    onClick={() => setColor(color === k ? undefined : k)}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      color === k ? 'scale-110 ring-2 ring-neutral-400 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: THEMES[k].shades[400] }}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-neutral-400">
                {color ? `已選:${THEMES[color as keyof typeof THEMES].label}(再點一下取消)` : '未選,使用全域主色'}
              </p>
            </Field>
          )}
        </div>
      </SectionCard>

      <SectionCard title="怎麼認識的?" subtitle="選填">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="日期">
              <input type="date" className={inputCls} value={metDate} onChange={e => setMetDate(e.target.value)} />
            </Field>
            <Field label="場合">
              <input className={inputCls} value={metPlace} onChange={e => setMetPlace(e.target.value)} placeholder="朋友聚會" />
            </Field>
          </div>
          <Field label="故事">
            <textarea className={`${inputCls} min-h-20`} value={metStory} onChange={e => setMetStory(e.target.value)} placeholder="那天發生了什麼?" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="隨手備註" subtitle="會顯示在她的主頁上">
        <textarea className={`${inputCls} min-h-20`} value={notes} onChange={e => setNotes(e.target.value)} placeholder="例:怕冷,出門要提醒她帶外套" />
      </SectionCard>

      <PrimaryButton onClick={submit}>{existing ? '儲存' : '建立'}</PrimaryButton>

      {existing && (
        <DeleteButton
          label="刪除這位對象(含所有紀錄)"
          onConfirm={async () => { await deletePerson(existing.id); navigate('/') }}
        />
      )}
    </div>
  )
}
