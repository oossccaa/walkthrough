// 示範資料:從首頁或設定頁一鍵載入(整份覆蓋)
// 分「男生視角 / 女生視角」兩版,只有「對象」那一位不同;
// 朋友、家人、同事、客戶兩版共用,朋友男女各一、都是團體情境,示範內容保持正派。
import { addDays, format } from 'date-fns'
import type {
  Person, Preference, Place, RelationPerson, Gift, Anniversary, PromiseItem, Itinerary,
} from './types'
import type { ExportBundle } from './db/repo'

/** 使用者自己的視角:male = 我是男生(對象是女生),female 反之 */
export type DemoVariant = 'male' | 'female'

export const DEMO_VARIANT_LABEL: Record<DemoVariant, string> = {
  male: '男生視角',
  female: '女生視角',
}

// 行程、提醒用相對今天的日期,載入後速查卡與提醒馬上看得到效果
const rel = (days: number) => format(addDays(new Date(), days), 'yyyy-MM-dd')
const ts = (date: string) => `${date}T10:00:00Z`

export function mockBundle(variant: DemoVariant): ExportBundle {
  const p = partner(variant)
  return {
    app: 'love-notes',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      persons: [p.person, ...sharedPersons()],
      preferences: [...p.preferences, ...sharedPreferences],
      places: p.places,
      relations: [...p.relations, ...sharedRelations],
      gifts: [...p.gifts, ...sharedGifts],
      anniversaries: [...p.anniversaries, ...sharedAnniversaries()],
      promises: [...p.promises, ...sharedPromises],
      itineraries: [...p.itineraries, ...sharedItineraries()],
    },
  }
}

// ---- 對象(依視角不同) ----

function partner(variant: DemoVariant) {
  const female = variant === 'male' // 男生視角 → 對象是女生
  const T = female ? '她' : '他'
  const id = 'p1'
  const pref = (n: number, x: Omit<Preference, 'id' | 'personId' | 'createdAt' | 'updatedAt'>, date: string): Preference =>
    ({ id: `pref${n}`, personId: id, ...x, createdAt: ts(date), updatedAt: ts(date) })

  const person: Person = female
    ? {
      id, name: '小雨', nickname: '雨寶', birthday: '1999-03-14', role: 'partner', color: 'rose',
      metAt: { date: '2025-09-20', place: '大學同學聚會', story: '同學帶來的朋友,那天聊了一整晚旅行' },
      notes: '怕冷,出門提醒帶外套',
      createdAt: ts('2025-09-21'), updatedAt: ts('2026-07-18'),
    }
    : {
      id, name: '子睿', nickname: '睿睿', birthday: '1997-08-09', role: 'partner', color: 'sky',
      metAt: { date: '2025-09-20', place: '大學同學聚會', story: '同學帶來的朋友,那天聊了一整晚旅行' },
      notes: '早上容易低血糖,約早上記得先吃點東西',
      createdAt: ts('2025-09-21'), updatedAt: ts('2026-07-18'),
    }

  const preferences: Preference[] = [
    pref(1, { category: 'food', name: '香菜', sentiment: 'hate', note: '完全不行;九層塔可以', sourceContext: '一起吃越南河粉時說的' }, '2025-10-01'),
    pref(2, { category: 'food', name: '生魚片', sentiment: 'love', note: '尤其是鮭魚肚' }, '2025-10-12'),
    pref(3, { category: 'food', name: '辣', sentiment: 'dislike', note: '小辣可以,不要主動點大辣' }, '2025-11-02'),
    pref(4, { category: 'drink', name: '黑糖鮮奶', sentiment: 'love', note: '微糖少冰' }, '2025-10-20'),
    pref(5, { category: 'alcohol', name: '威士忌', sentiment: 'like', note: '只喝 highball' }, '2025-12-05'),
    pref(6, { category: 'movie_tv', name: '進擊的巨人', sentiment: 'love', detail: '最喜歡里維' }, '2026-01-15'),
    female
      ? pref(7, { category: 'idol', name: 'NewJeans', sentiment: 'love', detail: '本命是 Hanni', sourceContext: '演唱會沒搶到票很難過' }, '2026-04-10')
      : pref(7, { category: 'hobby', name: '底片攝影', sentiment: 'love', detail: '常用 Contax T2', sourceContext: '出門都會帶相機' }, '2026-04-10'),
    pref(8, { category: 'hobby', name: '拼圖', sentiment: 'like', note: '家裡有一面拼圖牆' }, '2026-02-20'),
    pref(9, { category: 'music', name: '爵士', sentiment: 'dislike', note: '覺得想睡,約會別選爵士酒吧' }, '2026-03-08'),
  ]

  const places: Place[] = [
    { id: 'pl1', personId: id, name: '象山步道', type: 'visited', date: '2025-11-15', note: '夜景很美,下次傍晚去' },
    { id: 'pl2', personId: id, name: '嵐山竹林(京都)', type: 'she_wants_to_go', note: '一直說想去看看' },
    { id: 'pl3', personId: id, name: '澎湖看花火節', type: 'promised_together', note: '說好 2027 春天去' },
    { id: 'pl4', personId: id, name: '陽明山擎天崗', type: 'promised_together', completed: true, completedDate: '2026-04-05', note: '野餐日,很成功' },
  ]

  const relations: RelationPerson[] = female
    ? [
      { id: 'r1', personId: id, type: 'family', name: '林媽媽', role: '媽媽', traits: '很重視禮貌,見面帶伴手禮(不吃甜)' },
      { id: 'r2', personId: id, type: 'family', name: '小妹', role: '妹妹', traits: '大學生,也喜歡 NewJeans,很好聊' },
      { id: 'r3', personId: id, type: 'friend', name: 'Peggy', role: '高中好友', traits: '講話直、很照顧她,聚餐可以一起約' },
      { id: 'r4', personId: id, type: 'ex', name: '阿哲', role: '大學學長', datingStart: '2021-02-14', datingEnd: '2023-08-01', note: '她不太想提,不主動問' },
    ]
    : [
      { id: 'r1', personId: id, type: 'family', name: '陳媽媽', role: '媽媽', traits: '很重視禮貌,見面帶伴手禮(喜歡茶葉)' },
      { id: 'r2', personId: id, type: 'family', name: '子傑', role: '弟弟', traits: '研究生,也玩底片相機,很好聊' },
      { id: 'r3', personId: id, type: 'friend', name: '阿傑', role: '高中好友', traits: '講話直、很照顧他,聚餐可以一起約' },
      { id: 'r4', personId: id, type: 'ex', name: '小安', role: '大學同學', datingStart: '2020-03-01', datingEnd: '2022-10-01', note: '他不太想提,不主動問' },
    ]

  const gifts: Gift[] = [
    { id: 'g1', personId: id, direction: 'given', name: '香氛蠟燭(木質調)', date: '2025-12-24', occasion: '交往紀念', reaction: '很喜歡,說味道很放鬆', price: 1280 },
    female
      ? { id: 'g2', personId: id, direction: 'given', name: 'NewJeans 小卡保護殼', date: '2026-03-14', occasion: '白色情人節', reaction: '開心到發限動', price: 450 }
      : { id: 'g2', personId: id, direction: 'given', name: '底片三捲組', date: '2026-02-14', occasion: '情人節', reaction: '當天就裝進相機', price: 900 },
    { id: 'g3', personId: id, direction: 'wishlist', name: '電動磨豆機', sourceContext: `${T}說手搖磨豆太累,想換電動的`, price: 3500 },
    { id: 'g4', personId: id, direction: 'wishlist', name: '拼圖架', sourceContext: '說桌子不夠大,拼圖都拼不完', purchased: true, price: 1500 },
  ]

  const anniversaries: Anniversary[] = [
    { id: 'a1', personId: id, title: '第一次見面', date: '2025-09-20', recurring: true },
    { id: 'a2', personId: id, title: '第一次約會', date: '2025-10-18', recurring: false, note: '大稻埕看夕陽' },
    { id: 'a3', personId: id, title: '在一起', date: '2025-12-24', recurring: true, note: '平安夜' },
    { id: 'a4', personId: id, title: `${T}的生日`, date: person.birthday!, recurring: true, note: '提早訂餐廳' },
  ]

  const promises: PromiseItem[] = [
    { id: 'pm1', personId: id, content: '一起去日本跨年', completed: false },
    { id: 'pm2', personId: id, content: `學會做${T}愛吃的親子丼`, completed: true, completedDate: '2026-05-02', note: `${T}說比店裡好吃` },
    { id: 'pm3', personId: id, content: '一起拼完 2000 片的星空拼圖', completed: false },
  ]

  const itineraries: Itinerary[] = [{
    id: 'it1',
    personId: id,
    date: rel(5),
    stops: [
      { id: 'its1', place: '大稻埕碼頭', timeType: 'range', startTime: '16:00', endTime: '18:00', note: '租 YouBike 沿河騎' },
      { id: 'its2', place: '夏日食堂', timeType: 'fixed', startTime: '18:30', note: '訂位 2 位,不要香菜' },
      { id: 'its3', place: '河岸散步', timeType: 'range', startTime: '20:00', endTime: '21:00' },
    ],
    createdAt: ts(rel(-3)),
    updatedAt: ts(rel(-3)),
  }]

  return { person, preferences, places, relations, gifts, anniversaries, promises, itineraries }
}

// ---- 兩版共用:朋友(男女各一)、家人、同事、客戶 ----

// 媽媽的生日固定落在兩天後,載入就能看到提醒橫幅
const momBirthday = () => `1968-${rel(2).slice(5)}`

function sharedPersons(): Person[] {
  return [
    {
      id: 'p2', name: '阿凱', role: 'friend', color: 'teal', birthday: '1998-11-02',
      company: '宏遠科技', jobTitle: '工程師',
      metAt: { date: '2016-09-12', place: '大學系上', story: '同組做期末專題認識' },
      notes: '大學同學,同學會的召集人',
      createdAt: ts('2025-05-11'), updatedAt: ts('2026-07-10'),
    },
    {
      id: 'p3', name: '婷婷', role: 'friend', color: 'violet', birthday: '1996-05-20',
      metAt: { date: '2023-03-01', place: '前公司' },
      company: '光點設計', jobTitle: 'UI 設計師',
      notes: '前同事,現在一起參加讀書會',
      createdAt: ts('2025-05-11'), updatedAt: ts('2026-07-10'),
    },
    {
      id: 'p4', name: '媽媽', role: 'family', color: 'amber', birthday: momBirthday(),
      notes: '血壓偏高,外食選清淡',
      createdAt: ts('2025-05-01'), updatedAt: ts('2026-07-01'),
    },
    {
      id: 'p5', name: '志明', role: 'coworker', color: 'slate', company: '同公司', jobTitle: '產品經理',
      notes: '隔壁組 PM,合作案窗口',
      createdAt: ts('2026-03-01'), updatedAt: ts('2026-07-01'),
    },
    {
      id: 'p6', name: '陳總', role: 'client', color: 'orange', company: '大同貿易', jobTitle: '採購總監',
      metAt: { date: '2025-06-12', place: '展場攤位', story: '對新品很有興趣,聊了半小時' },
      notes: '重要客戶,Q4 續約',
      createdAt: ts('2025-06-13'), updatedAt: ts('2026-07-15'),
    },
  ]
}

const sp = (n: number, personId: string, x: Omit<Preference, 'id' | 'personId' | 'createdAt' | 'updatedAt'>, date: string): Preference =>
  ({ id: `pref${n}`, personId, ...x, createdAt: ts(date), updatedAt: ts(date) })

const sharedPreferences: Preference[] = [
  sp(20, 'p2', { category: 'food', name: '拉麵', sentiment: 'love', note: '豚骨派,同學會常約拉麵店' }, '2026-06-05'),
  sp(21, 'p2', { category: 'hobby', name: '籃球', sentiment: 'love', note: '週三晚上固定打' }, '2026-06-20'),
  sp(22, 'p3', { category: 'food', name: '甜點', sentiment: 'love', note: '千層蛋糕控' }, '2026-06-05'),
  sp(23, 'p3', { category: 'drink', name: '咖啡', sentiment: 'like', note: '只喝美式' }, '2026-06-20'),
  sp(24, 'p3', { category: 'other', name: '推理小說', sentiment: 'love', detail: '東野圭吾', sourceContext: '讀書會選書時聊到' }, '2026-07-01'),
  sp(25, 'p4', { category: 'drink', name: '高山烏龍', sentiment: 'love', note: '回家帶一包就很開心' }, '2025-08-01'),
  sp(26, 'p4', { category: 'food', name: '重鹹料理', sentiment: 'hate', note: '血壓偏高,外食選清淡' }, '2025-08-01'),
  sp(27, 'p4', { category: 'hobby', name: '種花', sentiment: 'love', note: '陽台種了很多多肉' }, '2025-09-01'),
  sp(28, 'p5', { category: 'drink', name: '拿鐵(燕麥奶)', sentiment: 'love', note: '開會前可以順手幫帶' }, '2026-04-01'),
  sp(29, 'p5', { category: 'food', name: '香菜', sentiment: 'hate', note: '訂便當要注意' }, '2026-05-12'),
  sp(30, 'p6', { category: 'drink', name: '茶', sentiment: 'love', note: '偏好高山茶,拜訪可帶茶葉' }, '2025-12-20'),
  sp(31, 'p6', { category: 'food', name: '牛肉', sentiment: 'hate', note: '不吃牛,訂餐廳注意' }, '2025-07-01'),
  sp(32, 'p6', { category: 'hobby', name: '高爾夫', sentiment: 'love', note: '週六固定打球,聊這個很投緣' }, '2025-08-15'),
]

const sharedRelations: RelationPerson[] = [
  { id: 'r12', personId: 'p2', type: 'family', name: '小芸', role: '太太', traits: '去年結婚,同學會常一起來,喜歡貓' },
  { id: 'r13', personId: 'p3', type: 'friend', name: '讀書會的大家', role: '每月第二個週六', traits: '輪流選書,這個月輪到婷婷' },
  { id: 'r14', personId: 'p4', type: 'family', name: '爸爸', role: '爸爸', traits: '幫媽媽慶生通常由他訂位' },
  { id: 'r15', personId: 'p5', type: 'work', name: 'Kelly', role: '他的主管', traits: '週會在週一早上,需求要先跟她對齊' },
  { id: 'r10', personId: 'p6', type: 'work', name: 'Amy', role: '特助', traits: '行程都找她排,回訊息很快,記得節日問候' },
  { id: 'r11', personId: 'p6', type: 'work', name: '林副總', role: '決策者', traits: '最終簽核人,重數據,簡報要有 ROI', note: '別在他面前提競品 A 社' },
]

const sharedGifts: Gift[] = [
  { id: 'g10', personId: 'p2', direction: 'given', name: '精釀啤酒禮盒', date: '2025-11-02', occasion: '生日', reaction: '同學會上開來大家一起喝', price: 1200 },
  { id: 'g11', personId: 'p2', direction: 'wishlist', name: '籃球護膝', sourceContext: '自己說舊的鬆掉了' },
  { id: 'g12', personId: 'p3', direction: 'given', name: '東野圭吾新書', date: '2026-05-20', occasion: '生日', reaction: '說剛好還沒買', price: 450 },
  { id: 'g13', personId: 'p4', direction: 'given', name: '肩頸按摩枕', date: '2026-05-10', occasion: '母親節', reaction: '每天晚上都在用', price: 2400 },
  { id: 'g14', personId: 'p4', direction: 'wishlist', name: '園藝剪', sourceContext: '說舊的生鏽剪不動了', price: 600 },
  { id: 'g15', personId: 'p6', direction: 'given', name: '中秋禮盒(茶葉)', date: '2025-09-25', occasion: '中秋', reaction: '特助回訊說總監很喜歡', price: 3200 },
  { id: 'g16', personId: 'p6', direction: 'wishlist', name: '高爾夫手套(左手 24)', sourceContext: '球敘時提到舊的磨破了', price: 1800 },
]

function sharedAnniversaries(): Anniversary[] {
  return [
    { id: 'a10', personId: 'p2', title: '生日', date: '1998-11-02', recurring: true },
    { id: 'a11', personId: 'p3', title: '生日', date: '1996-05-20', recurring: true },
    { id: 'a12', personId: 'p4', title: '媽媽生日', date: momBirthday(), recurring: true, note: '訂她喜歡的清淡餐廳,全家一起吃' },
    { id: 'a13', personId: 'p5', title: '生日', date: '1995-08-20', recurring: true, note: '訂會議室慶生,揪整組' },
    { id: 'a14', personId: 'p6', title: '生日', date: '1972-10-25', recurring: true, note: '送禮走實用路線' },
    { id: 'a15', personId: 'p6', title: '簽約週年', date: '2025-11-20', recurring: true, note: 'Q4 續約前一個月開始準備' },
  ]
}

const sharedPromises: PromiseItem[] = [
  { id: 'pm12', personId: 'p2', content: '幫忙找同學會的燒肉店', completed: true, completedDate: rel(-2), note: '已訂好' },
  { id: 'pm13', personId: 'p3', content: '借的《白夜行》下次讀書會還', completed: false },
  { id: 'pm14', personId: 'p4', content: '教媽媽用手機視訊', completed: false },
  { id: 'pm15', personId: 'p5', content: '週五前回覆新功能提案意見', completed: false },
  { id: 'pm10', personId: 'p6', content: '下次拜訪帶新品 demo 和報價單', completed: false, note: '月底前' },
  { id: 'pm11', personId: 'p6', content: '介紹物流配合廠商', completed: true, completedDate: '2026-05-20', note: '已牽線,對方很滿意' },
]

function sharedItineraries(): Itinerary[] {
  return [
    {
      id: 'it2',
      personId: 'p2',
      date: rel(12),
      stops: [
        { id: 'its10', place: '大學同學會(燒肉店)', timeType: 'fixed', startTime: '19:00', note: '訂 10 位,阿凱負責找人' },
      ],
      createdAt: ts(rel(-2)),
      updatedAt: ts(rel(-2)),
    },
    {
      id: 'it3',
      personId: 'p4',
      date: rel(2),
      stops: [
        { id: 'its11', place: '回家吃飯', timeType: 'fixed', startTime: '18:00', note: '媽媽生日,帶蛋糕(少糖)' },
      ],
      createdAt: ts(rel(-1)),
      updatedAt: ts(rel(-1)),
    },
  ]
}
