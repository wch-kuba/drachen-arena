// The art must be complete: every picture the app can ask for exists in the manifest.

import { describe, expect, it } from 'vitest'
import { DRAGONS } from '../content/dragons.ts'
import { SEED } from '../content/seed.ts'
import { LANDS } from '../lands.ts'
import { hasPic } from './images.ts'

describe('art', () => {
  it('has every dragon at every stage and mood, with its egg and shell halves', () => {
    const missing = DRAGONS.flatMap((d) => [
      ...['hatchling', 'young', 'grown'].flatMap((s) => ['idle', 'happy', 'sleeping'].map((p) => `dragon/${d.id}-${s}-${p}`)),
      `egg/${d.id}`,
      `shell/${d.id}-top`,
      `shell/${d.id}-bottom`,
    ]).filter((k) => !hasPic(k))
    expect(missing).toEqual([])
  })

  it('has a picture for every seed word with an image key, and every land', () => {
    const keys = [...new Set(SEED.flatMap((i) => (i.image ? [`word/${i.image}`] : [])))]
    expect(keys.filter((k) => !hasPic(k))).toEqual([])
    expect(LANDS.map((l) => `land/${l.id}`).filter((k) => !hasPic(k))).toEqual([])
  })
})
