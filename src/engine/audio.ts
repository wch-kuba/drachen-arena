// Read-aloud with the device's own German voice (speechSynthesis). Works offline when the
// device has a local de-DE voice installed; otherwise `hasVoice()` is false and the UI
// shows a quiet fallback.

const RATE = 0.8
const PREFERRED = /anna/i

let voice: SpeechSynthesisVoice | null = null
let ready: Promise<SpeechSynthesisVoice | null> | undefined
const listeners = new Set<(ok: boolean) => void>()

const synth = () => (typeof speechSynthesis === 'undefined' ? undefined : speechSynthesis)

export function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const de = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('de'))
  if (de.length === 0) return null
  const score = (v: SpeechSynthesisVoice) =>
    (PREFERRED.test(v.name) ? 4 : 0) + (v.localService ? 2 : 0) + (v.lang.toLowerCase() === 'de-de' ? 1 : 0)
  return [...de].sort((a, b) => score(b) - score(a))[0]
}

/** Voices load asynchronously (Safari fills the list late). Resolves once, then caches. */
export function initVoice(): Promise<SpeechSynthesisVoice | null> {
  const s = synth()
  if (!s) return Promise.resolve(null)
  ready ??= new Promise((resolve) => {
    const tryPick = () => {
      const v = pickVoice(s.getVoices())
      if (v) {
        voice = v
        s.removeEventListener?.('voiceschanged', tryPick)
        listeners.forEach((l) => l(true))
        resolve(v)
      }
    }
    tryPick()
    if (voice) return
    s.addEventListener?.('voiceschanged', tryPick)
    // No German voice after a while: give up quietly (a later voiceschanged still upgrades).
    setTimeout(() => resolve(voice), 2000)
  })
  return ready
}

export const hasVoice = () => voice !== null

/** Notified when a voice turns up later than the first check. */
export function onVoice(fn: (ok: boolean) => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function speak(text: string) {
  const s = synth()
  if (!s || !voice) return false
  s.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.voice = voice
  u.lang = voice.lang
  u.rate = RATE
  s.speak(u)
  return true
}
