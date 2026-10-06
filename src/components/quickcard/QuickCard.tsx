import { SectionCard, EmptyState, CheckButton } from '../ui'
import { SENTIMENT_LABEL, SENTIMENT_STYLE, RELATION_TYPE_LABEL, ROLE_MODULES, moduleLabel, type ModuleKey } from '../../labels'
import { daysUntilNext, fmt } from '../../utils/dates'
import { promisesRepo, today } from '../../db/repo'
import { useToast } from '../toast'
import { ItineraryTimeline } from '../itinerary/ItineraryFab'
import type { Preference, Gift, Anniversary, RelationPerson, Itinerary, PersonRole, PromiseItem } from '../../types'

/** 見面前速查卡:一頁看完下次行程、地雷、最新喜好、想要的禮物、紀念日、重要人物 */
export function QuickCard({ role, preferences, gifts, anniversaries, relations, itineraries, promises, onJump }: {
  role: PersonRole
  /** 跳到某個分頁(速查卡上的「查看 ›」與空狀態引導用) */
  onJump: (m: ModuleKey) => void
  preferences: Preference[]
  gifts: Gift[]
  anniversaries: Anniversary[]
  relations: RelationPerson[]
  itineraries: Itinerary[]
  promises: PromiseItem[]
}) {
  const modules = ROLE_MODULES[role]
  const toast = useToast()
  const openPromises = promises.filter(p => !p.completed).slice(0, 3)
  const isPartner = role === 'partner'
  const nextItinerary = [...itineraries]
    .filter(i => i.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date))[0]
  const foodMines = preferences.filter(
    p => ['food', 'drink', 'alcohol'].includes(p.category) && ['dislike', 'hate'].includes(p.sentiment),
  )
  const recentLikes = [...preferences]
    .filter(p => ['love', 'like'].includes(p.sentiment))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)
  const wishlist = gifts.filter(g => g.direction === 'wishlist' && !g.purchased)
  const upcoming = [...anniversaries]
    .filter(a => a.recurring)
    .sort((a, b) => daysUntilNext(a.date) - daysUntilNext(b.date))
    .slice(0, 3)
  const keyPeople = relations.filter(r => r.traits || r.note)
  const more = (m: ModuleKey) => (
    <button onClick={() => onJump(m)} className="shrink-0 text-xs font-medium text-accent-600">
      查看 ›
    </button>
  )

  // 剛新增的人什麼都沒有:不要一整排空卡片,改成一張引導卡
  const isBlank = [preferences, gifts, anniversaries, relations, itineraries, promises].every(l => l.length === 0)
  if (isBlank) {
    return (
      <SectionCard title="從這裡開始" subtitle="記下幾筆,見面前打開這頁就能 30 秒速查">
        <div className="flex flex-wrap gap-2">
          {modules.filter(m => m !== 'quick').map(m => (
            <button
              key={m}
              onClick={() => onJump(m)}
              className="rounded-full border border-accent-300 bg-paper px-3.5 py-1.5 text-[13px] font-bold text-accent-600 active:bg-accent-50"
            >
              ＋ {moduleLabel(m, isPartner)}
            </button>
          ))}
        </div>
      </SectionCard>
    )
  }

  return (
    <div className="space-y-3">
      {nextItinerary && (
        <SectionCard title="下一次行程" subtitle={fmt(nextItinerary.date)}>
          <ItineraryTimeline stops={nextItinerary.stops} />
        </SectionCard>
      )}

      {modules.includes('promises') && openPromises.length > 0 && (
        <SectionCard title={isPartner ? '還沒兌現的約定' : '未完成的承諾'} subtitle="別忘記答應過的事" action={more('promises')}>
          <ul className="space-y-2">
            {openPromises.map(p => (
              <li key={p.id} className="flex items-center gap-3">
                <CheckButton
                  checked={false}
                  label="標記完成"
                  onClick={async () => {
                    await promisesRepo.update(p.id, { completed: true, completedDate: today() })
                    toast('已標記完成', {
                      action: { label: '復原', onClick: () => promisesRepo.update(p.id, { completed: false, completedDate: undefined }) },
                    })
                  }}
                />
                <div className="min-w-0">
                  <span className="font-medium">{p.content}</span>
                  {p.note && <p className="text-xs text-neutral-500">{p.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="飲食地雷" subtitle="點餐前必看" action={more('preferences')}>
        {foodMines.length === 0 ? (
          <EmptyState text="目前沒有記錄地雷" />
        ) : (
          <ul className="space-y-2">
            {foodMines.map(p => (
              <li key={p.id} className="flex items-start gap-2">
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold ${SENTIMENT_STYLE[p.sentiment]}`}>
                  {SENTIMENT_LABEL[p.sentiment]}
                </span>
                <div>
                  <span className="font-medium">{p.name}</span>
                  {p.note && <p className="text-xs text-neutral-500">{p.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="最近的喜好" action={more('preferences')}>
        {recentLikes.length === 0 && (
          <EmptyState text="還沒記錄喜歡的東西" action={{ label: '去記一筆', onClick: () => onJump('preferences') }} />
        )}
        <div className="flex flex-wrap gap-2">
          {recentLikes.map(p => (
            <span key={p.id} className={`rounded-full border px-3 py-1 text-sm ${SENTIMENT_STYLE[p.sentiment]}`}>
              {p.name}
              {p.detail && <span className="opacity-70">・{p.detail}</span>}
            </span>
          ))}
        </div>
      </SectionCard>

      {modules.includes('gifts') && (
        <SectionCard title={isPartner ? '提過想要的' : '送禮靈感'} action={more('gifts')}>
          {wishlist.length === 0 ? (
            <EmptyState text={isPartner ? '還沒記錄想要的東西' : '還沒記錄送禮靈感'} />
          ) : (
            <ul className="space-y-2">
              {wishlist.map(g => (
                <li key={g.id}>
                  <span className="font-medium">{g.name}</span>
                  {g.sourceContext && <p className="text-xs text-neutral-500">{g.sourceContext}</p>}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      )}

      <SectionCard title={isPartner ? '紀念日倒數' : '重要日子倒數'} action={more('anniversaries')}>
        {upcoming.length === 0 && (
          <EmptyState
            text={isPartner ? '還沒有每年要記得的紀念日' : '還沒有每年要記得的日子'}
            action={{ label: '去新增', onClick: () => onJump('anniversaries') }}
          />
        )}
        <ul className="space-y-2">
          {upcoming.map(a => {
            const d = daysUntilNext(a.date)
            return (
              <li key={a.id} className="flex items-center justify-between">
                <span className="font-medium">{a.title}</span>
                <span className={`text-sm font-bold ${d <= 7 ? 'text-accent-600' : 'text-neutral-500'}`}>
                  {d === 0 ? '就是今天' : `${d} 天後`}
                </span>
              </li>
            )
          })}
        </ul>
      </SectionCard>

      {modules.includes('relations') && (
        <SectionCard title="重要人物小抄" action={more('relations')}>
          {keyPeople.length === 0 ? (
            <EmptyState text="還沒記錄重要人物" />
          ) : (
            <ul className="space-y-2">
              {keyPeople.map(r => (
                <li key={r.id}>
                  <span className="font-medium">{r.name}</span>
                  <span className="ml-1 text-xs text-neutral-500">{r.role ?? RELATION_TYPE_LABEL[r.type]}</span>
                  <p className="text-xs text-neutral-500">{r.traits ?? r.note}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      )}
    </div>
  )
}
