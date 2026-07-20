import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db/db'
import { addPerson as dbAddPerson, importAll, clearAll } from './db/repo'
import { mockBundle } from './mock'
import { useLocalStorage } from './utils/useLocalStorage'
import { applyGlobalTheme, DEFAULT_THEME, isThemeKey, type ThemeKey } from './theme'
import type { Person } from './types'

interface AppState {
  ready: boolean
  persons: Person[]
  addPerson: (name: string) => Promise<Person>
  multiMode: boolean
  setMultiMode: (v: boolean) => void
  /** 單一對象模式下,首頁顯示的主要對象 */
  primaryId: string | null
  setPrimaryId: (id: string | null) => void
  theme: ThemeKey
  setTheme: (t: ThemeKey) => void
  loadDemo: () => Promise<void>
  resetAll: () => Promise<void>
}

const Ctx = createContext<AppState>(null as unknown as AppState)

export function AppProvider({ children }: { children: ReactNode }) {
  const persons = useLiveQuery(() => db.persons.toArray(), [])
  const [multiMode, setMultiMode] = useLocalStorage('ln:multi', false)
  const [primaryId, setPrimaryId] = useLocalStorage<string | null>('ln:primary', null)
  const [themeRaw, setThemeRaw] = useLocalStorage<string>('ln:theme', DEFAULT_THEME)
  const theme: ThemeKey = isThemeKey(themeRaw) ? themeRaw : DEFAULT_THEME

  useEffect(() => {
    applyGlobalTheme(theme)
  }, [theme])

  const value: AppState = {
    ready: persons !== undefined,
    persons: persons ?? [],
    addPerson: name => dbAddPerson({ name: name.trim() }),
    multiMode,
    setMultiMode,
    primaryId,
    setPrimaryId,
    theme,
    setTheme: t => {
      setThemeRaw(t)
      applyGlobalTheme(t)
    },
    loadDemo: async () => {
      await importAll(mockBundle())
      setMultiMode(true)
    },
    resetAll: async () => {
      await clearAll()
      setMultiMode(false)
      setPrimaryId(null)
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
