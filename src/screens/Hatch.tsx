import { useEffect, useState } from 'preact/hooks'
import { play } from '../engine/sfx.ts'
import type { Land } from '../lands.ts'
import { T } from '../strings.ts'
import { CaveMouth, DragonPic, EggPic } from '../ui/art.tsx'
import { shellPic } from '../ui/images.ts'
import { NameEntry } from '../ui/NameEntry.tsx'

// The hatching moment, in three beats:
//   egg   – the full egg wobbles; the child taps it, it rocks and its top half pops off
//   name  – the baby dragon sits in its shell halves; the child types its name
//   hello – "Hallo, Funkel!" and, when one opened, the new grotto
// The ready egg is saved, so closing the app at any beat brings the child back here.

const CRACK_MS = 1100
/** The egg's wobble loop in index.css. */
const WOBBLE_MS = 2400

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

  // Every second rock of the wobble loop (2.4s, rocking from 60%) gets its little knock.
  useEffect(() => {
    if (beat !== 'egg') return
    let t = window.setTimeout(function knock() {
      play('wobble')
      t = window.setTimeout(knock, WOBBLE_MS * 2)
    }, WOBBLE_MS * 0.6)
    return () => clearTimeout(t)
  }, [beat])

  useEffect(() => {
    if (beat !== 'crack') return
    play('hatch')
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
          {beat === 'egg' ? <EggPic kind={kind} isNew /> : <Shells kind={kind} />}
        </button>
        <p class="reward-sub hatch-tip">{T.tapEgg}</p>
      </div>
    )
  }

  // The baby sits in the bottom shell; the popped-off top lies beside it.
  const top = shellPic(kind, 'top')
  const bottom = shellPic(kind, 'bottom')
  const art = (
    <div class="reward-art hatch-art">
      <div class="hatch-nest" role="img" aria-label={name || T.hatched}>
        {top && <img class="nest-top" src={top.src} alt="" draggable={false} />}
        <DragonPic class="nest-dragon" kind={kind} stage="hatchling" pose={beat === 'hello' ? 'happy' : 'idle'} />
        {bottom && <img class="nest-bottom" src={bottom.src} alt="" draggable={false} />}
      </div>
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
            <CaveMouth land={land.id} />
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

/** The egg as its two cut halves, stacked so they look whole; the crack animation splits them. */
function Shells({ kind }: { kind: string }) {
  const top = shellPic(kind, 'top')
  const bottom = shellPic(kind, 'bottom')
  if (!top || !bottom) return <EggPic kind={kind} />
  return (
    <span class="egg-pic hatch-shells">
      <img class="shell-bottom" src={bottom.src} width={bottom.w} height={bottom.h} alt="" draggable={false} />
      <img class="shell-top" src={top.src} width={top.w} height={top.h} alt="" draggable={false} />
    </span>
  )
}
