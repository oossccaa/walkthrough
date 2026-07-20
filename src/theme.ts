// 7 種主色系。UI 一律使用 accent-* class(CSS 變數),換主題 = 覆寫變數。
// 全域主題設在 <html>;多對象模式下,對象主頁會以她的顏色暫時覆寫。

export const SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700'] as const
type Shades = Record<(typeof SHADE_KEYS)[number], string>

export const THEMES = {
  hydrangea: {
    label: '藍繡球',
    shades: { 50: '#f4f7fb', 100: '#e8eef7', 200: '#cfdcee', 300: '#aac2e0', 400: '#84a4d0', 500: '#6489c2', 600: '#4d6ea8', 700: '#415b8a' } as Shades,
  },
  rose: {
    label: '玫瑰粉',
    shades: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' } as Shades,
  },
  violet: {
    label: '薰衣草',
    shades: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' } as Shades,
  },
  emerald: {
    label: '抹茶綠',
    shades: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' } as Shades,
  },
  orange: {
    label: '落日橘',
    shades: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' } as Shades,
  },
  teal: {
    label: '湖水綠',
    shades: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' } as Shades,
  },
  slate: {
    label: '石墨灰',
    shades: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155' } as Shades,
  },
} as const

export type ThemeKey = keyof typeof THEMES
export const DEFAULT_THEME: ThemeKey = 'hydrangea'
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

/** 暫時覆寫為某位對象的顏色(離開她的頁面時呼叫 restore) */
export function applyPersonTheme(key: ThemeKey) {
  setVars(key)
}

export function restoreGlobalTheme() {
  setVars(globalTheme)
}
