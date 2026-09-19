import type { ReactNode } from 'react'

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

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-neutral-400">{text}</p>
    </div>
  )
}

export function BottomSheet({ open, onClose, title, subtitle, children }: {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[rgba(40,52,42,.4)]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[26px] bg-cream p-4 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(40,52,42,.25)]">
        <div className="mx-auto mb-3.5 h-[5px] w-10 rounded-full bg-neutral-300" />
        {title && <h2 className="mb-1 font-serif text-lg font-black text-neutral-800">{title}</h2>}
        {subtitle && <p className="mb-3.5 text-xs text-neutral-400">{subtitle}</p>}
        {!subtitle && title && <div className="mb-3" />}
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-500">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'w-full rounded-xl border border-neutral-300 bg-paper px-3 py-2.5 text-[16px] outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100'

export function PrimaryButton({ children, onClick, type = 'button', className = '' }: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full rounded-xl bg-accent-600 py-3 font-bold text-white active:bg-accent-700 ${className}`}
    >
      {children}
    </button>
  )
}

/** 編輯表單裡的刪除鈕(需二次確認) */
export function DeleteButton({ onConfirm, label = '刪除這筆紀錄' }: { onConfirm: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => { if (confirm('確定要刪除?此動作無法復原。')) onConfirm() }}
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
