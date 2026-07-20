# CLAUDE.md — 戀愛攻略筆記 Web App

## 專案概述

一個「個人版戀愛 CRM」web app,用來記錄曖昧對象/女友的喜好、重要人物、紀念日、禮物與約定,幫助使用者在約會前快速回顧關鍵資訊。

**核心價值:約會前 30 秒速查,不再忘記她說過的話。**

**隱私是最高原則**:所有資料只存在使用者本地(localStorage 或 IndexedDB),不上傳任何伺服器、不需要帳號、不接任何第三方分析。

## 技術選型

- 前端框架:React + Vite(或 Next.js static export,擇一,以簡單為主)
- 樣式:Tailwind CSS
- 儲存策略:**本地為主 + 使用者自己的雲端備份**
  - 主儲存:IndexedDB(用 Dexie.js 封裝),所有讀寫都走本地
  - 備份:匯出加密後的 JSON 到使用者自己的 Google Drive(Phase 2/3 實作,見下方)
  - 不做即時同步;多裝置以「備份 → 還原」方式處理,大幅降低複雜度
- 不需要自架後端、不需要資料庫伺服器
- 需支援手機瀏覽器(mobile-first 設計,主要使用情境是出門前/約會中偷看手機)
- 加分項:PWA(可加到主畫面、離線可用)
- 加分項:資料匯出/匯入(JSON 檔),讓使用者自行備份

## 資料模型

### Person(對象)
支援多位對象(曖昧期可能同時進行多條線)。

```
Person {
  id: string
  name: string
  nickname?: string
  birthday?: date
  metAt?: { date: date, place?: string, story?: string }  // 認識的日期與場合
  status: 'crush' | 'ambiguous' | 'dating' | 'archived'    // 單戀 / 曖昧 / 交往 / 封存
  statusHistory: [{ status, date }]                        // 狀態變更紀錄
  avatar?: string (本地圖片, base64 或 blob)
  notes?: string
  createdAt, updatedAt
}
```

### Preference(喜好)
```
Preference {
  id: string
  personId: string
  category: 'food' | 'drink' | 'alcohol' | 'music' | 'movie_tv' |
            'character' | 'idol' | 'hobby' | 'other'
  name: string                        // 例:香菜、威士忌、進擊的巨人
  sentiment: 'love' | 'like' | 'dislike' | 'hate'
  note?: string                       // 例:「不吃香菜但可接受九層塔」「只喝 highball 不喝純飲」
  detail?: string                     // 最喜歡的角色、專輯等子項目
  sourceContext?: string              // 她什麼時候/什麼情境提到的
  createdAt, updatedAt
}
```

### Place(地點)
```
Place {
  id: string
  personId: string
  name: string
  type: 'visited' | 'she_wants_to_go' | 'promised_together'
  // visited: 她去過的 / promised_together: 約定好要一起去的
  date?: date                         // 去過的日期
  completed?: boolean                 // 約定地點達成後打勾
  completedDate?: date                // 達成後自動轉為共同回憶
  note?: string
}
```

### Relationship(人物關係)
```
RelationPerson {
  id: string
  personId: string
  type: 'family' | 'friend' | 'ex'
  name: string
  role?: string                       // 例:媽媽、妹妹、閨蜜、大學同學
  traits?: string                     // 特徵備註,見面前速查用
  // 以下僅 type = 'ex' 使用:
  datingStart?: date
  datingEnd?: date
  // UI 需自動計算並顯示交往長度
  note?: string                       // 分手原因、地雷話題等
}
```

### Gift(禮物)
```
Gift {
  id: string
  personId: string
  direction: 'given' | 'wishlist'     // 送過的 / 她想要的
  name: string
  date?: date                         // 送出日期
  occasion?: string                   // 生日、聖誕節、道歉…
  reaction?: string                   // 她的反應
  price?: number
  sourceContext?: string              // wishlist 用:她何時、什麼情境提到想要
  purchased?: boolean                 // wishlist 已買待送
}
```

### Anniversary(紀念日)
```
Anniversary {
  id: string
  personId: string
  title: string                       // 例:第一次見面、第一次牽手、在一起紀念日
  date: date
  recurring: boolean                  // 是否每年提醒
  note?: string
}
```
- 提供常用「第一次___」快速範本:第一次見面、第一次約會、第一次牽手、第一次接吻、在一起、第一次旅行
- 顯示距今天數 / 下次週年倒數
- 交往中對象顯示「在一起 N 天」

### Promise(約定清單)
```
Promise {
  id: string
  personId: string
  content: string                     // 以後要一起做的事
  completed: boolean
  completedDate?: date
  note?: string
}
```
- 類似共同 bucket list,完成後轉為回憶區顯示

## 功能規劃(分三期)

### Phase 1 — MVP
1. 對象管理:新增/編輯/切換對象,狀態管理
2. 喜好庫:分類瀏覽 + 新增,依 sentiment 標色(超愛/喜歡/不喜歡/地雷)
3. 紀念日:清單 + 倒數 + 「第一次___」範本
4. 資料持久化(IndexedDB)+ JSON 匯出/匯入

### Phase 2
5. 地點模組(去過/想去/約定,約定完成轉回憶)
6. 禮物模組(送過 + 願望清單)
7. 人物關係(家人/朋友/前任,前任自動算交往長度)

### Phase 3
8. **約會前速查卡(殺手級功能)**:一鍵顯示單一對象的——
   - 飲食地雷(dislike/hate 的食物飲品)
   - 最近新增的喜好與她提過想要的禮物
   - 最近的紀念日倒數
   - 重要人物小抄(閨蜜名字、地雷話題)
9. 約定清單(bucket list)
10. 時間軸視圖:把紀念日、去過的地點、送過的禮物依時間排列成關係大事記
11. PWA 支援
12. **Google Drive 加密備份**:
    - 使用 Google Drive API + OAuth(僅要求 `drive.appDataFolder` 或 `drive.file` 最小權限)
    - 備份前先以使用者設定的密碼在客戶端加密(Web Crypto API,AES-GCM + PBKDF2 派生金鑰),Drive 上只存密文
    - 提供「立即備份」與「從備份還原」兩個動作;可選每次關閉前提醒備份
    - 還原採整份覆蓋(以 updatedAt 提示使用者哪份較新),不做欄位級合併

## UI/UX 原則

- Mobile-first,單手可操作
- 首頁 = 對象列表(或單一對象時直接進入該對象主頁)
- 對象主頁用 tab 或卡片分區:喜好 / 地點 / 人物 / 禮物 / 紀念日 / 約定
- 新增資料要快:常用項目提供快速範本與 chip 選擇,少打字
- 敏感 app,加分項:可設定 PIN 碼鎖或偽裝入口
- 語言:繁體中文介面

## 開發約定

- 元件放 `src/components/`,依模組分資料夾
- 資料層統一封裝在 `src/db/`(Dexie schema + CRUD hooks)
- 型別定義集中在 `src/types.ts`
- 日期處理用 date-fns
- 先寫 Phase 1,確認可用後再往下做

## 明確不做的事

- 不做帳號系統、不做即時雲端同步(僅做使用者自己 Google Drive 的加密備份/還原)
- 不把資料存到任何第三方後端(Supabase / Firebase 等一律不用)
- 不接任何 analytics / tracking
- 不做社群或分享功能(這是私人筆記)