import { useEffect } from 'preact/hooks'
import { atmosphereHere, play } from '../engine/sfx.ts'
import type { Stage } from '../engine/rewards.ts'
import { T } from '../strings.ts'
import { DragonPic, EggPic, Gem, GemPic, HoardLedge, STAGE_SCALE } from '../ui/art.tsx'

// End of a round: the round's crystals drop onto the hoard, and the one goal shows how close it
// is (one meter gem per 10 crystals): the egg, or the dragon being fed. When the goal is full,
// the one gold button leads to the hatching or the growing.

export interface DragonLook {
  kind: string
  name: string
  stage: Stage
}

/** What the crystals fill: an egg (its dragon's kind), the dragon being fed, or nothing left. */
export type RewardGoal = { egg: string } | { dragon: DragonLook } | { done: DragonLook | undefined }

interface Props {
  /** Items right on the first try. */
  score: number
  total: number
  /** Crystals from the items, without the round bonus. */
  crystals: number
  bonus: number
  goal: RewardGoal
  /** Crystals in the goal, 0 … of. */
  filled: number
  of: number
  ready: boolean
  onAgain: () => void
  onHome: () => void
  /** The goal is full: on to the hatching or the growing. */
  onReady: () => void
}

const MAX_DROPS = 5
const METER = 10

export function Reward({ score, total, crystals, bonus, goal, filled, of, ready, onAgain, onHome, onReady }: Props) {
  useEffect(() => play('round'), [])
  // The round's end is a Home-like moment: the atmosphere may play again.
  useEffect(() => atmosphereHere(), [])
  const drops = Math.min(MAX_DROPS, Math.ceil((crystals + bonus) / 3))
  const lit = ready ? METER : Math.floor(Math.min(1, filled / of) * METER)
  const fed = 'dragon' in goal ? goal.dragon : undefined
  const done = 'done' in goal
  const shown = fed ?? ('done' in goal ? goal.done : undefined)
  const caption = fed
    ? ready
      ? T.fedReady(fed.name)
      : T.feedLeft(of - filled, fed.name)
    : ready
      ? T.eggReady
      : T.eggLeft(of - filled)

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
        {/* The goal rests on the hoard; the round's crystals drop onto the pile around it. */}
        {'egg' in goal && (
          <div class="reward-egg">
            <EggPic kind={goal.egg} isNew={ready} />
          </div>
        )}
        {shown && (
          <div class="reward-fed" style={{ '--s': STAGE_SCALE[shown.stage] }}>
            <DragonPic kind={shown.kind} stage={shown.stage} pose="happy" label={shown.name} />
          </div>
        )}
        <div class="reward-pile">
          {Array.from({ length: drops }, (_, i) => (
            <span class="drop-gem" style={{ '--i': i, '--x': `${10 + i * 18}%` }}>
              <GemPic />
            </span>
          ))}
          <HoardLedge gems={0} size={0.7} />
        </div>
      </div>
      <div class="reward-act">
        {!done && (
          <>
            <div class="egg-meter" role="img" aria-label={caption}>
              {Array.from({ length: METER }, (_, i) => (
                <Gem filled={i < lit} />
              ))}
            </div>
            <p class="reward-sub">{caption}</p>
          </>
        )}
        {ready ? (
          <button type="button" class="btn-gold" onClick={onReady}>
            {fed ? T.toDragon(fed.name) : T.toEgg}
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
