import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

// 全域輕量提示:操作完成的回饋,可附「復原」動作(取代刪除前的 confirm)

interface ToastOptions {
  tone?: 'default' | 'error'
  action?: { label: string; onClick: () => void }
}

interface ToastItem extends ToastOptions {
  id: number
  message: string
}

type ToastFn = (message: string, options?: ToastOptions) => void

const Ctx = createContext<ToastFn>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<ToastItem | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const toast = useCallback<ToastFn>((message, options = {}) => {
    window.clearTimeout(timer.current)
    const id = Date.now()
    setItem({ id, message, ...options })
    // 有復原動作或錯誤時留久一點,讓人來得及看/按
    const ms = options.action || options.tone === 'error' ? 5000 : 2000
    timer.current = window.setTimeout(() => setItem(cur => (cur?.id === id ? null : cur)), ms)
  }, [])

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4" aria-live="polite">
        {item && (
          <div
            key={item.id}
            role={item.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              item.tone === 'error' ? 'bg-danger text-white' : 'bg-neutral-800 text-cream'
            }`}
          >
            <span className="min-w-0">{item.message}</span>
            {item.action && (
              <button
                onClick={() => { item.action!.onClick(); setItem(null) }}
                className="shrink-0 rounded-lg px-2 py-1 font-bold text-accent-200 underline underline-offset-2"
              >
                {item.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
