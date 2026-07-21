# Tiedto

個人人脈筆記:依身份(對象/朋友/同事/家人)記錄每個人的喜好、紀念日、禮物、地點、約定與行程,見面前 30 秒速查。對象身份可記錄的模組最完整。

**隱私最高原則**:所有資料只存在你裝置的瀏覽器(IndexedDB),不上傳伺服器、不需帳號、無追蹤。備份走「本機 JSON 匯出」或「你自己的 Google Drive(客戶端加密)」。

## 開發

```bash
npm install
npm run dev      # 開發伺服器
npm run build    # 型別檢查 + 打包(含 PWA)
```

技術:React + Vite + TypeScript、Tailwind CSS v4、Dexie(IndexedDB)、date-fns、vite-plugin-pwa。

## 部署到 GitHub Pages

1. push 到 `main` 分支
2. GitHub repo → **Settings → Pages → Source** 選 **GitHub Actions**
3. [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 會自動 build 並部署到
   `https://oossccaa.github.io/walkthrough/`

> 換 repo 名稱時,記得同步改 [vite.config.ts](vite.config.ts) 的 `base`。

## Google Drive 加密備份設定(一次性)

備份檔在瀏覽器內先以你的密碼加密(PBKDF2 + AES-GCM),Drive 上只存密文,存放於僅本 App 可見的 appDataFolder。需要建立自己的 Google OAuth Client ID:

1. 到 [Google Cloud Console](https://console.cloud.google.com/) 建立專案
2. **API 和服務 → 程式庫**:啟用 **Google Drive API**
3. **API 和服務 → OAuth 同意畫面**:User Type 選「外部」,填 App 名稱;
   Scopes 加入 `.../auth/drive.appdata`;測試使用者加入自己的 Google 帳號
4. **API 和服務 → 憑證 → 建立憑證 → OAuth 用戶端 ID**:
   - 應用程式類型:**網頁應用程式**
   - 已授權的 JavaScript 來源加入:
     - `https://oossccaa.github.io`
     - `http://localhost:5173`(開發用)
5. 複製產生的 Client ID(`xxxx.apps.googleusercontent.com`),貼到 App 的 **設定 → Google Drive 加密備份**

之後在設定頁輸入備份密碼即可「立即備份 / 從備份還原」。**密碼忘記備份就解不開**,請記好。

多裝置使用方式:裝置 A 備份 → 裝置 B 還原(整份覆蓋,不做即時同步)。
