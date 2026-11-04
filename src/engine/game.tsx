// App-wide game state: loads storage once, keeps it in memory, writes through on change.

import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import { initVoice } from './audio.ts'
import { record } from './leitner.ts'
import type { Result } from './round.ts'
import { load, requestPersist, saveProfile, saveProgress, type Data } from './storage.ts'
import type { Item } from './types.ts'

interface Game {
  data: Data
  /** Save one finished item: progress box and crystals, right away. */
  finishItem: (r: Result) => void
}

const Ctx = createContext<Game | null>(null)

export function GameProvider({ seed, children }: { seed: Item[]; children: ComponentChildren }) {
  const [data, setData] = useState<Data | null>(null)
  const [failed, setFailed] = useState(false)
  // Latest data for handlers, so two saves in a row never build on a stale copy.
  const latest = useRef<Data | null>(null)

  useEffect(() => {
    void requestPersist()
    void initVoice()
    load(seed).then((d) => {
      latest.current = d
      setData(d)
    }, (e) => {
      console.error(e)
      setFailed(true)
    })
  }, [seed])

  if (failed) throw new Error('Storage unavailable')
  if (!data) return null

  const finishItem = (r: Result) => {
    const d = latest.current!
    const progress = record(d.progress[r.id], r.firstTry, Date.now(), r.lastWrong)
    const profile = { ...d.profile, crystals: d.profile.crystals + r.crystals }
    latest.current = { ...d, progress: { ...d.progress, [r.id]: progress }, profile }
    setData(latest.current)
    void saveProgress(r.id, progress)
    void saveProfile(profile)
  }

  return <Ctx.Provider value={{ data, finishItem }}>{children}</Ctx.Provider>
}

export function useGame(): Game {
  const g = useContext(Ctx)
  if (!g) throw new Error('useGame outside GameProvider')
  return g
}
