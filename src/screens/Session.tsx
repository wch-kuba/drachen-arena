import { useState } from 'preact/hooks'
import { useGame } from '../engine/game.tsx'
import { pickRound } from '../engine/leitner.ts'
import { dragonOfTheDay, EGG_COST, ROUND_BONUS, stageOf } from '../engine/rewards.ts'
import { roundCrystals, roundFirstTries, type Round } from '../engine/round.ts'
import type { ExerciseType } from '../engine/types.ts'
import { RoundPlayer } from './Exercise.tsx'
import { Reward } from './Reward.tsx'

// One play session in a land: a round of up to 10 items, then the summary, then again or home.
// Every finished item is saved at once, so closing the app mid-round keeps its crystals.
// The round bonus and a ready egg are saved when the round ends.

export function Session({ type, onExit }: { type: ExerciseType; onExit: () => void }) {
  const { data, finishItem, finishRound } = useGame()
  const [n, setN] = useState(0)
  const [items, setItems] = useState(() => pickRound(data.items, data.progress, type, Date.now()))
  const [done, setDone] = useState<Round | null>(null)

  if (done) {
    const p = data.profile
    const friend = dragonOfTheDay(p, Date.now())
    return (
      <Reward
        score={roundFirstTries(done)}
        total={done.items.length}
        crystals={roundCrystals(done)}
        bonus={done.results.length ? ROUND_BONUS : 0}
        egg={{ filled: p.eggCrystals, of: EGG_COST, ready: !!p.pendingHatch }}
        dragon={friend && { kind: friend.kind, name: friend.name, stage: stageOf(friend, p.rounds) }}
        onHome={onExit}
        onHatch={onExit}
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
