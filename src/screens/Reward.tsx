import { useState } from 'preact/hooks'
import { T } from '../strings.ts'
import { Dragon, Egg, Gem, HoardLedge, ShellHalves } from '../ui/art.tsx'

// End of a round: the round's crystals drop onto the hoard first, then (Part 6) the egg shows
// how close it is to hatching. When the egg is full it hatches and the child names the dragon.

interface Summary {
  /** Items right on the first try. */
  score: number
  total: number
  crystals: number
  onAgain: () => void
  onHome: () => void
  /** Egg meter: Part 6 fills this from real progress. Hidden when absent. */
  egg?: { filled: number; of: number; caption: string }
}

const MAX_DROPS = 5

export function Reward(props: Summary | { hatch: true }) {
  const [name, setName] = useState('')

  if ('hatch' in props) {
    return (
      <div class="reward grotto">
        <div class="reward-head">
          <h1>Dein Ei ist geschlüpft!</h1>
          <p class="reward-sub">Ein neuer Drache ist da.</p>
        </div>
        <div class="reward-art">
          <svg viewBox="-10 -10 280 210" role="img" aria-label="Ein kleiner Drache in seiner Eierschale">
            <Dragon awake />
            <ShellHalves />
          </svg>
        </div>
        <div class="reward-act plaque name-field">
          <label for="dragon-name">Wie heißt dein Drache?</label>
          <input
            id="dragon-name"
            class="cell name-input"
            value={name}
            maxLength={14}
            autocomplete="off"
            autocapitalize="words"
            spellcheck={false}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
          />
          <button type="button" class="btn-gold" disabled={!name.trim()}>
            Fertig
          </button>
        </div>
      </div>
    )
  }

  const { score, total, crystals, onAgain, onHome, egg } = props
  const drops = Math.min(MAX_DROPS, Math.ceil(crystals / 3))

  return (
    <div class="reward grotto">
      <div class="reward-head">
        <h1>{T.roundScore(score, total)}</h1>
        <p class="reward-sub">
          <Gem class="inline-gem" /> {T.roundCrystals(crystals)}
        </p>
      </div>
      <div class="reward-art">
        {/* The egg rests on the hoard; the round's crystals drop onto the pile around it. */}
        <div class="reward-egg">
          <Egg crack={egg ? Math.min(3, egg.filled) : 0} isNew={!!egg} />
        </div>
        <div class="reward-pile">
          {Array.from({ length: drops }, (_, i) => (
            <span class="drop-gem" style={{ '--i': i, '--x': `${10 + i * 18}%` }}>
              <Gem />
            </span>
          ))}
          <HoardLedge gems={10} dragon={false} />
        </div>
      </div>
      <div class="reward-act">
        {egg && (
          <>
            <div class="egg-meter" aria-label={egg.caption}>
              {Array.from({ length: egg.of }, (_, i) => (
                <Gem filled={i < egg.filled} />
              ))}
            </div>
            <p class="reward-sub">{egg.caption}</p>
          </>
        )}
        <button type="button" class="btn-gold" onClick={onAgain}>
          {T.again}
        </button>
        <button type="button" class="reward-home" onClick={onHome}>
          {T.home}
        </button>
      </div>
    </div>
  )
}
