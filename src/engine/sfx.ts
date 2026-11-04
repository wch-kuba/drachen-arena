// Sound effects (plan/v1-06-rewards.md › Sound effects). Bundled from public/sfx/: MP3s made
// by scripts/gen-sfx.ts, the key click a WAV made by scripts/gen-click.ts (no encoder delay). Web Audio, so short sounds start at once and can overlap.
// iOS only lets audio start inside a tap, so the context is created and resumed on the
// first touch or key. Effects are on by default; the atmosphere (music + water) is off by default.

export type Sfx = 'right' | 'gem' | 'key' | 'hint' | 'round' | 'wobble' | 'hatch' | 'land'
type Loop = 'music' | 'grotto'

// The music loop (~25 MB decoded) loads only when the atmosphere is first wanted.
const ALL: Sfx[] = ['right', 'gem', 'key', 'hint', 'round', 'wobble', 'hatch', 'land']
const FILE: Partial<Record<Sfx | Loop, string>> = { key: 'key.wav' }
/** Sounds repeated in quick runs get a small random pitch, so typing doesn't sound mechanical. */
const VARY: Partial<Record<Sfx, number>> = { key: 0.06 }

let ctx: AudioContext | undefined
const buffers = new Map<string, Promise<AudioBuffer | undefined>>()
let on = true
let wantAtmo = false
/** Screens that want the atmosphere right now (Home, the round reward). */
let scenes = 0
let atmo: { gain: GainNode; stop: () => void } | undefined
let leaveTimer: ReturnType<typeof setTimeout> | undefined
let ducked = false

function load(name: string) {
  if (!ctx) return Promise.resolve(undefined)
  let b = buffers.get(name)
  if (!b) {
    const c = ctx
    b = fetch(`${import.meta.env.BASE_URL}sfx/${FILE[name as Sfx | Loop] ?? `${name}.mp3`}`)
      .then((r) => r.arrayBuffer())
      .then((a) => c.decodeAudioData(a))
      .catch(() => undefined)
    buffers.set(name, b)
  }
  return b
}

function unlock() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx = new AC()
    ALL.forEach((n) => void load(n))
  }
  if (ctx.state === 'suspended') void ctx.resume()
  syncAmbient()
}

let started = false
/** Once, at app start: wait for the first tap, pause everything while the app is hidden. */
export function initSfx() {
  if (started) return
  started = true
  addEventListener('pointerdown', unlock, { capture: true })
  addEventListener('keydown', unlock, { capture: true })
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) void ctx.suspend()
    else void ctx.resume()
  })
}

export function play(name: Sfx) {
  if (!on || !ctx) return
  const c = ctx
  void load(name).then((buf) => {
    if (!buf || !on) return
    const src = c.createBufferSource()
    src.buffer = buf
    const vary = VARY[name]
    if (vary) src.playbackRate.value = 1 + (Math.random() * 2 - 1) * vary
    src.connect(c.destination)
    src.start()
  })
}

/** Master switch for every sound effect and the atmosphere (the voice is not affected). */
export function setSound(enabled: boolean) {
  on = enabled
  syncAmbient()
}

/** The child's atmosphere switch on Home (profile.ambient): background music with quiet water. */
export function setAmbient(enabled: boolean) {
  wantAtmo = enabled
  syncAmbient()
}

/**
 * A screen where the atmosphere may play (Home, the round reward; never an exercise).
 * Returns the cleanup. Leaving waits a moment, so Reward → Home keeps the music going.
 */
export function atmosphereHere() {
  scenes++
  clearTimeout(leaveTimer)
  syncAmbient()
  return () => {
    scenes--
    clearTimeout(leaveTimer)
    leaveTimer = setTimeout(syncAmbient, 250)
  }
}

/** Music level, its level under the voice, and the quiet water underneath. */
const LEVEL = 1
const DUCKED = 0.3
const WATER = 0.5
const FADE_IN = 1.5
const FADE_OUT = 0.6

/** The voice is talking: the music steps back so every word stays clear. */
export function duck(talking: boolean) {
  ducked = talking
  if (!atmo || !ctx) return
  ramp(atmo.gain, ducked ? DUCKED : LEVEL, talking ? 0.15 : 0.6)
}

function ramp(g: GainNode, to: number, seconds: number) {
  const t = ctx!.currentTime
  g.gain.cancelScheduledValues(t)
  g.gain.setValueAtTime(g.gain.value, t)
  g.gain.linearRampToValueAtTime(to, t + seconds)
}

function syncAmbient() {
  const should = on && wantAtmo && scenes > 0 && !!ctx
  if (!should) {
    atmo?.stop()
    atmo = undefined
    return
  }
  if (atmo) return
  const c = ctx!
  const gain = c.createGain()
  gain.gain.value = 0
  gain.connect(c.destination)
  const sources: AudioBufferSourceNode[] = []
  let stopped = false
  const me = {
    gain,
    stop: () => {
      stopped = true
      ramp(gain, 0, FADE_OUT)
      sources.forEach((s) => s.stop(c.currentTime + FADE_OUT))
      setTimeout(() => gain.disconnect(), FADE_OUT * 1000 + 100)
    },
  }
  atmo = me
  for (const [name, level] of [['music', 1], ['grotto', WATER]] as const) {
    void load(name).then((buf) => {
      if (!buf || stopped) return
      const s = c.createBufferSource()
      s.buffer = buf
      s.loop = true
      const g = c.createGain()
      g.gain.value = level
      s.connect(g).connect(gain)
      s.start()
      sources.push(s)
      // Fade in once the music itself is ready, not on the water alone.
      if (name === 'music') ramp(gain, ducked ? DUCKED : LEVEL, FADE_IN)
    })
  }
}
