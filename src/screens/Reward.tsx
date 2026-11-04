import { useEffect } from 'preact/hooks'
import { play } from '../engine/sfx.ts'
import type { Stage } from '../engine/rewards.ts'
import { T } from '../strings.ts'
import { DragonPic, EggPic, Gem, GemPic, HoardLedge } from '../ui/art.tsx'

// End of a round: the round's crystals drop onto the hoard, the egg shows how close it is to
// hatching (one meter gem per 10 crystals), and the dragon of the day keeps the child company.
// When the egg is full, the one gold button leads to the hatching.

export interface EggState {
  /** Crystals in the egg, 0 … of. */
  filled: number
  of: number
  ready: boolean
}

interface Props {
  /** Items right on the first try. */
  score: number
  total: number
  /** Crystals from the items, without the round bonus. */
  crystals: number
  bonus: number
  egg: EggState
  /** The dragon in the egg (eggKind), so the egg shows its colors. */
  eggKind: string
  dragon?: { kind: string; name: string; stage: Stage }
  onAgain: () => void
  onHome: () => void
  onHatch: () => void
}

const MAX_DROPS = 5
const METER = 10

export function Reward({ score, total, crystals, bonus, egg, eggKind, dragon, onAgain, onHome, onHatch }: Props) {
  useEffect(() => play('round'), [])
  const drops = Math.min(MAX_DROPS, Math.ceil((crystals + bonus) / 3))
  const fill = egg.ready ? 1 : Math.min(1, egg.filled / egg.of)
  const lit = egg.ready ? METER : Math.floor(fill * METER)

  return (
    <div class="reward grotto">
      <div class="reward-head">
        <h1>{T.roundScore(score, total)}</h1>
        <p class="reward-sub">
          <GemPic class="inline-gem" /> {T.roundCrystals(crystals + bonus)}
        </p>
        {bonus > 0 && <p class="reward-bonus">{T.roundBonus(bonus)}</p>}
      </div>
      <div class="reward-art">
        {/* The egg rests on the hoard; the round's crystals drop onto the pile around it. */}
        <div class="reward-egg">
          <EggPic kind={eggKind} isNew={egg.ready} />
        </div>
        <div class="reward-pile">
          {Array.from({ length: drops }, (_, i) => (
            <span class="drop-gem" style={{ '--i': i, '--x': `${10 + i * 18}%` }}>
              <GemPic />
            </span>
          ))}
          <HoardLedge gems={0} size={0.7} />
          {dragon && (
            <DragonPic class="reward-dragon" kind={dragon.kind} stage={dragon.stage} pose="happy" label={dragon.name} />
          )}
        </div>
      </div>
      <div class="reward-act">
        <div class="egg-meter" role="img" aria-label={egg.ready ? T.eggReady : T.eggLeft(egg.of - egg.filled)}>
          {Array.from({ length: METER }, (_, i) => (
            <Gem filled={i < lit} />
          ))}
        </div>
        <p class="reward-sub">{egg.ready ? T.eggReady : T.eggLeft(egg.of - egg.filled)}</p>
        {dragon && !egg.ready && <p class="reward-sub reward-friend">{T.dragonOfDay(dragon.name)}</p>}
        {egg.ready ? (
          <button type="button" class="btn-gold" onClick={onHatch}>
            {T.toEgg}
          </button>
        ) : (
          <>
            <button type="button" class="btn-gold" onClick={onAgain}>
              {T.again}
            </button>
            <button type="button" class="reward-home" onClick={onHome}>
              {T.home}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
