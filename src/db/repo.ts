import type { Table } from 'dexie'
import { format } from 'date-fns'
import { db, ALL_TABLES } from './db'
import type { Person, PersonRole } from '../types'

export const uid = () => crypto.randomUUID()
export const nowIso = () => new Date().toISOString()
// 用本地日期:toISOString() 是 UTC,台灣 08:00 前會變成昨天
export const today = () => format(new Date(), 'yyyy-MM-dd')

function crud<T extends { id: string }>(table: () => Table<T, string>) {
  return {
    async add(item: Omit<T, 'id'>): Promise<T> {
      const full = { ...item, id: uid() } as T
      await table().add(full)
      return full
    },
    update: (id: string, patch: Partial<T>) => table().update(id, patch as never),
    /** 刪除並回傳「復原」函式(給 toast 的復原按鈕用) */
    async remove(id: string): Promise<() => Promise<void>> {
      const item = await table().get(id)
      await table().delete(id)
      return async () => { if (item) await table().put(item) }
    },
  }
}

export const preferencesRepo = crud(() => db.preferences)
export const placesRepo = crud(() => db.places)
export const relationsRepo = crud(() => db.relations)
export const giftsRepo = crud(() => db.gifts)
export const anniversariesRepo = crud(() => db.anniversaries)
export const promisesRepo = crud(() => db.promises)
export const itinerariesRepo = crud(() => db.itineraries)

// ---- Person(刪除要連動清掉所有子資料) ----

export async function addPerson(data: Partial<Person> & { name: string; role: PersonRole }): Promise<Person> {
  const now = nowIso()
  const p: Person = {
    id: uid(),
    createdAt: now,
    ...data,
    updatedAt: now,
  }
  await db.persons.add(p)
  return p
}

export async function updatePerson(id: string, patch: Partial<Person>) {
  await db.persons.update(id, { ...patch, updatedAt: nowIso() })
}

/** 刪除人物並連動清掉所有子資料;回傳「復原」函式,可整包還原 */
export async function deletePerson(id: string): Promise<() => Promise<void>> {
  const tables = ALL_TABLES.map(n => db.table(n))
  const snapshot: Partial<Record<(typeof ALL_TABLES)[number], unknown[]>> = {}
  await db.transaction('rw', tables, async () => {
    for (const name of ALL_TABLES) {
      const t = db.table(name)
      if (name === 'persons') {
        snapshot[name] = [await t.get(id)].filter(Boolean)
        await t.delete(id)
      } else {
        const coll = t.where('personId').equals(id)
        snapshot[name] = await coll.toArray()
        await coll.delete()
      }
    }
  })
  return async () => {
    await db.transaction('rw', tables, async () => {
      for (const name of ALL_TABLES) await db.table(name).bulkPut((snapshot[name] ?? []) as never[])
    })
  }
}

// ---- 匯出 / 匯入(整份覆蓋) ----

export interface ExportBundle {
  app: 'love-notes'
  version: 1
  exportedAt: string
  data: Record<(typeof ALL_TABLES)[number], unknown[]>
}

export async function exportAll(): Promise<ExportBundle> {
  const data = {} as ExportBundle['data']
  for (const name of ALL_TABLES) data[name] = await db.table(name).toArray()
  return { app: 'love-notes', version: 1, exportedAt: nowIso(), data }
}

export async function importAll(bundle: ExportBundle) {
  if (bundle.app !== 'love-notes' || !bundle.data) throw new Error('檔案格式不正確')
  await db.transaction('rw', ALL_TABLES.map(n => db.table(n)), async () => {
    for (const name of ALL_TABLES) {
      await db.table(name).clear()
      await db.table(name).bulkAdd((bundle.data[name] ?? []) as never[])
    }
  })
}

export async function clearAll() {
  await db.transaction('rw', ALL_TABLES.map(n => db.table(n)), async () => {
    for (const name of ALL_TABLES) await db.table(name).clear()
  })
}
