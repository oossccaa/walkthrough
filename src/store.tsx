import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db/db'
import { importAll, clearAll } from './db/repo'
import { mockBundle } from './mock'
import { useLocalStorage } from './utils/useLocalStorage'
import { applyGlobalTheme, DEFAULT_THEME, isThemeKey, type ThemeKey } from './theme'
import type { Person } from './types'

interface AppState {
  ready: boolean
  persons: Person[]
  theme: ThemeKey
  setTheme: (t: ThemeKey) => void
  loadDemo: () => Promise<void>
  resetAll: () => Promise<void>
}

const Ctx = createContext<AppState>(null as unknown as AppState)

export function AppProvider({ children }: { children: ReactNode }) {
  const persons = useLiveQuery(() => db.persons.toArray(), [])
  const [themeRaw, setThemeRaw] = useLocalStorage<string>('ln:theme', DEFAULT_THEME)
  const theme: ThemeKey = isThemeKey(themeRaw) ? themeRaw : DEFAULT_THEME

  useEffect(() => {
    applyGlobalTheme(theme)
  }, [theme])

  const value: AppState = {
    ready: persons !== undefined,
    persons: persons ?? [],
    theme,
    setTheme: t => {
      setThemeRaw(t)
      applyGlobalTheme(t)
    },
    loadDemo: () => importAll(mockBundle()),
    resetAll: () => clearAll(),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
