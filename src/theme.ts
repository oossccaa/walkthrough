// 20 種主色系。UI 一律使用 accent-* class(CSS 變數),換主題 = 覆寫變數。
// 全域主題設在 <html>;每個人的主頁會以其專屬色暫時覆寫。

export const SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700'] as const
type Shades = Record<(typeof SHADE_KEYS)[number], string>

const S = (
  s50: string, s100: string, s200: string, s300: string,
  s400: string, s500: string, s600: string, s700: string,
): Shades => ({ 50: s50, 100: s100, 200: s200, 300: s300, 400: s400, 500: s500, 600: s600, 700: s700 })

export const THEMES = {
  sage:      { label: '鼠尾草', shades: S('#F0F5F0', '#E3EDE3', '#CBDECD', '#A9C4AE', '#6E9B7E', '#4F8465', '#3E7355', '#33604A') },
  hydrangea: { label: '藍繡球', shades: S('#f4f7fb', '#e8eef7', '#cfdcee', '#aac2e0', '#84a4d0', '#6489c2', '#4d6ea8', '#415b8a') },
  sky:       { label: '天空藍', shades: S('#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1') },
  blue:      { label: '海洋藍', shades: S('#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8') },
  indigo:    { label: '靛藍',   shades: S('#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca') },
  cyan:      { label: '青碧',   shades: S('#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490') },
  teal:      { label: '湖水綠', shades: S('#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e') },
  emerald:   { label: '抹茶綠', shades: S('#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857') },
  green:     { label: '森林綠', shades: S('#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d') },
  lime:      { label: '檸檬綠', shades: S('#f7fee7', '#ecfccb', '#d9f99d', '#bef264', '#a3e635', '#84cc16', '#65a30d', '#4d7c0f') },
  yellow:    { label: '陽光黃', shades: S('#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207') },
  amber:     { label: '琥珀',   shades: S('#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309') },
  orange:    { label: '落日橘', shades: S('#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c') },
  red:       { label: '熱情紅', shades: S('#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c') },
  rose:      { label: '玫瑰粉', shades: S('#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c') },
  pink:      { label: '櫻花粉', shades: S('#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d') },
  fuchsia:   { label: '紫紅',   shades: S('#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf') },
  purple:    { label: '葡萄紫', shades: S('#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce') },
  violet:    { label: '薰衣草', shades: S('#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9') },
  slate:     { label: '石墨灰', shades: S('#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155') },
  stone:     { label: '暖石灰', shades: S('#fafaf9', '#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c', '#57534e', '#44403c') },
} as const

export type ThemeKey = keyof typeof THEMES
export const DEFAULT_THEME: ThemeKey = 'sage'
export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[]

export function isThemeKey(v: unknown): v is ThemeKey {
  return typeof v === 'string' && v in THEMES
}

function setVars(key: ThemeKey) {
  const root = document.documentElement
  for (const shade of SHADE_KEYS) {
    root.style.setProperty(`--color-accent-${shade}`, THEMES[key].shades[shade])
  }
}

let globalTheme: ThemeKey = DEFAULT_THEME

/** 設定全域主題(設定頁用) */
export function applyGlobalTheme(key: ThemeKey) {
  globalTheme = key
  setVars(key)
}

/** 暫時覆寫為某個人的顏色(離開其頁面時呼叫 restore) */
export function applyPersonTheme(key: ThemeKey) {
  setVars(key)
}

export function restoreGlobalTheme() {
  setVars(globalTheme)
}
