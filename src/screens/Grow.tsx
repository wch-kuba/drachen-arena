import { useEffect, useState } from 'preact/hooks'
import { play } from '../engine/sfx.ts'
import { stageBefore, type Stage } from '../engine/rewards.ts'
import type { Land } from '../lands.ts'
import { T } from '../strings.ts'
import { DragonPic, EggPic, HoardLedge, STAGE_SCALE } from '../ui/art.tsx'
import { Speak } from '../ui/Speak.tsx'
import { Flight } from './Flight.tsx'
import { LandReveal } from './Hatch.tsx'

// The growing moment, in three beats, like the hatch:
//   full  – "Funkel ist satt!" over the dragon at its old size; the child taps it
//   grow  – the dragon swells from its old size to the new one, from the same ground line
//   hello – the new picture: "Funkel ist gewachsen!", then the grotto that opened
// A dragon that is now grown and has an egg to find flies off first (Part 6b):
//   hello – "Funkel ist gewachsen!" and the gold "Losfliegen!"
//   fly   – the flight through the grotto to the egg (Flight.tsx)
//   found – back on the hoard with the egg beside it, then the grotto that opened
// The speaker reads name-free lines (clips are made at build time; the name is the child's).
// The growth is saved before this screen, so closing the app at any beat brings it back here.

/** The swell in index.css (.grow-dragon). */
const GROW_MS = 900

interface Props {
  dragon: { kind: string; name: string; stage: Stage }
  /** The grotto that opened with this step, if any. */
  land?: Land
  /** The dragon in the next egg, shown when the dragon is fully grown. */
  nextEgg?: string
  onDone: () => void
}

export function Grow({ dragon, land, nextEgg, onDone }: Props) {
  const [beat, setBeat] = useState<'full' | 'grow' | 'hello' | 'fly' | 'found'>('full')
  const from = stageBefore(dragon.stage)
  const grown = dragon.stage === 'grown'
  /** The grown dragon flies to its egg before the grotto opens. */
  const flies = grown && !!nextEgg
  const shown = beat === 'hello' || beat === 'found'

  useEffect(() => {
    if (beat !== 'grow') return
    play('land')
    const t = window.setTimeout(() => setBeat('hello'), GROW_MS)
    return () => clearTimeout(t)
  }, [beat])

  const title = beat === 'found' ? T.grownEgg(dragon.name) : beat === 'hello' ? T.grew(dragon.name) : T.fed(dragon.name)
  // Sized to the new stage; the old picture starts scaled down to its own size inside it.
  const style = { '--s': STAGE_SCALE[dragon.stage], '--from': STAGE_SCALE[from] / STAGE_SCALE[dragon.stage] }

  if (beat === 'fly') return <Flight kind={dragon.kind} name={dragon.name} egg={nextEgg} onDone={() => setBeat('found')} />

  return (
    <div class="hatch grow grotto" data-beat={beat === 'found' ? 'hello' : beat}>
      <div class="reward-head">
        <h1>{title}</h1>
        {shown && (
          <p class="reward-sub grow-stage grow-say">
            {T.stage[dragon.stage]}
            <Speak text={T.grewSay} />
          </p>
        )}
      </div>
      <div class="reward-art hatch-art">
        {/* The dragon grows on its own hoard, from the pile's surface up. */}
        <div class="grow-scene">
          <button
            type="button"
            class="grow-stand"
            style={style}
            aria-label={beat === 'full' ? T.tapDragon(dragon.name) : `${dragon.name}, ${T.stage[dragon.stage]}`}
            onClick={() => setBeat('grow')}
            disabled={beat !== 'full'}
          >
            {shown ? (
              <DragonPic class="grow-dragon grow-new" kind={dragon.kind} stage={dragon.stage} pose="happy" />
            ) : (
              <DragonPic class="grow-dragon grow-old" kind={dragon.kind} stage={from} pose={beat === 'grow' ? 'happy' : 'idle'} />
            )}
            {beat === 'found' && nextEgg && <EggPic class="grow-egg" kind={nextEgg} />}
          </button>
          <HoardLedge gems={0} size={0.7} />
        </div>
      </div>
      {beat === 'hello' && flies ? (
        <div class="reward-act">
          <button type="button" class="btn-gold" onClick={() => setBeat('fly')}>
            {T.takeOff}
          </button>
        </div>
      ) : shown ? (
        <LandReveal land={land} onDone={onDone} />
      ) : (
        <p class="reward-sub hatch-tip grow-say">
          {T.tapDragon(dragon.name)}
          <Speak text={[T.fedSay, T.tapDragonSay]} />
        </p>
      )}
    </div>
  )
}
