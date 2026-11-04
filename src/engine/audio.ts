// Read-aloud. Every text with a bundled AI voice clip (scripts/gen-audio.ts) plays a clip,
// offline. Text without a clip falls back to the device's German voice (speechSynthesis).
// With neither, `canSpeak()` is false and the UI shows a quiet speaker button.

import manifest from '../content/audio-manifest.json'
import { speechKey } from '../content/speech.ts'
import { duck } from './sfx.ts'

/** Text → its clips. Words have one clip per voice; a random one plays each time. */
const CLIPS: Record<string, string[]> = manifest.clips
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

export function clipFor(text: string): string | undefined {
  const clips = CLIPS[speechKey(text)]
  return clips?.length ? clips[Math.floor(Math.random() * clips.length)] : undefined
}

/** True when every part can be heard: a clip, or else the device voice. */
export const canSpeak = (parts: string[]) => parts.every((p) => clipFor(p)) || hasVoice()

/** Notified when a device voice turns up later than the first check. */
export function onVoice(fn: (ok: boolean) => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// One reused <audio> element: iOS lets it play once a tap has started it.
let player: HTMLAudioElement | undefined
/** Bumped on every speak(), so a new tap cuts off the old sequence. */
let run = 0

function playClip(src: string, token: number): Promise<void> {
  player ??= new Audio()
  const p = player
  return new Promise((resolve) => {
    if (token !== run) return resolve()
    const done = () => {
      p.onended = p.onerror = null
      resolve()
    }
    p.onended = done
    p.onerror = done
    p.src = import.meta.env.BASE_URL + src
    p.play().catch(done)
  })
}

function sayDevice(text: string, token: number): Promise<void> {
  const s = synth()
  if (!s || !voice || token !== run) return Promise.resolve()
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice
    u.lang = voice!.lang
    u.rate = RATE
    u.onend = u.onerror = () => resolve()
    s.speak(u)
  })
}

/** Read the parts one after another. Returns false when nothing can be heard. */
export function speak(text: string | string[]): boolean {
  const parts = Array.isArray(text) ? text : [text]
  if (!canSpeak(parts)) return false
  const token = ++run
  player?.pause()
  synth()?.cancel()
  // The background music steps back while the voice talks.
  duck(true)
  void (async () => {
    for (const part of parts) {
      if (token !== run) return
      const clip = clipFor(part)
      await (clip ? playClip(clip, token) : sayDevice(part, token))
    }
    if (token === run) duck(false)
  })()
  return true
}
