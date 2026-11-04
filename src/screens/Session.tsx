import { useState } from 'preact/hooks'
import { useGame } from '../engine/game.tsx'
import { pickRound } from '../engine/leitner.ts'
import { roundCrystals, roundFirstTries, type Round } from '../engine/round.ts'
import type { ExerciseType } from '../engine/types.ts'
import { RoundPlayer } from './Exercise.tsx'
import { Reward } from './Reward.tsx'

// One play session in a land: a round of up to 10 items, then the summary, then again or home.
// Every finished item is saved at once, so closing the app mid-round keeps its crystals.

export function Session({ type, onExit }: { type: ExerciseType; onExit: () => void }) {
  const { data, finishItem } = useGame()
  const [n, setN] = useState(0)
  const [items, setItems] = useState(() => pickRound(data.items, data.progress, type, Date.now()))
  const [done, setDone] = useState<Round | null>(null)

  if (done) {
    return (
      <Reward
        score={roundFirstTries(done)}
        total={done.items.length}
        crystals={roundCrystals(done)}
        onHome={onExit}
        onAgain={() => {
          setItems(pickRound(data.items, data.progress, type, Date.now()))
          setN(n + 1)
          setDone(null)
        }}
      />
    )
  }

  return <RoundPlayer key={n} items={items} onItemDone={finishItem} onRoundDone={setDone} onExit={onExit} />
}
