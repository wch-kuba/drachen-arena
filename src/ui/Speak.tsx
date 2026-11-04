import { useEffect, useState } from 'preact/hooks'
import { hasVoice, initVoice, onVoice, speak } from '../engine/audio.ts'
import { T } from '../strings.ts'
import { IconSpeaker } from './art.tsx'

// Read-aloud button. Without a German voice on the device it stays in place but goes quiet
// (clouded glass, soft ink), so the layout never jumps and nothing nags the child.

export function Speak({ text, label = T.readAloud }: { text: string; label?: string }) {
  const [ok, setOk] = useState(hasVoice())

  useEffect(() => {
    void initVoice().then((v) => setOk(!!v))
    return onVoice(setOk)
  }, [])

  return (
    <button
      type="button"
      class="btn-round speak"
      aria-label={ok ? label : T.noVoice}
      aria-disabled={ok ? undefined : 'true'}
      data-mute={ok ? undefined : ''}
      onClick={() => ok && speak(text)}
    >
      <IconSpeaker />
    </button>
  )
}
