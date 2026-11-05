import { useEffect, useState } from 'preact/hooks'
import { play } from '../engine/sfx.ts'
import { useGame } from '../engine/game.tsx'
import { pickRound } from '../engine/leitner.ts'
import { goalOf, ROUND_BONUS, stageBefore, STEP_COST } from '../engine/rewards.ts'
import { roundCrystals, roundFirstTries, type Round } from '../engine/round.ts'
import type { ExerciseType, Profile } from '../engine/types.ts'
import { RoundPlayer } from './Exercise.tsx'
import { Reward, type RewardGoal } from './Reward.tsx'

// One play session in a land: a round of up to 10 items, then the summary, then again or home.
// Every finished item is saved at once, so closing the app mid-round keeps its crystals.
// The round bonus and a full goal (ready egg, grown dragon) are saved when the round ends.

export function Session({ type, onExit }: { type: ExerciseType; onExit: () => void }) {
  const { data, finishItem, finishRound } = useGame()
  const [n, setN] = useState(0)
  const [items, setItems] = useState(() => pickRound(data.items, data.progress, type, Date.now()))
  const [done, setDone] = useState<Round | null>(null)
  useEffect(() => play('land'), [])

  const p = data.profile

  if (done) {
    return (
      <Reward
        score={roundFirstTries(done)}
        total={done.items.length}
        crystals={roundCrystals(done)}
        bonus={done.results.length ? ROUND_BONUS : 0}
        goal={rewardGoal(p)}
        filled={p.goalCrystals}
        of={STEP_COST}
        ready={!!(p.pendingHatch || p.pendingGrowth)}
        onHome={onExit}
        onReady={onExit}
        onAgain={() => {
          setItems(pickRound(data.items, data.progress, type, Date.now()))
          setN(n + 1)
          setDone(null)
        }}
      />
    )
  }

  return (
    <RoundPlayer
      key={n}
      items={items}
      onItemDone={finishItem}
      onRoundDone={(r) => {
        // An empty land has no round to reward.
        if (r.results.length) finishRound(type)
        setDone(r)
      }}
      onExit={onExit}
    />
  )
}

/** The goal the summary shows. A dragon that just grew still shows its old size: Grow reveals it. */
function rewardGoal(p: Profile): RewardGoal {
  const grew = p.pendingGrowth && p.dragons.find((d) => d.id === p.pendingGrowth!.id)
  if (grew) return { dragon: { ...grew, stage: stageBefore(grew.stage) } }
  const goal = goalOf(p)
  if ('egg' in goal) return goal
  if ('dragon' in goal) return { dragon: goal.dragon }
  return { done: p.dragons.at(-1) }
}
