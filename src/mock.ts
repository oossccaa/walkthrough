// 示範資料:從設定頁或 onboarding 可一鍵載入(整份覆蓋)
import type {
  Person, Preference, Place, RelationPerson, Gift, Anniversary, PromiseItem, Itinerary,
} from './types'
import type { ExportBundle } from './db/repo'

export function mockBundle(): ExportBundle {
  return {
    app: 'love-notes',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      persons: mockPersons,
      preferences: mockPreferences,
      places: mockPlaces,
      relations: mockRelations,
      gifts: mockGifts,
      anniversaries: mockAnniversaries,
      promises: mockPromises,
      itineraries: mockItineraries,
    },
  }
}

export const mockPersons: Person[] = [
  {
    id: 'p1',
    name: '小雨',
    nickname: '雨寶',
    birthday: '1999-03-14',
    metAt: { date: '2025-09-20', place: '朋友生日聚會', story: '共同朋友阿凱的生日局,坐隔壁聊了一整晚' },
    status: 'dating',
    color: 'rose',
    statusHistory: [
      { status: 'ambiguous', date: '2025-10-05' },
      { status: 'dating', date: '2025-12-24' },
    ],
    notes: '怕冷,出門要提醒她帶外套',
    createdAt: '2025-09-21T10:00:00Z',
    updatedAt: '2026-07-18T10:00:00Z',
  },
  {
    id: 'p2',
    name: '婷婷',
    birthday: '2000-11-02',
    metAt: { date: '2026-05-10', place: '健身房團課' },
    status: 'ambiguous',
    color: 'violet',
    statusHistory: [{ status: 'ambiguous', date: '2026-06-01' }],
    createdAt: '2026-05-11T10:00:00Z',
    updatedAt: '2026-07-10T10:00:00Z',
  },
]

export const mockPreferences: Preference[] = [
  { id: 'pref1', personId: 'p1', category: 'food', name: '香菜', sentiment: 'hate', note: '完全不行,聞到就想吐;九層塔可以', sourceContext: '第一次吃越南河粉時說的', createdAt: '2025-10-01T00:00:00Z', updatedAt: '2025-10-01T00:00:00Z' },
  { id: 'pref2', personId: 'p1', category: 'food', name: '生魚片', sentiment: 'love', note: '尤其是鮭魚肚', createdAt: '2025-10-12T00:00:00Z', updatedAt: '2025-10-12T00:00:00Z' },
  { id: 'pref3', personId: 'p1', category: 'food', name: '辣', sentiment: 'dislike', note: '小辣勉強可以,不要主動點辣的', createdAt: '2025-11-02T00:00:00Z', updatedAt: '2025-11-02T00:00:00Z' },
  { id: 'pref4', personId: 'p1', category: 'drink', name: '黑糖鮮奶', sentiment: 'love', note: '微糖少冰,不加珍珠', sourceContext: '每次經過老虎堂都會買', createdAt: '2025-10-20T00:00:00Z', updatedAt: '2025-10-20T00:00:00Z' },
  { id: 'pref5', personId: 'p1', category: 'alcohol', name: '威士忌', sentiment: 'like', note: '只喝 highball,不喝純飲', createdAt: '2025-12-05T00:00:00Z', updatedAt: '2025-12-05T00:00:00Z' },
  { id: 'pref6', personId: 'p1', category: 'movie_tv', name: '進擊的巨人', sentiment: 'love', detail: '最喜歡里維,別說壞話', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
  { id: 'pref7', personId: 'p1', category: 'idol', name: 'NewJeans', sentiment: 'love', detail: '本命是 Hanni', sourceContext: '演唱會搶不到票超難過(2026/04)', createdAt: '2026-04-10T00:00:00Z', updatedAt: '2026-04-10T00:00:00Z' },
  { id: 'pref8', personId: 'p1', category: 'hobby', name: '拼圖', sentiment: 'like', note: '家裡有一面拼圖牆', createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-02-20T00:00:00Z' },
  { id: 'pref9', personId: 'p1', category: 'music', name: '爵士', sentiment: 'dislike', note: '覺得想睡,約會別選爵士酒吧', createdAt: '2026-03-08T00:00:00Z', updatedAt: '2026-03-08T00:00:00Z' },
  { id: 'pref10', personId: 'p2', category: 'food', name: '甜點', sentiment: 'love', note: '千層蛋糕控', createdAt: '2026-06-05T00:00:00Z', updatedAt: '2026-06-05T00:00:00Z' },
  { id: 'pref11', personId: 'p2', category: 'drink', name: '美式咖啡', sentiment: 'like', note: '健身完會喝', createdAt: '2026-06-20T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z' },
]

export const mockPlaces: Place[] = [
  { id: 'pl1', personId: 'p1', name: '象山步道', type: 'visited', date: '2025-11-15', note: '她說夜景很美,但下次別穿裙子來' },
  { id: 'pl2', personId: 'p1', name: '嵐山竹林(京都)', type: 'she_wants_to_go', note: 'IG 看到就一直想去' },
  { id: 'pl3', personId: 'p1', name: '澎湖看花火節', type: 'promised_together', note: '說好 2027 春天去' },
  { id: 'pl4', personId: 'p1', name: '陽明山擎天崗', type: 'promised_together', completed: true, completedDate: '2026-04-05', note: '野餐日,超成功' },
  { id: 'pl5', personId: 'p2', name: '大稻埕河岸咖啡', type: 'she_wants_to_go' },
]

export const mockRelations: RelationPerson[] = [
  { id: 'r1', personId: 'p1', type: 'family', name: '林媽媽', role: '媽媽', traits: '很重視禮貌,見面要帶伴手禮(不吃甜)' },
  { id: 'r2', personId: 'p1', type: 'family', name: '小妹', role: '妹妹', traits: '大學生,追星同好,好相處' },
  { id: 'r3', personId: 'p1', type: 'friend', name: 'Peggy', role: '閨蜜', traits: '講話直,對我還在觀察期,務必打好關係' },
  { id: 'r4', personId: 'p1', type: 'ex', name: '阿哲', role: '大學學長', datingStart: '2021-02-14', datingEnd: '2023-08-01', note: '劈腿分手。地雷話題:別提他、別提登山社' },
  { id: 'r5', personId: 'p2', type: 'friend', name: '教練 Ken', role: '健身教練', traits: '常一起上課,話題人物' },
]

export const mockGifts: Gift[] = [
  { id: 'g1', personId: 'p1', direction: 'given', name: '香氛蠟燭(木質調)', date: '2025-12-24', occasion: '在一起紀念', reaction: '超喜歡,放在床頭每天點', price: 1280 },
  { id: 'g2', personId: 'p1', direction: 'given', name: 'NewJeans 小卡保護殼', date: '2026-03-14', occasion: '白色情人節', reaction: '尖叫,發限動', price: 450 },
  { id: 'g3', personId: 'p1', direction: 'wishlist', name: 'Loewe 小方包(奶油白)', sourceContext: '2026/06 逛街時盯著看很久', price: 68000 },
  { id: 'g4', personId: 'p1', direction: 'wishlist', name: '拼圖架', sourceContext: '說桌子不夠大,拼圖都拼不完', purchased: true, price: 1500 },
  { id: 'g5', personId: 'p2', direction: 'wishlist', name: '運動耳機', sourceContext: '抱怨舊的一直掉' },
]

export const mockAnniversaries: Anniversary[] = [
  { id: 'a1', personId: 'p1', title: '第一次見面', date: '2025-09-20', recurring: true },
  { id: 'a2', personId: 'p1', title: '第一次約會', date: '2025-10-18', recurring: false, note: '大稻埕看夕陽' },
  { id: 'a3', personId: 'p1', title: '在一起', date: '2025-12-24', recurring: true, note: '平安夜告白成功' },
  { id: 'a4', personId: 'p1', title: '她的生日', date: '1999-03-14', recurring: true, note: '想要儀式感,提早訂餐廳' },
  { id: 'a5', personId: 'p2', title: '第一次見面', date: '2026-05-10', recurring: true },
]

export const mockItineraries: Itinerary[] = [
  {
    id: 'it1',
    personId: 'p1',
    date: '2026-07-25',
    stops: [
      { id: 'its1', place: '大稻埕碼頭', timeType: 'range', startTime: '16:00', endTime: '18:00', note: '租 YouBike 沿河騎' },
      { id: 'its2', place: '夏日食堂', timeType: 'fixed', startTime: '18:30', note: '訂位 2 位,靠窗' },
      { id: 'its3', place: '河岸酒吧', timeType: 'range', startTime: '20:00', endTime: '22:00', note: '她只喝 highball' },
    ],
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'it2',
    personId: 'p2',
    date: '2026-08-02',
    stops: [
      { id: 'its4', place: '健身房團課', timeType: 'fixed', startTime: '10:00' },
      { id: 'its5', place: '大稻埕河岸咖啡', timeType: 'range', startTime: '11:30', endTime: '13:00', note: '她一直想去的那間' },
    ],
    createdAt: '2026-07-18T10:00:00Z',
    updatedAt: '2026-07-18T10:00:00Z',
  },
]

export const mockPromises: PromiseItem[] = [
  { id: 'pm1', personId: 'p1', content: '一起去日本跨年', completed: false },
  { id: 'pm2', personId: 'p1', content: '學會做她愛吃的親子丼', completed: true, completedDate: '2026-05-02', note: '她說比店裡好吃(客套也開心)' },
  { id: 'pm3', personId: 'p1', content: '拼完 2000 片的星空拼圖', completed: false },
  { id: 'pm4', personId: 'p2', content: '一起參加半馬', completed: false },
]
