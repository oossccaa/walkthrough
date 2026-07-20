// Google Drive 備份:GIS(Google Identity Services)取 token,
// 檔案存在 appDataFolder(隱藏應用程式資料夾,僅本 App 可見),scope 最小化。

const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const FILE_NAME = 'love-notes-backup.enc.json'
const API = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'

let gisLoaded: Promise<void> | null = null
let cachedToken: { token: string; expiresAt: number } | null = null

function loadGis(): Promise<void> {
  if (gisLoaded) return gisLoaded
  gisLoaded = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => { gisLoaded = null; reject(new Error('無法載入 Google 登入元件,請檢查網路')) }
    document.head.appendChild(s)
  })
  return gisLoaded
}

export async function getAccessToken(clientId: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.token
  await loadGis()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const google = (window as any).google
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp: { access_token?: string; expires_in?: number; error?: string }) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(`Google 授權失敗:${resp.error ?? '未取得權杖'}`))
          return
        }
        cachedToken = { token: resp.access_token, expiresAt: Date.now() + (resp.expires_in ?? 3600) * 1000 }
        resolve(resp.access_token)
      },
      error_callback: (err: { message?: string }) =>
        reject(new Error(`Google 授權失敗:${err?.message ?? '視窗被關閉'}`)),
    })
    client.requestAccessToken()
  })
}

async function driveFetch(token: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
  })
  if (!res.ok) throw new Error(`Drive API 錯誤(${res.status}):${(await res.text()).slice(0, 200)}`)
  return res
}

export interface BackupFileMeta { id: string; modifiedTime: string }

export async function findBackupFile(token: string): Promise<BackupFileMeta | null> {
  const q = encodeURIComponent(`name='${FILE_NAME}'`)
  const res = await driveFetch(
    token,
    `${API}/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&pageSize=1`,
  )
  const json = await res.json()
  return json.files?.[0] ?? null
}

export async function uploadBackup(token: string, content: string): Promise<BackupFileMeta> {
  const existing = await findBackupFile(token)
  if (existing) {
    await driveFetch(token, `${UPLOAD_API}/files/${existing.id}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: content,
    })
    return (await findBackupFile(token))!
  }
  const boundary = 'ln-backup-boundary'
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] }) +
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`
  await driveFetch(token, `${UPLOAD_API}/files?uploadType=multipart&fields=id,modifiedTime`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  })
  return (await findBackupFile(token))!
}

export async function downloadBackup(token: string, fileId: string): Promise<string> {
  const res = await driveFetch(token, `${API}/files/${fileId}?alt=media`)
  return res.text()
}
