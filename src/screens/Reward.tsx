import { useEffect } from 'preact/hooks'
import { speak } from '../engine/audio.ts'
import { atmosphereHere, play } from '../engine/sfx.ts'
import type { Stage } from '../engine/rewards.ts'
import { T } from '../strings.ts'
import { Coin, DragonPic, EggPic, Gem, GemPic, HoardLedge, STAGE_SCALE } from '../ui/art.tsx'

// End of a round: the round's crystals drop onto the hoard, and the one goal shows how close it
// is (one meter gem per 10 crystals): the egg, or the dragon being fed. When the goal is full,
// the one gold button leads to the hatching or the growing.
// A perfect round (every item right on the first try) gets a bigger show: coins and gems rain,
// the goal on the pile does a loop, the narrator cheers. It pays the same crystals as any round.

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
  /** Every item right on the first try: the bigger show (same crystals). */
  perfect?: boolean
  onAgain: () => void
  onHome: () => void
  /** The goal is full: on to the hatching or the growing. */
  onReady: () => void
}

const MAX_DROPS = 5
const METER = 10
/** The rain of a perfect round: where each piece falls (% of the width), how big, how late. */
const RAIN = [6, 58, 24, 86, 40, 72, 14, 94, 50, 32, 80, 66, 20, 44, 10, 62, 36, 90, 54, 28].map((x, i) => ({ x, size: 1.5 + ((i * 7) % 5) * 0.28, delay: 200 + i * 75, coin: i % 3 !== 1 }))
const ROAR_PITCH = { hatchling: 1.3, young: 1.12, grown: 1 } as const

export function Reward({ score, total, crystals, bonus, goal, filled, of, ready, perfect = false, onAgain, onHome, onReady }: Props) {
  useEffect(() => play('round'), [])
  const roarAs = 'dragon' in goal ? goal.dragon.stage : 'done' in goal ? goal.done?.stage : undefined
  useEffect(() => {
    if (!perfect) return
    // The cheer after the coin cascade; the dragon roars as it lands from its loop.
    const say = window.setTimeout(() => speak(T.perfect), 900)
    const roar = roarAs ? window.setTimeout(() => play('roar', ROAR_PITCH[roarAs]), 1750) : undefined
    return () => {
      clearTimeout(say)
      clearTimeout(roar)
    }
  }, [])
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
    <div class="reward grotto" data-perfect={perfect ? '' : undefined}>
      {perfect && (
        <div class="perfect-rain" aria-hidden="true">
          {RAIN.map((r) => (
            <span style={{ left: `${r.x}%`, width: `${r.size}rem`, animationDelay: `${r.delay}ms` }}>{r.coin ? <Coin /> : <GemPic />}</span>
          ))}
        </div>
      )}
      <div class="reward-head">
        <h1>{T.roundScore(score, total)}</h1>
        {perfect && <p class="reward-perfect">{T.perfect}</p>}
        <p class="reward-sub">
          <GemPic class="inline-gem" /> {T.roundCrystals(crystals + bonus)}
        </p>
        {bonus > 0 && <p class="reward-bonus">{T.roundBonus(bonus)}</p>}
      </div>
      <div class="reward-art">
        {/* The goal rests on the hoard; the round's crystals drop onto the pile around it. */}
        {'egg' in goal && (
          <div class="reward-egg">
            <EggPic kind={goal.egg} isNew={ready} fill={filled / of} />
          </div>
        )}
        {shown && (
          <div class="reward-fed" data-full={fed && !ready && filled / of >= 0.9 ? '' : undefined} style={{ '--s': STAGE_SCALE[shown.stage] }}>
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
