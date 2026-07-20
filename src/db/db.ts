import Dexie, { type Table } from 'dexie'
import type {
  Person, Preference, Place, RelationPerson, Gift, Anniversary, PromiseItem, Itinerary,
} from '../types'

class LoveDB extends Dexie {
  persons!: Table<Person, string>
  preferences!: Table<Preference, string>
  places!: Table<Place, string>
  relations!: Table<RelationPerson, string>
  gifts!: Table<Gift, string>
  anniversaries!: Table<Anniversary, string>
  promises!: Table<PromiseItem, string>
  itineraries!: Table<Itinerary, string>

  constructor() {
    super('love-notes')
    this.version(1).stores({
      persons: 'id, status, updatedAt',
      preferences: 'id, personId, category, sentiment',
      places: 'id, personId, type',
      relations: 'id, personId, type',
      gifts: 'id, personId, direction',
      anniversaries: 'id, personId, date',
      promises: 'id, personId, completed',
      itineraries: 'id, personId, date',
    })
  }
}

export const db = new LoveDB()

export const ALL_TABLES = [
  'persons', 'preferences', 'places', 'relations', 'gifts', 'anniversaries', 'promises', 'itineraries',
] as const
