// On-device storage (IndexedDB via idb-keyval). Child data never leaves the device.
// Keys: meta, items, progress, profile. All small enough to read and write whole.

import { createStore, get, set, setMany, update, type UseStore } from 'idb-keyval'
import { UNLOCK_ORDER, type Stage } from './rewards.ts'
import type { Dragon, ExerciseType, Item, Profile, Progress } from './types.ts'

export const SCHEMA = 3

interface Meta {
  schema: number
}

export interface Data {
  items: Item[]
  progress: Record<string, Progress>
  profile: Profile
}

/** Step n migrates schema n → n + 1. Add one here whenever a stored shape changes. */
const MIGRATIONS: Record<number, (db: UseStore) => Promise<void>> = {
  // 1 → 2 (Part 6): real rewards. Eggs fill with crystals, lands open one per hatch.
  // Nothing is taken away: every land the child already played stays open.
  1: async (s) => {
    const old = await get<Record<string, unknown>>('profile', s)
    if (!old) return
    const [items, progress] = await Promise.all([
      get<Item[]>('items', s),
      get<Record<string, Progress>>('progress', s),
    ])
    const played = new Set((items ?? []).filter((i) => progress?.[i.id]?.lastSeen).map((i) => i.type))
    const crystals = typeof old.crystals === 'number' ? old.crystals : 0
    // Schema 2 shape; step 2 → 3 turns it into today's.
    const profile = {
      childName: typeof old.childName === 'string' ? old.childName : '',
      crystals,
      eggCrystals: crystals % 100,
      rounds: 0,
      dragons: [],
      unlockedWorlds: UNLOCK_ORDER.filter((l) => l === UNLOCK_ORDER[0] || played.has(l)),
      sound: true,
      ambient: false,
    }
    await set('profile', profile, s)
  },
  // 2 → 3: feed one dragon. Growth comes from crystals, not rounds. Every dragon keeps the
  // stage it had by the old rule (young after 10 rounds since hatch, grown after 25), and the
  // egg's crystals now fill the current goal. Nothing is taken away.
  2: async (s) => {
    const old = await get<Record<string, unknown>>('profile', s)
    if (!old) return
    const rounds = typeof old.rounds === 'number' ? old.rounds : 0
    const { eggCrystals, ...rest } = old
    const dragons = ((old.dragons as Record<string, unknown>[] | undefined) ?? []).map(
      ({ roundsAtHatch, ...d }): Dragon => {
        const since = rounds - (typeof roundsAtHatch === 'number' ? roundsAtHatch : rounds)
        const stage: Stage = since >= 25 ? 'grown' : since >= 10 ? 'young' : 'hatchling'
        return { ...(d as Omit<Dragon, 'stage'>), stage }
      },
    )
    const goalCrystals = typeof eggCrystals === 'number' ? eggCrystals : 0
    await set('profile', { ...rest, goalCrystals, dragons }, s)
  },
}

export const emptyProfile = (): Profile => ({
  childName: '',
  crystals: 0,
  goalCrystals: 0,
  rounds: 0,
  dragons: [],
  unlockedWorlds: [UNLOCK_ORDER[0]] as ExerciseType[],
  sound: true,
  ambient: false,
})

let db: UseStore | undefined
const store = () => (db ??= createStore('drachen-arena', 'kv'))

/** Tests only: use a fresh database. */
export function _resetStore(name = 'drachen-arena') {
  db = createStore(name, 'kv')
}

/**
 * Seed items are replaced by the bundled version (matched by id), keeping the `active`
 * switch the parent may have flipped. Parent items are kept as they are. Progress is
 * stored separately, so a seed update never touches it.
 */
export function mergeSeed(stored: Item[], seed: Item[]): Item[] {
  const old = new Map(stored.map((i) => [i.id, i]))
  const fromSeed = seed.map((s) => {
    const prev = old.get(s.id)
    return prev?.source === 'seed' ? { ...s, active: prev.active } : s
  })
  const seedIds = new Set(seed.map((s) => s.id))
  const parent = stored.filter((i) => i.source === 'parent' && !seedIds.has(i.id))
  return [...fromSeed, ...parent]
}

async function migrate() {
  const meta = (await get<Meta>('meta', store())) ?? { schema: 0 }
  if (meta.schema === 0) {
    // First start (or pre-versioned data): nothing to migrate.
    await set('meta', { schema: SCHEMA } satisfies Meta, store())
    return
  }
  for (let v = meta.schema; v < SCHEMA; v++) {
    await MIGRATIONS[v]?.(store())
    await set('meta', { schema: v + 1 } satisfies Meta, store())
  }
}

/** Ask the browser not to evict our data. Safari may still say no; that's fine. */
export async function requestPersist(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function load(seed: Item[]): Promise<Data> {
  await migrate()
  const s = store()
  const [items, progress, profile] = await Promise.all([
    get<Item[]>('items', s),
    get<Record<string, Progress>>('progress', s),
    get<Profile>('profile', s),
  ])
  const data: Data = {
    items: mergeSeed(items ?? [], seed),
    progress: progress ?? {},
    profile: { ...emptyProfile(), ...profile },
  }
  await setMany(
    [
      ['items', data.items],
      ['profile', data.profile],
    ],
    s,
  )
  return data
}

export function saveProgress(id: string, p: Progress) {
  return update<Record<string, Progress>>('progress', (old) => ({ ...old, [id]: p }), store())
}

export function saveProfile(p: Profile) {
  return set('profile', p, store())
}
