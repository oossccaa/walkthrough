import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export function SectionCard({ title, subtitle, action, children }: {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-[18px] bg-paper border border-neutral-200 p-4 shadow-[0_1px_2px_rgba(55,70,55,.06)]">
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-black tracking-widest text-neutral-600">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11px] text-neutral-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Chip({ selected, onClick, children, className = '' }: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold border transition-colors ${
        selected
          ? 'bg-neutral-800 text-cream border-neutral-800'
          : 'bg-paper text-neutral-600 border-neutral-300 active:bg-accent-50'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function EmptyState({ text, action }: { text: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-neutral-500">{text}</p>
      {action && (
        <button onClick={action.onClick} className="mt-2 text-sm font-bold text-accent-600 underline underline-offset-2">
          {action.label}
        </button>
      )}
    </div>
  )
}

/** 表單是否被改過:跟第一次 render 的值比較,用來決定關閉時要不要確認 */
export function useDirty(values: unknown): boolean {
  const [initial] = useState(() => JSON.stringify(values))
  return JSON.stringify(values) !== initial
}

/** 對話框共用行為:Esc 關閉、鎖背景捲動、開啟時聚焦、關閉後焦點還原 */
function useDialog(requestClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(requestClose)
  closeRef.current = requestClose

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus?.()
    }
  }, [])

  return ref
}

export function BottomSheet(props: {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  /** 有未儲存的修改時,點遮罩 / Esc 會先確認 */
  dirty?: boolean
  children: ReactNode
}) {
  if (!props.open) return null
  return <BottomSheetInner {...props} />
}

function BottomSheetInner({ onClose, title, subtitle, dirty, children }: {
  onClose: () => void
  title?: string
  subtitle?: string
  dirty?: boolean
  children: ReactNode
}) {
  const titleId = useId()
  const requestClose = () => {
    if (dirty && !confirm('有尚未儲存的內容,要放棄這次的編輯嗎?')) return
    onClose()
  }
  const ref = useDialog(requestClose)

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[rgba(40,52,42,.4)]" onClick={requestClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] max-w-md overflow-y-auto overscroll-contain rounded-t-[26px] bg-cream p-4 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(40,52,42,.25)] outline-none"
      >
        <div className="mx-auto mb-3.5 h-[5px] w-10 rounded-full bg-neutral-300" />
        <div className="flex items-start justify-between gap-3">
          {title && <h2 id={titleId} className="mb-1 font-serif text-lg font-black text-neutral-800">{title}</h2>}
          <button
            type="button"
            onClick={requestClose}
            aria-label="關閉"
            className="-mr-1 -mt-1 ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-neutral-500 active:bg-neutral-100"
          >
            ✕
          </button>
        </div>
        {subtitle && <p className="mb-3.5 text-xs text-neutral-500">{subtitle}</p>}
        {!subtitle && title && <div className="mb-3" />}
        {children}
      </div>
    </div>
  )
}

/** 置中說明視窗(教學 / 說明文件用) */
export function Modal({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return <ModalInner onClose={onClose} title={title}>{children}</ModalInner>
}

function ModalInner({ onClose, title, children }: { onClose: () => void; title: string; children: ReactNode }) {
  const titleId = useId()
  const ref = useDialog(onClose)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[rgba(40,52,42,.4)]" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative max-h-[85dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-[22px] bg-cream p-5 shadow-[0_8px_30px_rgba(40,52,42,.3)] outline-none"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-serif text-lg font-black text-neutral-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-neutral-500 active:bg-neutral-100"
          >
            ✕
          </button>
        </div>
        {children}
        <PrimaryButton onClick={onClose} className="mt-5">我知道了</PrimaryButton>
      </div>
    </div>
  )
}

export function Field({ label, required, error, children }: {
  label: string
  /** 必填:標籤後加 *,搭配 error 在送出時提示 */
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-500">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
      </span>
      {children}
      {error && <span role="alert" className="mt-1 block text-xs font-medium text-danger">{error}</span>}
    </label>
  )
}

export const inputCls =
  'w-full rounded-xl border border-neutral-300 bg-paper px-3 py-2.5 text-[16px] outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100'

export function PrimaryButton({ children, onClick, type = 'button', disabled, className = '' }: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl bg-accent-600 py-3 font-bold text-white active:bg-accent-700 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * 編輯表單裡的刪除鈕。
 * 單筆紀錄直接刪,事後用 toast「復原」;影響範圍大的(例如整個人)才傳 confirmText 先確認。
 */
export function DeleteButton({ onDelete, label = '刪除這筆紀錄', confirmText }: {
  onDelete: () => void
  label?: string
  confirmText?: string
}) {
  return (
    <button
      type="button"
      onClick={() => { if (!confirmText || confirm(confirmText)) onDelete() }}
      className="w-full rounded-xl border border-danger-line py-3 text-sm font-bold text-danger active:bg-danger-soft"
    >
      {label}
    </button>
  )
}

/** 各 tab 底部的「記一筆」虛線按鈕 */
export function AddButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border-[1.5px] border-dashed border-accent-300 py-3 text-[13px] font-bold text-accent-600 active:bg-accent-50"
    >
      ＋ {label}
    </button>
  )
}

/** 返回上一頁;直接開網址(沒有上一頁)時退回 fallback,不會跳離 App */
export function useBack(fallback = '/') {
  const navigate = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }
}

/** 頁首左上角的返回鈕(全 App 統一樣式) */
export function BackButton({ label = '返回', fallback = '/', onClick }: {
  label?: string
  fallback?: string
  onClick?: () => void
}) {
  const back = useBack(fallback)
  return (
    <button
      type="button"
      onClick={onClick ?? back}
      className="-ml-2 flex h-9 items-center rounded-lg px-2 text-sm font-medium text-neutral-500 active:bg-neutral-100"
    >
      ‹ {label}
    </button>
  )
}

/** 勾選框:視覺 20px,點擊範圍 44px(單手好按) */
export function CheckButton({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className="-m-3 flex h-11 w-11 shrink-0 items-center justify-center"
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded border text-[11px] font-black text-white ${
          checked ? 'border-accent-500 bg-accent-500' : 'border-neutral-400 bg-paper'
        }`}
      >
        {checked && '✓'}
      </span>
    </button>
  )
}

/** 藥丸小按鈕(返回/編輯) */
export function PillButton({ children, onClick, className = '' }: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border border-neutral-300 bg-paper px-3.5 py-[7px] text-[12.5px] font-bold text-neutral-700 active:bg-accent-50 ${className}`}
    >
      {children}
    </button>
  )
}

export const Chevron = ({ className = 'text-neutral-300' }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`shrink-0 ${className}`}>
    <path d="M5 3l4 4-4 4" />
  </svg>
)
