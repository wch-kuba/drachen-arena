// App-wide game state: loads storage once, keeps it in memory, writes through on change.

import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import { initVoice } from './audio.ts'
import { initSfx, setAmbient, setSound } from './sfx.ts'
import { record } from './leitner.ts'
import { addCrystals, endRound, hatch } from './rewards.ts'
import type { Result } from './round.ts'
import { load, requestPersist, saveProfile, saveProgress, type Data } from './storage.ts'
import type { ExerciseType, Item, Profile } from './types.ts'

interface Game {
  data: Data
  /** Save one finished item: progress box and crystals, right away. */
  finishItem: (r: Result) => void
  /** Round bonus and round count; a full egg becomes ready to hatch. */
  finishRound: (land: ExerciseType) => void
  /** The child named the dragon in the ready egg. */
  hatchDragon: (name: string) => void
  setChildName: (name: string) => void
  setSound: (on: boolean) => void
  setAmbient: (on: boolean) => void
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
    initSfx()
    load(seed).then((d) => {
      latest.current = d
      setData(d)
    }, (e) => {
      console.error(e)
      setFailed(true)
    })
  }, [seed])

  const sound = data?.profile.sound ?? true
  useEffect(() => setSound(sound), [sound])
  const ambient = data?.profile.ambient ?? false
  useEffect(() => setAmbient(ambient), [ambient])

  if (failed) throw new Error('Storage unavailable')
  if (!data) return null

  const finishItem = (r: Result) => {
    const d = latest.current!
    const progress = record(d.progress[r.id], r.firstTry, Date.now(), r.lastWrong, r.mistakes)
    const profile = addCrystals(d.profile, r.crystals)
    latest.current = { ...d, progress: { ...d.progress, [r.id]: progress }, profile }
    setData(latest.current)
    void saveProgress(r.id, progress)
    void saveProfile(profile)
  }

  const changeProfile = (f: (p: Profile) => Profile) => {
    const d = latest.current!
    const profile = f(d.profile)
    latest.current = { ...d, profile }
    setData(latest.current)
    void saveProfile(profile)
  }

  const game: Game = {
    data,
    finishItem,
    finishRound: (land) => changeProfile((p) => endRound(p, land)),
    hatchDragon: (name) => changeProfile((p) => hatch(p, name, Date.now())),
    setChildName: (name) => changeProfile((p) => ({ ...p, childName: name.trim() })),
    setSound: (on) => changeProfile((p) => ({ ...p, sound: on })),
    setAmbient: (on) => changeProfile((p) => ({ ...p, ambient: on })),
  }

  return <Ctx.Provider value={game}>{children}</Ctx.Provider>
}

export function useGame(): Game {
  const g = useContext(Ctx)
  if (!g) throw new Error('useGame outside GameProvider')
  return g
}
