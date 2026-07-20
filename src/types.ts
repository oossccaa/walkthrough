// 依 CLAUDE.md 資料模型定義;日期一律存 ISO 字串(yyyy-MM-dd 或完整 ISO)

export type PersonStatus = 'crush' | 'ambiguous' | 'dating' | 'archived'

export interface Person {
  id: string
  name: string
  nickname?: string
  birthday?: string
  metAt?: { date?: string; place?: string; story?: string }
  status: PersonStatus
  statusHistory: { status: PersonStatus; date: string }[]
  color?: string // 主題色 key(多對象模式下每位可不同)
  avatar?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type PreferenceCategory =
  | 'food' | 'drink' | 'alcohol' | 'music' | 'movie_tv'
  | 'character' | 'idol' | 'hobby' | 'other'

export type Sentiment = 'love' | 'like' | 'dislike' | 'hate'

export interface Preference {
  id: string
  personId: string
  category: PreferenceCategory
  name: string
  sentiment: Sentiment
  note?: string
  detail?: string
  sourceContext?: string
  createdAt: string
  updatedAt: string
}

export type PlaceType = 'visited' | 'she_wants_to_go' | 'promised_together'

export interface Place {
  id: string
  personId: string
  name: string
  type: PlaceType
  date?: string
  completed?: boolean
  completedDate?: string
  note?: string
}

export type RelationType = 'family' | 'friend' | 'ex'

export interface RelationPerson {
  id: string
  personId: string
  type: RelationType
  name: string
  role?: string
  traits?: string
  datingStart?: string
  datingEnd?: string
  note?: string
}

export type GiftDirection = 'given' | 'wishlist'

export interface Gift {
  id: string
  personId: string
  direction: GiftDirection
  name: string
  date?: string
  occasion?: string
  reaction?: string
  price?: number
  sourceContext?: string
  purchased?: boolean
}

export interface Anniversary {
  id: string
  personId: string
  title: string
  date: string
  recurring: boolean
  note?: string
}

// 行程(約會行程規劃):一天一份行程,內含多個行程點
export type ItineraryTimeType = 'range' | 'fixed'

export interface ItineraryStop {
  id: string
  place: string
  timeType: ItineraryTimeType
  startTime?: string // HH:mm;fixed 只用這個
  endTime?: string   // range 才有
  note?: string
}

export interface Itinerary {
  id: string
  personId?: string
  date: string
  stops: ItineraryStop[]
  createdAt: string
  updatedAt: string
}

export interface PromiseItem {
  id: string
  personId: string
  content: string
  completed: boolean
  completedDate?: string
  note?: string
}
