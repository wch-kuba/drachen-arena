import { Gem, HoardLedge, IconClose, IconSpeaker, MarkLong, MarkShort } from '../ui/art.tsx'

// Demo of exercise 4: hear the word, decide if the marked vowel is short (•) or long (–).

export function ShortLong({ onExit }: { onExit?: () => void }) {
  return (
    <div class="ex grotto">
      <div class="ex-bar">
        <button type="button" class="btn-round" aria-label="Zurück zur Grotte" onClick={onExit}>
          <IconClose />
        </button>
        <div class="gem-track">
          {Array.from({ length: 10 }, (_, i) => (
            <Gem filled={i < 4} />
          ))}
        </div>
      </div>

      <div class="ex-left">
        <div class="plaque ex-card">
          <div class="ex-ask">
            <button type="button" class="btn-round" aria-label="Wort anhören">
              <IconSpeaker />
            </button>
            Hör gut zu. Kurz oder lang?
          </div>
          <p class="marks-word">
            Sch<u>a</u>f
          </p>
        </div>
      </div>

      <div class="ex-right">
        <div class="ledge">
          <HoardLedge gems={4} />
        </div>
        <div class="marks">
          <button type="button" class="mark-btn">
            <MarkShort />
            kurz
          </button>
          <button type="button" class="mark-btn">
            <MarkLong />
            lang
          </button>
        </div>
      </div>
    </div>
  )
}
