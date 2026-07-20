import type { PersonStatus, PreferenceCategory, Sentiment, PlaceType, RelationType } from './types'

export const STATUS_LABEL: Record<PersonStatus, string> = {
  crush: '單戀',
  ambiguous: '曖昧',
  dating: '交往中',
  archived: '封存',
}

// 顏色收斂:只有「交往中」用主色,其餘中性灰
export const STATUS_STYLE: Record<PersonStatus, string> = {
  crush: 'bg-neutral-100 text-neutral-500',
  ambiguous: 'bg-neutral-100 text-neutral-500',
  dating: 'bg-accent-100 text-accent-700',
  archived: 'bg-neutral-100 text-neutral-400',
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
  visited: '她去過',
  she_wants_to_go: '她想去',
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
