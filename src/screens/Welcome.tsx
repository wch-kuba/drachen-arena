import { T } from '../strings.ts'
import { DRAGONS } from '../content/dragons.ts'
import { HoardScene } from '../ui/art.tsx'
import { NameEntry } from '../ui/NameEntry.tsx'

// First start: the child types their own name, so the grotto can greet them.
// In v2 the parent sets and changes the name in parent mode. The child's first egg already
// lies on the hoard: the story starts on the very first screen.

export function Welcome({ onName }: { onName: (name: string) => void }) {
  return (
    <div class="welcome grotto">
      <div class="welcome-head">
        <h1>{T.hello('')}</h1>
        <div class="welcome-ledge">
          <HoardScene size={0.25} on={{ egg: DRAGONS[0].id }} />
        </div>
      </div>
      <NameEntry label={T.askName} onDone={onName} />
    </div>
  )
}
