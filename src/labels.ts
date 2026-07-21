import type { PersonRole, PreferenceCategory, Sentiment, PlaceType, RelationType } from './types'

export const ROLE_LABEL: Record<PersonRole, string> = {
  partner: '對象',
  friend: '朋友',
  coworker: '同事',
  family: '家人',
}

// 顏色收斂:只有「對象」用主色,其餘中性灰
export const ROLE_STYLE: Record<PersonRole, string> = {
  partner: 'bg-accent-100 text-accent-700',
  friend: 'bg-neutral-100 text-neutral-500',
  coworker: 'bg-neutral-100 text-neutral-500',
  family: 'bg-neutral-100 text-neutral-500',
}

export const ROLE_ORDER: PersonRole[] = ['partner', 'friend', 'coworker', 'family']

// 各身份可記錄的模組(對象最完整)
export type ModuleKey = 'quick' | 'preferences' | 'places' | 'relations' | 'gifts' | 'anniversaries' | 'promises'

export const ROLE_MODULES: Record<PersonRole, ModuleKey[]> = {
  partner: ['quick', 'preferences', 'places', 'relations', 'gifts', 'anniversaries', 'promises'],
  friend: ['quick', 'preferences', 'gifts', 'anniversaries'],
  family: ['quick', 'preferences', 'gifts', 'anniversaries'],
  coworker: ['quick', 'preferences', 'anniversaries'],
}

export const ROLE_HINT: Record<PersonRole, string> = {
  partner: '最完整:喜好、地點、人物、禮物、紀念日、約定',
  friend: '喜好、禮物、紀念日',
  family: '喜好、禮物、紀念日',
  coworker: '喜好、紀念日',
}

export const CATEGORY_LABEL: Record<PreferenceCategory, string> = {
  food: '食物',
  drink: '飲料',
  alcohol: '酒',
  music: '音樂',
  movie_tv: '影劇',
  character: '角色',
  idol: '偶像',
  hobby: '興趣',
  other: '其他',
}

export const SENTIMENT_LABEL: Record<Sentiment, string> = {
  love: '超愛',
  like: '喜歡',
  dislike: '不喜歡',
  hate: '地雷',
}

// 喜好程度:正面用主色深淺、負面用灰,地雷才用紅
export const SENTIMENT_STYLE: Record<Sentiment, string> = {
  love: 'bg-accent-600 text-white border-accent-600',
  like: 'bg-accent-100 text-accent-700 border-accent-200',
  dislike: 'bg-neutral-100 text-neutral-500 border-neutral-200',
  hate: 'bg-red-600 text-white border-red-600',
}

export const SENTIMENT_DOT: Record<Sentiment, string> = {
  love: 'bg-accent-600',
  like: 'bg-accent-300',
  dislike: 'bg-neutral-300',
  hate: 'bg-red-600',
}

export const PLACE_TYPE_LABEL: Record<PlaceType, string> = {
  visited: '去過',
  she_wants_to_go: '想去',
  promised_together: '約好一起去',
}

export const RELATION_TYPE_LABEL: Record<RelationType, string> = {
  family: '家人',
  friend: '朋友',
  ex: '前任',
}

// 「第一次___」快速範本
export const ANNIVERSARY_TEMPLATES = [
  '第一次見面',
  '第一次約會',
  '第一次牽手',
  '第一次接吻',
  '在一起',
  '第一次旅行',
]
