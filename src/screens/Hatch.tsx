import { useEffect, useState } from 'preact/hooks'
import { dragonKind } from '../content/dragons.ts'
import type { Land } from '../lands.ts'
import { T } from '../strings.ts'
import { CaveMouth, Egg, GrownDragon, LandMotif, ShellHalves } from '../ui/art.tsx'
import { NameEntry } from '../ui/NameEntry.tsx'

// The hatching moment, in three beats:
//   egg   – the full egg wobbles; the child taps it, it cracks open
//   name  – the baby dragon sits in its shell halves; the child types its name
//   hello – "Hallo, Funkel!" and, when one opened, the new grotto
// The ready egg is saved, so closing the app at any beat brings the child back here.

const CRACK_MS = 1100

interface Props {
  kind: string
  /** Saves the dragon; returns the land that just opened, if any. */
  onName: (name: string) => Land | undefined
  onDone: () => void
}

export function Hatch({ kind, onName, onDone }: Props) {
  const [beat, setBeat] = useState<'egg' | 'crack' | 'name' | 'hello'>('egg')
  const [name, setName] = useState('')
  const [land, setLand] = useState<Land>()
  const k = dragonKind(kind)

  useEffect(() => {
    if (beat !== 'crack') return
    const t = window.setTimeout(() => setBeat('name'), CRACK_MS)
    return () => clearTimeout(t)
  }, [beat])

  if (beat === 'egg' || beat === 'crack') {
    return (
      <div class="hatch grotto" data-beat={beat}>
        <div class="reward-head">
          <h1>{T.eggReady}</h1>
        </div>
        <button type="button" class="hatch-egg" aria-label={T.tapEgg} onClick={() => setBeat('crack')} disabled={beat === 'crack'}>
          <Egg crack={3} isNew={beat === 'egg'} />
        </button>
        <p class="reward-sub hatch-tip">{T.tapEgg}</p>
      </div>
    )
  }

  const art = (
    <div class="reward-art hatch-art">
      <svg viewBox="-10 -10 280 210" role="img" aria-label={name || T.hatched}>
        <GrownDragon kind={k} stage="hatchling" awake />
        <ShellHalves />
      </svg>
    </div>
  )

  if (beat === 'name') {
    return (
      <div class="hatch grotto" data-beat="name">
        <div class="reward-head">
          <h1>{T.hatched}</h1>
        </div>
        {art}
        <NameEntry
          label={T.askDragonName}
          onDone={(n) => {
            setName(n)
            setLand(onName(n))
            setBeat('hello')
          }}
        />
      </div>
    )
  }

  return (
    <div class="hatch grotto" data-beat="hello">
      <div class="reward-head">
        <h1>{T.helloDragon(name)}</h1>
      </div>
      {art}
      <div class="reward-act">
        {land && (
          <div class="hatch-land">
            <CaveMouth hue={land.hue}>
              <LandMotif land={land.id} />
            </CaveMouth>
            <p class="reward-sub">{T.newLand(land.name)}</p>
          </div>
        )}
        <button type="button" class="btn-gold" onClick={onDone}>
          {T.toGrotto}
        </button>
      </div>
    </div>
  )
}
