import { useRef, useState, type ReactNode } from 'react'
import { SectionCard, Field, inputCls, PrimaryButton, BackButton, Modal } from '../components/ui'
import { useToast } from '../components/toast'
import { DEMO_VARIANT_LABEL, type DemoVariant } from '../mock'
import { useApp } from '../store'
import { THEMES, THEME_KEYS } from '../theme'
import { useLocalStorage } from '../utils/useLocalStorage'
import { exportAll, importAll, type ExportBundle } from '../db/repo'
import { encryptString, decryptString } from '../backup/crypto'
import { getAccessToken, findBackupFile, uploadBackup, downloadBackup } from '../backup/drive'
import { notificationsEnabled, enableNotifications, REMIND_DAYS_AHEAD } from '../notify'

export function SettingsPage() {
  const { loadDemo, resetAll, persons, theme, setTheme } = useApp()
  const toast = useToast()

  return (
    <div className="space-y-4 pb-10">
      <header className="flex items-center gap-3 pt-2">
        <BackButton />
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
        <p className="mt-1 text-xs text-neutral-500">目前:{THEMES[theme].label}(每個人也可以在編輯頁設定專屬色)</p>
      </SectionCard>

      <NotifySection />
      <LocalBackupSection />
      <DriveSection />

      <SectionCard title="示範資料" subtitle="兩版只差「對象」那一位,其他人都一樣">
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(DEMO_VARIANT_LABEL) as DemoVariant[]).map(v => (
            <button
              key={v}
              onClick={async () => {
                if (!confirm(`載入示範資料(${DEMO_VARIANT_LABEL[v]})會覆蓋目前所有資料,確定?`)) return
                await loadDemo(v)
                toast(`已載入示範資料(${DEMO_VARIANT_LABEL[v]})`)
              }}
              className="rounded-xl border border-neutral-200 bg-paper py-3 text-sm font-bold text-neutral-700 active:bg-neutral-50"
            >
              示範:{DEMO_VARIANT_LABEL[v]}
            </button>
          ))}
          <button
            onClick={async () => {
              if (!confirm('確定要清空所有資料?此動作無法復原,建議先匯出備份。')) return
              await resetAll()
              toast('已清空所有資料')
            }}
            className="col-span-2 rounded-xl border border-danger-line bg-paper py-3 text-sm font-bold text-danger active:bg-danger-soft"
          >
            清空重來
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">目前人數:{persons.length}</p>
      </SectionCard>

      <p className="px-2 text-center text-[11px] leading-relaxed text-neutral-500">
        本 App 不需帳號、不上傳任何伺服器、不含任何追蹤。
        <br />資料只存在你的裝置與你自己的 Google Drive。
      </p>
    </div>
  )
}

// ---- 提醒 ----

function NotifySection() {
  const [enabled, setEnabled] = useState(notificationsEnabled())
  const toast = useToast()

  const toggle = async () => {
    if (enabled) {
      toast('要關閉通知,請在瀏覽器的網站設定中封鎖通知權限。')
      return
    }
    const ok = await enableNotifications()
    setEnabled(ok)
    if (ok) toast('已開啟瀏覽器通知')
    else toast('未取得通知權限。若先前拒絕過,需到瀏覽器網站設定中重新允許。', { tone: 'error' })
  }

  return (
    <SectionCard title="到期提醒" subtitle={`重要日子前 ${REMIND_DAYS_AHEAD} 天、今明兩天的行程,開啟 App 時會在畫面顯示`}>
      <div className="flex items-center justify-between py-1">
        <div className="pr-4">
          <p className="text-sm font-medium">瀏覽器通知</p>
          <p className="text-xs text-neutral-500">額外發系統通知(每項每天一次)</p>
        </div>
        <Toggle on={enabled} onToggle={toggle} />
      </div>
    </SectionCard>
  )
}

// ---- 本機 JSON 匯出 / 匯入 ----

function LocalBackupSection() {
  const fileRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const doExport = async () => {
    const bundle = await exportAll()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    // 檔名不透露用途(手機下載資料夾一眼看得到);檔案內容格式不變,舊備份照樣能匯入
    a.download = `tiedto-backup-${bundle.exportedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast('已匯出備份檔')
  }

  const doImport = async (file: File) => {
    try {
      const bundle = JSON.parse(await file.text()) as ExportBundle
      if (!confirm(`匯入「${file.name}」會整份覆蓋目前資料,確定?`)) return
      await importAll(bundle)
      toast('匯入完成')
    } catch (e) {
      const msg = e instanceof SyntaxError ? '這不是有效的備份檔(JSON 格式錯誤)' : e instanceof Error ? e.message : '檔案格式不正確'
      toast(`匯入失敗:${msg}`, { tone: 'error' })
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
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null)
  const [tried, setTried] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const setError = (e: unknown, fallback: string) =>
    setMessage({ text: e instanceof Error ? e.message : fallback, tone: 'error' })

  const guard = (): boolean => {
    if (!clientId.trim() || !password) {
      setTried(true)
      return false
    }
    return true
  }

  const doBackup = async () => {
    if (!guard()) return
    setBusy('backup')
    setMessage(null)
    try {
      const token = await getAccessToken(clientId.trim())
      const bundle = await exportAll()
      const encrypted = await encryptString(JSON.stringify(bundle), password)
      const meta = await uploadBackup(token, encrypted)
      setLastBackup(meta.modifiedTime)
      setMessage({ text: '備份完成', tone: 'ok' })
    } catch (e) {
      setError(e, '備份失敗,請稍後再試')
    } finally {
      setBusy(null)
    }
  }

  const doRestore = async () => {
    if (!guard()) return
    setBusy('restore')
    setMessage(null)
    try {
      const token = await getAccessToken(clientId.trim())
      const file = await findBackupFile(token)
      if (!file) {
        setMessage({ text: 'Drive 上還沒有備份檔,請先在有資料的裝置按「立即備份」。', tone: 'error' })
        return
      }
      if (!confirm(`找到 ${new Date(file.modifiedTime).toLocaleString()} 的備份,還原會整份覆蓋目前資料,確定?`)) return
      const encrypted = await downloadBackup(token, file.id)
      const plain = await decryptString(encrypted, password)
      await importAll(JSON.parse(plain))
      setMessage({ text: '還原完成', tone: 'ok' })
    } catch (e) {
      setError(e, '還原失敗,請稍後再試')
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
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl bg-accent-50 px-3 py-2.5 text-left text-sm font-bold text-accent-700 active:bg-accent-100"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-current text-[11px]">?</span>
          第一次使用?看看如何設定
        </button>
        <Field label="Google OAuth Client ID" required error={tried && !clientId.trim() ? '請先填入 Client ID(不知道怎麼取得?點上方說明)' : undefined}>
          <input
            className={inputCls}
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="xxxx.apps.googleusercontent.com"
          />
        </Field>
        <Field label="備份密碼(用來加密,忘記就救不回來)" required error={tried && !password ? '請輸入備份密碼' : undefined}>
          <input
            type="password"
            className={inputCls}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <PrimaryButton onClick={doBackup} disabled={busy != null}>
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
        {message && (
          <p
            role={message.tone === 'error' ? 'alert' : 'status'}
            className={`rounded-lg px-3 py-2 text-xs font-medium ${
              message.tone === 'error' ? 'bg-danger-soft text-danger-ink' : 'bg-accent-50 text-accent-700'
            }`}
          >
            {message.text}
          </p>
        )}
        {lastBackup && (
          <p className="text-xs text-neutral-500">上次備份:{new Date(lastBackup).toLocaleString()}</p>
        )}
      </div>
      <DriveHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </SectionCard>
  )
}

// ---- Drive 備份說明 ----

function DriveHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const origin = window.location.origin
  const copyOrigin = async () => {
    try {
      await navigator.clipboard.writeText(origin)
      toast('已複製網址')
    } catch {
      toast('無法自動複製,請手動選取網址', { tone: 'error' })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Google Drive 加密備份怎麼用?">
      <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
        <HelpBlock title="這是什麼">
          {'把你所有的資料用「備份密碼」在手機上加密後,存到你自己的 Google Drive 隱藏資料夾。'}
          {'Drive 上只有看不懂的密文,Google 和任何人都讀不到內容。換手機時,在新裝置按「從備份還原」即可。'}
        </HelpBlock>

        <HelpBlock title="一次性設定:取得 Client ID(約 5 分鐘)">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              到 <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="font-bold text-accent-600 underline">Google Cloud Console</a> 建立一個專案(免費)
            </li>
            <li>「API 和服務 → 程式庫」搜尋並啟用 <b>Google Drive API</b></li>
            <li>「OAuth 同意畫面」:User Type 選<b>外部</b>,填 App 名稱;在「測試使用者」加入你自己的 Google 帳號</li>
            <li>「憑證 → 建立憑證 → OAuth 用戶端 ID」,類型選<b>網頁應用程式</b></li>
            <li>
              「已授權的 JavaScript 來源」加入這個網址:
              <span className="mt-1 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg bg-paper px-2 py-1 text-xs">{origin}</code>
                <button
                  type="button"
                  onClick={copyOrigin}
                  className="shrink-0 rounded-lg border border-neutral-300 bg-paper px-2.5 py-1 text-xs font-bold text-neutral-700 active:bg-accent-50"
                >
                  複製
                </button>
              </span>
            </li>
            <li>複製產生的 Client ID(結尾是 <code className="text-xs">.apps.googleusercontent.com</code>),貼回設定頁</li>
          </ol>
        </HelpBlock>

        <HelpBlock title="之後每次備份">
          輸入備份密碼 → 按「立即備份」→ 第一次會跳出 Google 登入視窗,允許即可。
        </HelpBlock>

        <div className="rounded-xl bg-danger-soft px-3 py-2.5 text-xs text-danger-ink">
          <p className="font-bold">請注意</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            <li>備份密碼<b>不會</b>存在任何地方,忘記就無法還原,請自己記好。</li>
            <li>還原是「整份覆蓋」:這台裝置目前的資料會被備份內容取代。</li>
            <li>不會自動同步,多台裝置請用「A 備份 → B 還原」。</li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

function HelpBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1 text-xs font-black tracking-widest text-neutral-600">{title}</h3>
      <div>{children}</div>
    </section>
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
