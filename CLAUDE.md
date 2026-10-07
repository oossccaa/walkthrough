# CLAUDE.md — Tiedto 個人 CRM

## 專案概述

**Tiedto** 是一個「個人 CRM」web app:依身份(對象 / 朋友 / 同事 / 客戶 / 家人)記錄生活與工作中重要的人——喜好、關鍵人物、重要日子、禮物、承諾與行程,幫助使用者在見面前快速回顧關鍵資訊。

**核心價值:見面前 30 秒速查,不再忘記對方說過的話、答應過的事。**

**隱私是最高原則**:所有資料只存在使用者本地(IndexedDB),不上傳任何伺服器、不需要帳號、不接任何第三方分析。

> 本專案前身是「戀愛攻略筆記」,已轉型為通用個人 CRM。
> - **「對象(partner)」的功能全部保留,且仍是模組最完整的身份**:地點(去過 / 想去 / 約好一起去)、前任與交往長度、紀念日「第一次___」範本、「在一起 N 天」、約定清單、約會行程等,升級時不可刪減或弱化。
> - 其他身份(朋友 / 家人 / 同事 / 客戶)一律開放同一組模組、換成中性用詞,只有對象多「地點」;不是把對象功能改掉。
> - 共用的文案與預設保持中性,不預設性別;戀愛專屬用詞只出現在對象身份。

## 技術選型(已實作)

- React 19 + Vite 6 + TypeScript
- Tailwind CSS v4(`@tailwindcss/vite`)
- 路由:react-router-dom v7,使用 `HashRouter`(GitHub Pages 無 SPA fallback)
- 儲存:IndexedDB,用 Dexie 4 + `dexie-react-hooks`(`useLiveQuery`)
- 日期:date-fns,所有日期一律存 ISO 字串(`yyyy-MM-dd` 或完整 ISO)
- PWA:vite-plugin-pwa(可加到主畫面、離線可用)
- 部署:GitHub Pages(`.github/workflows/deploy.yml`),`vite.config.ts` 的 `base` 需與 repo 名一致
- 不需要自架後端、不需要資料庫伺服器
- Mobile-first(容器 `max-w-md`),主要使用情境是出門前 / 見面中偷看手機

指令:`npm run dev`、`npm run build`(含 `tsc --noEmit` 型別檢查)。

## 核心概念:身份(Role)驅動模組

每個人都有一個 `role`,新增時先選身份,身份決定該人可用的模組與文案。設定集中在 [src/labels.ts](src/labels.ts):

| 身份 | key | 可用模組(`ROLE_MODULES`) |
|---|---|---|
| 對象 | `partner` | 速查、喜好、地點、人物、禮物、紀念日、約定(最完整) |
| 朋友 / 家人 / 同事 / 客戶 | `friend` / `family` / `coworker` / `client` | 速查、喜好、人物、禮物、重要日子、承諾(全部相同,`COMMON_MODULES`;可記公司/職稱) |

相關對照表(新增身份時都要一起補):
- `ROLE_LABEL` / `ROLE_STYLE` / `ROLE_ORDER` / `ROLE_HINT`
- `ROLE_MODULES`:該身份顯示哪些 tab
- `ROLE_RELATION_TYPES`:人物 tab 可選的關係類型(非對象身份類型相同,只差排序)
- `ROLE_ANNIVERSARY_TEMPLATES`:重要日子快速範本
- 文案依身份切換:對象用「紀念日 / 約定」,其他身份用「重要日子 / 承諾」(見 `PersonPage` 的 `tabLabel`、`QuickCard`)
- 顏色收斂:只有「對象」用主色,其餘身份標籤用中性灰

## 資料模型

型別集中在 [src/types.ts](src/types.ts),以該檔為準。摘要:

- **Person**:`name`、`nickname?`、`birthday?`、`metAt?{date,place,story}`、`role`、`company?`、`jobTitle?`、`color?`(個人主題色 key)、`avatar?`、`notes?`、`createdAt`、`updatedAt`
- **Preference**:`category`(food / drink / alcohol / music / movie_tv / character / idol / hobby / other)、`name`、`sentiment`(love / like / dislike / hate)、`note?`、`detail?`、`sourceContext?`
- **Place**:`type`(visited / she_wants_to_go / promised_together)、`date?`、`completed?`、`completedDate?`、`note?`
- **RelationPerson**:`type`(family / friend / ex / work)、`name`、`role?`、`traits?`、`datingStart?` / `datingEnd?`(僅 ex,UI 自動算交往長度)、`note?`
- **Gift**:`direction`(given / wishlist)、`date?`、`occasion?`、`reaction?`、`price?`、`sourceContext?`、`purchased?`
- **Anniversary**:`title`、`date`、`recurring`、`note?`;顯示距今天數 / 下次週年倒數;對象若有含「在一起」的紀念日,主頁顯示「在一起 N 天」
- **PromiseItem**:`content`、`completed`、`completedDate?`、`note?`
- **Itinerary**:`personId?`、`date`、`stops: ItineraryStop[]`(`place`、`timeType: range | fixed`、`startTime?`、`endTime?`、`note?`);一天一份行程,從全域 FAB 新增

### 歷史包袱(勿隨意改名)
- Dexie 資料庫名稱仍是 `'love-notes'`、class 名 `LoveDB`;改名會讓既有使用者資料「消失」,不要動
- `PlaceType` 的 `'she_wants_to_go'` 是舊命名,畫面顯示為「想去」;要改需寫 Dexie migration
- localStorage key 前綴為 `ln:`
- Schema 變更一律新增 `this.version(n)` + `upgrade()`,不要修改舊版本定義(v2 已將 `status/statusHistory` 遷移為 `role`)

## 已完成功能

- 名冊首頁:多人列表,依身份分組
- 人物主頁:依身份顯示 tab,個人專屬主題色(離開頁面還原全域主題)
- 速查卡(`QuickCard`):下一次行程、未完成承諾、飲食地雷、最近喜好、送禮靈感、重要日子倒數、重要人物小抄
- 喜好 / 地點 / 人物 / 禮物 / 紀念日 / 約定 各模組 CRUD
- 行程規劃(`ItineraryFab`)
- 到期提醒(`src/notify.ts`):重要日子前 3 天、行程今明兩天;畫面橫幅 + 可選瀏覽器通知(每項每天一次)
- 主題:20 種色系(全域 + 每人)
- 本機 JSON 匯出 / 匯入(整份覆蓋)
- Google Drive 加密備份(`src/backup/`):Web Crypto PBKDF2 + AES-GCM,只存 `drive.appdata`,整份覆蓋還原
- 示範資料(`src/mock.ts`):分男生 / 女生視角兩版,只差「對象」;朋友男女各一且為團體情境,示範內容須正派,不能有「攻略」感
- PWA

## 規劃中(個人 CRM 升級方向)

實作前先與使用者確認範圍與優先順序:

1. **互動紀錄**:記錄每次見面 / 通話 / 訊息(日期、管道、摘要),人物主頁顯示「上次聯絡 N 天前」
2. **聯絡頻率提醒**:可為每個人設定期望聯絡週期(例:客戶每月、朋友每季),逾期列入提醒
3. **全域搜尋**:跨人物搜尋喜好、人物小抄、備註
4. **標籤**:人物自訂標籤(例:大學同學、A 專案),名冊可依標籤篩選
5. **時間軸視圖**:把重要日子、去過的地點、送過的禮物、互動紀錄依時間排列成關係大事記
6. **PIN 碼鎖 / 偽裝入口**(加分項)

新增模組時:型別加到 `types.ts` → Dexie 新版本 + 加入 `ALL_TABLES`(匯出 / 匯入 / 備份才會帶到)→ `labels.ts` 的 `ModuleKey` 與 `ROLE_MODULES` → `PersonPage` tab → 視需要加到 `QuickCard` 與 `notify.ts`。

## UI/UX 原則

- Mobile-first,單手可操作
- 首頁 = 名冊(依身份分組),一律多人模式
- 新增資料要快:常用項目提供快速範本與 chip 選擇,少打字(共用元件見 [src/components/ui.tsx](src/components/ui.tsx):`SectionCard`、`Chip`、`BottomSheet`、`Field` 等)
- 文案性別中性,依身份切換用詞
- 語言:繁體中文介面

## 開發約定

- 元件放 `src/components/`,依模組分資料夾;頁面放 `src/pages/`
- 資料層統一封裝在 `src/db/`(`db.ts` schema、`repo.ts` CRUD)
- 型別定義集中在 `src/types.ts`;身份 / 分類的標籤與對照表集中在 `src/labels.ts`
- 日期處理用 date-fns,共用函式在 `src/utils/dates.ts`
- 主題色系在 `src/theme.ts`

## 明確不做的事

- 不做帳號系統、不做即時雲端同步(僅做使用者自己 Google Drive 的加密備份 / 還原,多裝置以「備份 → 還原」處理)
- 不把資料存到任何第三方後端(Supabase / Firebase 等一律不用)
- 不接任何 analytics / tracking
- 不做社群或分享功能(這是私人筆記)
