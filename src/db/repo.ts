import type { Table } from 'dexie'
import { db, ALL_TABLES } from './db'
import type { Person, PersonRole } from '../types'

export const uid = () => crypto.randomUUID()
export const nowIso = () => new Date().toISOString()
export const today = () => nowIso().slice(0, 10)

function crud<T extends { id: string }>(table: () => Table<T, string>) {
  return {
    async add(item: Omit<T, 'id'>): Promise<T> {
      const full = { ...item, id: uid() } as T
      await table().add(full)
      return full
    },
    update: (id: string, patch: Partial<T>) => table().update(id, patch as never),
    remove: (id: string) => table().delete(id),
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

export async function deletePerson(id: string) {
  await db.transaction('rw', ALL_TABLES.map(n => db.table(n)), async () => {
    await db.persons.delete(id)
    await db.preferences.where('personId').equals(id).delete()
    await db.places.where('personId').equals(id).delete()
    await db.relations.where('personId').equals(id).delete()
    await db.gifts.where('personId').equals(id).delete()
    await db.anniversaries.where('personId').equals(id).delete()
    await db.promises.where('personId').equals(id).delete()
    await db.itineraries.where('personId').equals(id).delete()
  })
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
