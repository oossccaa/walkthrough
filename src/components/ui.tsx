import type { ReactNode } from 'react'

export function SectionCard({ title, subtitle, action, children }: {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl bg-white shadow-sm border border-neutral-200/60 p-4">
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-700">{title}</h2>
            {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
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
      className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm border transition-colors ${
        selected
          ? 'bg-accent-500 text-white border-accent-500'
          : 'bg-white text-neutral-600 border-neutral-200 active:bg-accent-50'
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

export function BottomSheet({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-200" />
        {title && <h2 className="mb-3 text-base font-bold text-neutral-800">{title}</h2>}
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
  'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-[16px] outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100'

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
      className={`w-full rounded-xl bg-accent-500 py-3 font-bold text-white active:bg-accent-600 ${className}`}
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
      className="w-full rounded-xl border border-red-200 py-3 text-sm font-bold text-red-600 active:bg-red-50"
    >
      {label}
    </button>
  )
}

/** 各 tab 底部的「新增」虛線按鈕 */
export function AddButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border-2 border-dashed border-accent-200 py-3 text-sm font-medium text-accent-500 active:bg-accent-50"
    >
      ＋ {label}
    </button>
  )
}
