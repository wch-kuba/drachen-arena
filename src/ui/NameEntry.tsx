import { useState } from 'preact/hooks'
import { Keyboard } from './Keyboard.tsx'
import { Speak } from './Speak.tsx'

// Typing a name on the in-app keyboard: the child's own name on first start, a new dragon's
// name after hatching. Shift is on for the first letter, because names start with a capital.

const MAX = 12

export function NameEntry({ label, onDone }: { label: string; onDone: (name: string) => void }) {
  const [text, setText] = useState('')
  const [upper, setUpper] = useState(true)
  const name = text.trim()

  return (
    <div class="name-entry">
      <div class="plaque name-field">
        <div class="name-ask">
          <span id="name-label">{label}</span>
          <Speak text={label} />
        </div>
        <div class="name-line" role="textbox" aria-labelledby="name-label" aria-readonly="true">
          {text}
          <span class="name-caret" aria-hidden="true" />
        </div>
      </div>
      <Keyboard
        upper={upper}
        canSubmit={name.length > 0}
        onKey={(ch) => {
          setText((t) => ([...t].length >= MAX ? t : t + ch))
          setUpper(false)
        }}
        onBackspace={() =>
          setText((t) => {
            const rest = [...t].slice(0, -1).join('')
            if (!rest) setUpper(true)
            return rest
          })
        }
        onShift={() => setUpper((u) => !u)}
        onDone={() => name && onDone(name)}
      />
    </div>
  )
}
