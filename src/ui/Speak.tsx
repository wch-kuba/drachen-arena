import { useEffect, useState } from 'preact/hooks'
import { canSpeak, initVoice, onVoice, speak } from '../engine/audio.ts'
import { T } from '../strings.ts'
import { IconSpeaker } from './art.tsx'

// Read-aloud button. Plays the bundled voice clips, falling back to the device voice.
// With neither it stays in place but goes quiet (clouded glass, soft ink), so the layout
// never jumps and nothing nags the child.

export function Speak({ text, label = T.readAloud }: { text: string | string[]; label?: string }) {
  const parts = Array.isArray(text) ? text : [text]
  const [, setVoiceReady] = useState(false)

  useEffect(() => {
    void initVoice().then((v) => setVoiceReady(!!v))
    return onVoice(setVoiceReady)
  }, [])

  const ok = canSpeak(parts)
  return (
    <button
      type="button"
      class="btn-round speak"
      aria-label={ok ? label : T.noVoice}
      aria-disabled={ok ? undefined : 'true'}
      data-mute={ok ? undefined : ''}
      onClick={() => ok && speak(parts)}
    >
      <IconSpeaker />
    </button>
  )
}
