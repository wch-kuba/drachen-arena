import { useState } from 'preact/hooks'
import { Gem, HoardLedge, IconClose, IconSpeaker } from '../ui/art.tsx'

// Demo of exercise 1, mode B: mark letters in a sentence and color them like the school test.
// gelb = Selbstlaut, grün = Zwielaut, blau = Umlaut. These three colors appear nowhere else.
// A Zwielaut is two letters (au, ei, eu, äu): the child taps both, then the color.

type Color = 'gelb' | 'gruen' | 'blau'
const SENTENCE = 'Die Mäuse laufen'

// Demo state: "Die" done (i, e are Selbstlaute), "au" in "laufen" done, "äu" in "Mäuse" selected.
const START: Record<string, Color> = { '0-1': 'gelb', '0-2': 'gelb', '2-1': 'gruen', '2-2': 'gruen' }

export function Sort({ onExit }: { onExit?: () => void }) {
  const [marks, setMarks] = useState<Record<string, Color>>(START)
  const [sel, setSel] = useState<string[]>(['1-1', '1-2'])

  const toggle = (id: string) => setSel(sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id])

  const paint = (c: Color) => {
    if (!sel.length) return
    const next = { ...marks }
    for (const id of sel) next[id] = c
    setMarks(next)
    setSel([])
  }

  return (
    <div class="ex grotto">
      <div class="ex-bar">
        <button type="button" class="btn-round" aria-label="Zurück zur Grotte" onClick={onExit}>
          <IconClose />
        </button>
        <div class="gem-track">
          {Array.from({ length: 10 }, (_, i) => (
            <Gem filled={i < 6} />
          ))}
        </div>
      </div>

      <div class="ex-left">
        <div class="plaque ex-card">
          <div class="ex-ask">
            <button type="button" class="btn-round" aria-label="Vorlesen">
              <IconSpeaker />
            </button>
            Tipp auf die Buchstaben. Dann auf die Farbe.
          </div>
          <p class="sentence">
            {SENTENCE.split(' ').map((word, wi) => (
              <span class="w">
                {[...word].map((ch, li) => {
                  const id = `${wi}-${li}`
                  return (
                    <button
                      type="button"
                      class="l"
                      data-c={marks[id]}
                      data-sel={sel.includes(id) ? '' : undefined}
                      aria-pressed={sel.includes(id)}
                      onClick={() => toggle(id)}
                    >
                      {ch}
                    </button>
                  )
                })}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div class="ex-right">
        <div class="ledge">
          <HoardLedge gems={6} />
        </div>
        <div class="legend">
          <button type="button" class="gelb" onClick={() => paint('gelb')}>
            <b>a e i o u</b>
            Selbstlaut
          </button>
          <button type="button" class="gruen" onClick={() => paint('gruen')}>
            <b>
              au ei
              <br />
              eu äu
            </b>
            Zwielaut
          </button>
          <button type="button" class="blau" onClick={() => paint('blau')}>
            <b>ä ö ü</b>
            Umlaut
          </button>
        </div>
        <button type="button" class="btn-gold">
          Fertig
        </button>
      </div>
    </div>
  )
}
