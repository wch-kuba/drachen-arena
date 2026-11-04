import { useState } from 'preact/hooks'
import { Dragon, Egg, Gem, HoardLedge, ShellHalves } from '../ui/art.tsx'

// End of a round: the round's crystals drop onto the hoard first, then the egg shows
// how close it is to hatching. When the egg is full it hatches and the child names the dragon.

export function Reward({ hatch = false }: { hatch?: boolean }) {
  const [name, setName] = useState('')

  if (hatch) {
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

  return (
    <div class="reward grotto">
      <div class="reward-head">
        <h1>9 von 10!</h1>
        <p class="reward-sub">
          <Gem class="inline-gem" /> +12 Kristalle für deinen Schatz
        </p>
      </div>
      <div class="reward-art">
        {/* The egg rests on the hoard; the round's crystals drop onto the pile around it. */}
        <div class="reward-egg">
          <Egg crack={2} isNew />
        </div>
        <div class="reward-pile">
          {[0, 1, 2, 3, 4].map((i) => (
            <span class="drop-gem" style={{ '--i': i, '--x': `${10 + i * 18}%` }}>
              <Gem />
            </span>
          ))}
          <HoardLedge gems={10} dragon={false} />
        </div>
      </div>
      <div class="reward-act">
        <div class="egg-meter" aria-label="Noch 1 Runde, dann schlüpft dein Ei">
          {[0, 1, 2, 3].map((i) => (
            <Gem filled={i < 3} />
          ))}
        </div>
        <p class="reward-sub">Noch eine Runde, dann schlüpft dein Ei!</p>
        <button type="button" class="btn-gold">
          Noch eine Runde
        </button>
      </div>
    </div>
  )
}
