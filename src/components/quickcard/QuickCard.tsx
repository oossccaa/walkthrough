import { SectionCard, EmptyState } from '../ui'
import { SENTIMENT_LABEL, SENTIMENT_STYLE, RELATION_TYPE_LABEL } from '../../labels'
import { daysUntilNext, fmt } from '../../utils/dates'
import { today } from '../../db/repo'
import { ItineraryTimeline } from '../itinerary/ItineraryFab'
import type { Preference, Gift, Anniversary, RelationPerson, Itinerary } from '../../types'

/** 約會前速查卡:一頁看完下次行程、地雷、最新喜好、願望禮物、紀念日、重要人物 */
export function QuickCard({ preferences, gifts, anniversaries, relations, itineraries }: {
  preferences: Preference[]
  gifts: Gift[]
  anniversaries: Anniversary[]
  relations: RelationPerson[]
  itineraries: Itinerary[]
}) {
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

  return (
    <div className="space-y-3">
      {nextItinerary && (
        <SectionCard title="下一次行程" subtitle={fmt(nextItinerary.date)}>
          <ItineraryTimeline stops={nextItinerary.stops} />
        </SectionCard>
      )}

      <SectionCard title="飲食地雷" subtitle="點餐前必看">
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

      <SectionCard title="最近的喜好">
        <div className="flex flex-wrap gap-2">
          {recentLikes.map(p => (
            <span key={p.id} className={`rounded-full border px-3 py-1 text-sm ${SENTIMENT_STYLE[p.sentiment]}`}>
              {p.name}
              {p.detail && <span className="opacity-70">・{p.detail}</span>}
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="她提過想要的">
        {wishlist.length === 0 ? (
          <EmptyState text="還沒記錄她想要的東西" />
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

      <SectionCard title="紀念日倒數">
        <ul className="space-y-2">
          {upcoming.map(a => {
            const d = daysUntilNext(a.date)
            return (
              <li key={a.id} className="flex items-center justify-between">
                <span className="font-medium">{a.title}</span>
                <span className={`text-sm font-bold ${d <= 7 ? 'text-accent-600' : 'text-neutral-400'}`}>
                  {d === 0 ? '就是今天' : `${d} 天後`}
                </span>
              </li>
            )
          })}
        </ul>
      </SectionCard>

      <SectionCard title="重要人物小抄">
        {keyPeople.length === 0 ? (
          <EmptyState text="還沒記錄重要人物" />
        ) : (
          <ul className="space-y-2">
            {keyPeople.map(r => (
              <li key={r.id}>
                <span className="font-medium">{r.name}</span>
                <span className="ml-1 text-xs text-neutral-400">{r.role ?? RELATION_TYPE_LABEL[r.type]}</span>
                <p className="text-xs text-neutral-500">{r.traits ?? r.note}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}
