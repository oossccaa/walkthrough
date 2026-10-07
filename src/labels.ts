import type { PersonRole, PreferenceCategory, Sentiment, PlaceType, RelationType } from './types'

export const ROLE_LABEL: Record<PersonRole, string> = {
  partner: '對象',
  friend: '朋友',
  coworker: '同事',
  client: '客戶',
  family: '家人',
}

// 顏色收斂:只有「對象」用主色,其餘中性灰
export const ROLE_STYLE: Record<PersonRole, string> = {
  partner: 'bg-accent-100 text-accent-700',
  friend: 'bg-neutral-100 text-neutral-500',
  coworker: 'bg-neutral-100 text-neutral-500',
  client: 'bg-neutral-100 text-neutral-500',
  family: 'bg-neutral-100 text-neutral-500',
}

export const ROLE_ORDER: PersonRole[] = ['partner', 'friend', 'coworker', 'client', 'family']

// 各身份可記錄的模組:朋友 / 家人 / 同事 / 客戶一律相同,對象另外多「地點」
export type ModuleKey = 'quick' | 'preferences' | 'places' | 'relations' | 'gifts' | 'anniversaries' | 'promises'

const COMMON_MODULES: ModuleKey[] = ['quick', 'preferences', 'relations', 'gifts', 'anniversaries', 'promises']

export const ROLE_MODULES: Record<PersonRole, ModuleKey[]> = {
  partner: ['quick', 'preferences', 'places', 'relations', 'gifts', 'anniversaries', 'promises'],
  friend: COMMON_MODULES,
  family: COMMON_MODULES,
  coworker: COMMON_MODULES,
  client: COMMON_MODULES,
}

/** 可記公司 / 職稱的身份(對象以外都可以) */
export const hasWorkInfo = (role: PersonRole) => role !== 'partner'

const COMMON_HINT = '喜好、人物、禮物、重要日子、承諾,可記公司職稱'

export const ROLE_HINT: Record<PersonRole, string> = {
  partner: '最完整:喜好、地點、人物、禮物、紀念日、約定',
  friend: COMMON_HINT,
  family: COMMON_HINT,
  coworker: COMMON_HINT,
  client: COMMON_HINT,
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
  hate: 'bg-danger text-white border-danger',
}

export const SENTIMENT_DOT: Record<Sentiment, string> = {
  love: 'bg-accent-600',
  like: 'bg-accent-300',
  dislike: 'bg-neutral-300',
  hate: 'bg-danger',
}

export const PLACE_TYPE_LABEL: Record<PlaceType, string> = {
  visited: '去過',
  she_wants_to_go: '想去',
  promised_together: '約好一起去',
}

export const RELATION_TYPE_LABEL: Record<RelationType, string> = {
  work: '工作關係',
  family: '家人',
  friend: '朋友',
  ex: '前任',
}

// 人物 tab 依身份顯示的關係區塊(同時決定表單可選的類型);
// 非對象身份可選的類型相同,只是排序依身份把最常用的放第一個(第一個區塊永遠顯示)
export const ROLE_RELATION_TYPES: Record<PersonRole, RelationType[]> = {
  partner: ['family', 'friend', 'ex'],
  friend: ['friend', 'family', 'work'],
  family: ['family', 'friend', 'work'],
  coworker: ['work', 'family', 'friend'],
  client: ['work', 'family', 'friend'],
}

// 紀念日快速範本(依身份)
export const ROLE_ANNIVERSARY_TEMPLATES: Record<PersonRole, string[]> = {
  partner: ['第一次見面', '第一次約會', '第一次牽手', '第一次接吻', '在一起', '第一次旅行'],
  client: ['生日', '簽約週年', '公司創立日', '初次拜訪'],
  friend: ['生日', '認識紀念日'],
  family: ['生日', '認識紀念日'],
  coworker: ['生日', '認識紀念日'],
}

// 模組(tab)名稱:「紀念日/約定」是對象限定的說法,其他身份用中性詞
export function moduleLabel(m: ModuleKey, isPartner: boolean): string {
  const labels: Record<ModuleKey, string> = {
    quick: '速查',
    preferences: '喜好',
    places: '地點',
    relations: '人物',
    gifts: '禮物',
    anniversaries: isPartner ? '紀念日' : '重要日子',
    promises: isPartner ? '約定' : '承諾',
  }
  return labels[m]
}
