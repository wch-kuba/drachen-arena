// Sound effects (plan/v1-06-rewards.md › Sound effects). Bundled MP3s from public/sfx/,
// made by scripts/gen-sfx.ts. Web Audio, so short sounds start at once and can overlap.
// iOS only lets audio start inside a tap, so the context is created and resumed on the
// first touch or key. Effects are on by default; the Home ambience is off by default.

export type Sfx = 'right' | 'gem' | 'key' | 'hint' | 'round' | 'wobble' | 'hatch' | 'land'
type Loop = 'grotto' | 'snore'

const ALL: (Sfx | Loop)[] = ['right', 'gem', 'key', 'hint', 'round', 'wobble', 'hatch', 'land', 'grotto', 'snore']

let ctx: AudioContext | undefined
const buffers = new Map<string, Promise<AudioBuffer | undefined>>()
let on = true
let wantAmbient = false
let ambient: { stop: () => void } | undefined

function load(name: string) {
  if (!ctx) return Promise.resolve(undefined)
  let b = buffers.get(name)
  if (!b) {
    const c = ctx
    b = fetch(`${import.meta.env.BASE_URL}sfx/${name}.mp3`)
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
    src.connect(c.destination)
    src.start()
  })
}

/** Master switch for every sound effect and the ambience (the voice is not affected). */
export function setSound(enabled: boolean) {
  on = enabled
  syncAmbient()
}

/** Grotto ambience and the dragon's snore, looped quietly; only while Home is open. */
export function setAmbient(enabled: boolean) {
  wantAmbient = enabled
  syncAmbient()
}

function syncAmbient() {
  const should = on && wantAmbient && !!ctx
  if (!should) {
    ambient?.stop()
    ambient = undefined
    return
  }
  if (ambient) return
  const c = ctx!
  const sources: AudioBufferSourceNode[] = []
  let stopped = false
  ambient = {
    stop: () => {
      stopped = true
      sources.forEach((s) => s.stop())
    },
  }
  for (const name of ['grotto', 'snore'] as const) {
    void load(name).then((buf) => {
      if (!buf || stopped) return
      const s = c.createBufferSource()
      s.buffer = buf
      s.loop = true
      s.connect(c.destination)
      s.start()
      sources.push(s)
    })
  }
}
