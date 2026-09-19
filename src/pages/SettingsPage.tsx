import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionCard, Field, inputCls, PrimaryButton, BottomSheet } from '../components/ui'
import { useApp } from '../store'
import { THEMES, THEME_KEYS } from '../theme'
import { useLocalStorage } from '../utils/useLocalStorage'
import { exportAll, importAll, type ExportBundle } from '../db/repo'
import { encryptString, decryptString } from '../backup/crypto'
import { getAccessToken, findBackupFile, uploadBackup, downloadBackup } from '../backup/drive'
import { notificationsEnabled, enableNotifications, REMIND_DAYS_AHEAD } from '../notify'

export function SettingsPage() {
  const { loadDemo, resetAll, persons, theme, setTheme } = useApp()

  return (
    <div className="space-y-4 pb-10">
      <header className="flex items-center gap-3 pt-2">
        <Link to="/" className="text-sm text-neutral-400">‹ 返回</Link>
        <h1 className="text-xl font-black">設定</h1>
      </header>

      <SectionCard title="主色系">
        <div className="flex flex-wrap items-center gap-3 py-1">
          {THEME_KEYS.map(k => (
            <button
              key={k}
              aria-label={THEMES[k].label}
              onClick={() => setTheme(k)}
              className={`h-9 w-9 rounded-full transition-transform ${
                theme === k ? 'scale-110 ring-2 ring-neutral-400 ring-offset-2' : ''
              }`}
              style={{ backgroundColor: THEMES[k].shades[400] }}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-neutral-400">目前:{THEMES[theme].label}(每個人也可以在編輯頁設定專屬色)</p>
      </SectionCard>

      <NotifySection />
      <LocalBackupSection />
      <DriveSection />

      <SectionCard title="示範資料">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { if (confirm('載入示範資料會覆蓋目前所有資料,確定?')) loadDemo() }}
            className="rounded-xl border border-neutral-200 bg-paper py-3 text-sm font-bold text-neutral-700 active:bg-neutral-50"
          >
            載入示範資料
          </button>
          <button
            onClick={() => { if (confirm('確定要清空所有資料與設定?此動作無法復原。')) resetAll() }}
            className="rounded-xl border border-danger-line bg-paper py-3 text-sm font-bold text-danger active:bg-danger-soft"
          >
            清空重來
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-400">目前對象數:{persons.length}</p>
      </SectionCard>

      <p className="px-2 text-center text-[11px] leading-relaxed text-neutral-400">
        本 App 不需帳號、不上傳任何伺服器、不含任何追蹤。
        <br />資料只存在你的裝置與你自己的 Google Drive。
      </p>
    </div>
  )
}

// ---- 提醒 ----

function NotifySection() {
  const [enabled, setEnabled] = useState(notificationsEnabled())

  const toggle = async () => {
    if (enabled) {
      alert('要關閉通知,請在瀏覽器的網站設定中封鎖通知權限。')
      return
    }
    const ok = await enableNotifications()
    setEnabled(ok)
    if (!ok) alert('未取得通知權限。若先前拒絕過,需到瀏覽器網站設定中重新允許。')
  }

  return (
    <SectionCard title="到期提醒" subtitle={`紀念日前 ${REMIND_DAYS_AHEAD} 天與行程當天,開啟 App 時會在畫面顯示`}>
      <div className="flex items-center justify-between py-1">
        <div className="pr-4">
          <p className="text-sm font-medium">瀏覽器通知</p>
          <p className="text-xs text-neutral-400">額外發系統通知(每項每天一次)</p>
        </div>
        <Toggle on={enabled} onToggle={toggle} />
      </div>
    </SectionCard>
  )
}

// ---- 本機 JSON 匯出 / 匯入 ----

function LocalBackupSection() {
  const fileRef = useRef<HTMLInputElement>(null)

  const doExport = async () => {
    const bundle = await exportAll()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `love-notes-${bundle.exportedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const doImport = async (file: File) => {
    try {
      const bundle = JSON.parse(await file.text()) as ExportBundle
      if (!confirm(`匯入「${file.name}」會整份覆蓋目前資料,確定?`)) return
      await importAll(bundle)
      alert('匯入完成')
    } catch (e) {
      alert(e instanceof Error ? e.message : '匯入失敗:檔案格式不正確')
    }
  }

  return (
    <SectionCard title="本機備份" subtitle="所有資料只存在這台裝置的瀏覽器裡">
      <div className="grid grid-cols-2 gap-3">
        <button onClick={doExport} className="rounded-xl border border-neutral-200 bg-paper py-3 text-sm font-bold text-neutral-700 active:bg-neutral-50">
          匯出 JSON
        </button>
        <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-neutral-200 bg-paper py-3 text-sm font-bold text-neutral-700 active:bg-neutral-50">
          匯入 JSON
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) doImport(f)
          e.target.value = ''
        }}
      />
    </SectionCard>
  )
}

// ---- Google Drive 加密備份 ----

function DriveSection() {
  const [clientId, setClientId] = useLocalStorage('ln:gclientId', '')
  const [lastBackup, setLastBackup] = useLocalStorage<string | null>('ln:lastBackup', null)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState<'backup' | 'restore' | null>(null)
  const [message, setMessage] = useState('')

  const guard = (): boolean => {
    if (!clientId.trim()) {
      alert('請先填入 Google OAuth Client ID(設定方式見專案 README)')
      return false
    }
    if (!password) {
      alert('請輸入備份密碼')
      return false
    }
    return true
  }

  const doBackup = async () => {
    if (!guard()) return
    setBusy('backup')
    setMessage('')
    try {
      const token = await getAccessToken(clientId.trim())
      const bundle = await exportAll()
      const encrypted = await encryptString(JSON.stringify(bundle), password)
      const meta = await uploadBackup(token, encrypted)
      setLastBackup(meta.modifiedTime)
      setMessage('備份完成')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '備份失敗')
    } finally {
      setBusy(null)
    }
  }

  const doRestore = async () => {
    if (!guard()) return
    setBusy('restore')
    setMessage('')
    try {
      const token = await getAccessToken(clientId.trim())
      const file = await findBackupFile(token)
      if (!file) {
        setMessage('Drive 上找不到備份檔')
        return
      }
      if (!confirm(`找到 ${new Date(file.modifiedTime).toLocaleString()} 的備份,還原會整份覆蓋目前資料,確定?`)) return
      const encrypted = await downloadBackup(token, file.id)
      const plain = await decryptString(encrypted, password)
      await importAll(JSON.parse(plain))
      setMessage('還原完成')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '還原失敗')
    } finally {
      setBusy(null)
    }
  }

  return (
    <SectionCard
      title="Google Drive 加密備份"
      subtitle="備份前先在你的裝置上加密,Drive 只存密文,Google 也看不到內容"
    >
      <div className="space-y-3">
        <Field label="Google OAuth Client ID">
          <input
            className={inputCls}
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="xxxx.apps.googleusercontent.com"
          />
        </Field>
        <Field label="備份密碼(用來加密,忘記就救不回來)">
          <input
            type="password"
            className={inputCls}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <PrimaryButton onClick={doBackup} className={busy ? 'opacity-50' : ''}>
            {busy === 'backup' ? '備份中…' : '立即備份'}
          </PrimaryButton>
          <button
            onClick={doRestore}
            disabled={busy != null}
            className="rounded-xl border border-accent-200 py-3 text-sm font-bold text-accent-600 active:bg-accent-50 disabled:opacity-50"
          >
            {busy === 'restore' ? '還原中…' : '從備份還原'}
          </button>
        </div>
        {message && <p className="text-xs font-medium text-accent-700">{message}</p>}
        {lastBackup && (
          <p className="text-xs text-neutral-400">上次備份:{new Date(lastBackup).toLocaleString()}</p>
        )}
      </div>
    </SectionCard>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle?: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${on ? 'bg-accent-500' : 'bg-neutral-200'}`}
      role="switch"
      aria-checked={on}
    >
      <div className={`h-5 w-5 rounded-full bg-paper shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}
