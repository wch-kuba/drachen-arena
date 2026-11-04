import { T } from '../strings.ts'
import { HoardLedge } from '../ui/art.tsx'
import { NameEntry } from '../ui/NameEntry.tsx'

// First start: the child types their own name, so the grotto can greet them.
// In v2 the parent sets and changes the name in parent mode.

export function Welcome({ onName }: { onName: (name: string) => void }) {
  return (
    <div class="welcome grotto">
      <div class="welcome-head">
        <h1>{T.hello('')}</h1>
        <HoardLedge gems={4} class="welcome-ledge" />
      </div>
      <NameEntry label={T.askName} onDone={onName} />
    </div>
  )
}
