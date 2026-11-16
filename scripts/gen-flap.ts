// Wing-flap sprites for the Drachenflug (plan/v1-06b-delight.md › Generated video).
// Build time only, on the parent's machine: the child's app plays the bundled sprite sheets.
//
//   npm run flap -- gen [kind…]      make the missing clips (--redo to replace), ~$0.21 each
//   npm run flap -- build            clips → public/img/flap/<kind>.webp + src/content/flap-manifest.json
//   npm run flap -- dive             the shared take-off clip, landscape and portrait (~$0.28 each)
//                                    → public/video/dive-*.mp4 (--redo for new takes)
//
// How: each dragon's picked flying picture (art-raw/fly, from `npm run images`) is put on a flat
// key color and sent to Gemini Omni Flash as the first AND the last frame of a 3 s clip, so the
// flapping ends where it starts. `build` cuts one wing beat out of the clip (the frame that
// looks most like the first one closes the loop), removes the key color and lays up to FRAMES
// frames out in rows of COLS.
//
// Needs GEMINI_API_KEY in .env.local (paid tier; never commit it), ffmpeg and ImageMagick.
// Clips stay in art-raw/video/ (gitignored). Model, prompt and date per sprite: flap-manifest.json
// is the bundled lookup, src/content/image-sources.json the license record (see ASSETS.md).

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DRAGONS } from '../src/content/dragons.ts'
import { FLY_FACES_LEFT } from '../src/content/picture-prompts.ts'

const ROOT = new URL('..', import.meta.url).pathname
const RAW = join(ROOT, 'art-raw')
const VIDEO = join(RAW, 'video')
const OUT = join(ROOT, 'public/img/flap')
const MANIFEST = join(ROOT, 'src/content/flap-manifest.json')
const SOURCES = join(ROOT, 'src/content/image-sources.json')

const MODEL = 'gemini-omni-1.2-flash'
const SECONDS = 3
const FPS = 24
/** Frames in a sprite (every frame of a one-second beat, so it plays as smoothly as the clip), in
 *  rows of COLS, and the width of one frame. 12 × 340 stays under the 4096 px texture limit of older iPads. */
const FRAMES = 24
const COLS = 12
const FRAME_W = 340

/** The key color must be far from every color of the dragon. */
const KEYS = { magenta: 'ff00ff', green: '00ff00', blue: '0000ff' } as const
const KEY_OF: Record<string, keyof typeof KEYS> = {
  echo: 'green', // violet body
  koralle: 'green', // red and coral pink
  muschel: 'green', // coral pink armor
  kristall: 'green', // lavender
  schatz: 'green', // ruby red
  lagune: 'blue', // lime green with pink gills
}
const keyOf = (kind: string) => KEY_OF[kind] ?? 'magenta'

const prompt = (key: string) =>
  `Animate this picture-book dragon flying in place, seen exactly from the side, facing right. If it has wings, they beat down and up in two strong, smooth flaps; if it has none, its body and fins wave like a swimming sea creature. The body rises and sinks slightly with each beat and the tail sways. The dragon stays the same size in the centre of the frame and never leaves it. The camera is locked: no zoom, no pan, no cuts. Keep the flat gouache illustration style with thick dark-teal outlines, the same colors and the same character in every frame; never add or remove wings, legs or heads. The background stays a perfectly flat, solid ${key} everywhere: no shadows, no glow, no particles, no bubbles, no gradients, no text. The video ends on exactly the same pose it starts with, so it loops. Silent.`

const clip = (kind: string) => join(VIDEO, `${kind}.mp4`)

async function gen(kind: string) {
  const src = join(RAW, 'fly', `${kind}-v1.png`)
  if (!existsSync(src)) throw new Error(`${kind}: no flying picture (npm run images -- gen fly ${kind})`)
  const key = keyOf(kind)
  const keyed = join(VIDEO, `${kind}-key.png`)
  execFileSync('magick', [src, ...(FLY_FACES_LEFT.includes(kind) ? ['-flop'] : []), '-trim', '+repage', '-resize', '860x520', '-background', `#${KEYS[key]}`, '-gravity', 'center', '-extent', '1280x720', '-alpha', 'remove', '-alpha', 'off', keyed])
  const frame = { type: 'image', data: readFileSync(keyed).toString('base64'), mime_type: 'image/png' }
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! },
    body: JSON.stringify({
      model: MODEL,
      // The same picture as first and last frame: the flapping ends where it starts.
      input: [frame, frame, { type: 'text', text: prompt(`${key} (#${KEYS[key]})`) }],
      response_format: { type: 'video', duration: `${SECONDS}s`, aspect_ratio: '16:9', resolution: '720p' },
    }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`${kind}: ${res.status} ${JSON.stringify(body).slice(0, 400)}`)
  const video = findVideo(body)
  if (!video) throw new Error(`${kind}: no video in the answer`)
  writeFileSync(clip(kind), Buffer.from(video, 'base64'))
  const tokens = body.usage?.total_output_tokens
  console.log(`${kind}.mp4${tokens ? `  ~$${((tokens * 12) / 1e6).toFixed(2)}` : ''}`)
}

function findVideo(o: unknown): string | undefined {
  if (Array.isArray(o)) {
    for (const v of o) {
      const f = findVideo(v)
      if (f) return f
    }
  } else if (o && typeof o === 'object') {
    const r = o as Record<string, unknown>
    if (r.type === 'video' && typeof r.data === 'string') return r.data
    return findVideo(Object.values(r))
  }
}

/** One wing beat: frame 0 up to the later frame that looks most like it (0.7 to 2.2 s in). */
function loopEnd(file: string): number {
  const w = 96
  const h = 54
  const raw = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', file, '-vf', `fps=${FPS},scale=${w}:${h}`, '-pix_fmt', 'gray', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 })
  const n = Math.floor(raw.length / (w * h))
  const diff = (i: number) => {
    let s = 0
    for (let p = 0; p < w * h; p++) s += Math.abs(raw[p] - raw[i * w * h + p])
    return s
  }
  let best = Math.round(FPS * 0.7)
  for (let i = best; i < Math.min(n, Math.round(FPS * 2.2)); i++) if (diff(i) < diff(best)) best = i
  return best
}

function build() {
  mkdirSync(OUT, { recursive: true })
  const manifest: Record<string, { src: string; w: number; h: number; cols: number; rows: number; ms: number }> = {}
  const sources = existsSync(SOURCES) ? JSON.parse(readFileSync(SOURCES, 'utf8')) : {}
  const tmp = join(VIDEO, 'tmp')
  for (const { id } of DRAGONS) {
    if (!existsSync(clip(id))) continue
    rmSync(tmp, { recursive: true, force: true })
    mkdirSync(tmp, { recursive: true })
    const end = loopEnd(clip(id))
    const key = KEYS[keyOf(id)]
    // The whole beat with the key color cut out, as PNGs.
    execFileSync('ffmpeg', ['-loglevel', 'error', '-i', clip(id), '-vf', `fps=${FPS},trim=end_frame=${end},colorkey=0x${key}:0.3:0.12,format=rgba`, join(tmp, 'a%03d.png')])
    // Full rows of them, evenly spread over the beat; the last one is the frame before it starts again.
    const count = Math.min(FRAMES, Math.floor(end / COLS) * COLS)
    const picked = Array.from({ length: count }, (_, i) => join(tmp, `a${String(1 + Math.floor((i * end) / count)).padStart(3, '0')}.png`))
    // One box around the dragon in all frames, so it does not jump inside the sprite.
    const boxes = picked.map((f) => execFileSync('magick', [f, '-alpha', 'extract', '-threshold', '20%', '-format', '%@', 'info:']).toString().match(/(\d+)x(\d+)\+(\d+)\+(\d+)/)!.slice(1).map(Number))
    const x0 = Math.max(0, Math.min(...boxes.map((b) => b[2])) - 6)
    const y0 = Math.max(0, Math.min(...boxes.map((b) => b[3])) - 6)
    const x1 = Math.min(1280, Math.max(...boxes.map((b) => b[2] + b[0])) + 6)
    const y1 = Math.min(720, Math.max(...boxes.map((b) => b[3] + b[1])) + 6)
    const cut = picked.map((f, i) => {
      const o = join(tmp, `c${i}.png`)
      execFileSync('magick', [f, '-crop', `${x1 - x0}x${y1 - y0}+${x0}+${y0}`, '+repage', '-resize', `${FRAME_W}x`, o])
      return o
    })
    const strip = join(tmp, 'strip.png')
    const rows = count / COLS
    execFileSync('magick', [...Array.from({ length: rows }, (_, r) => ['(', ...cut.slice(r * COLS, (r + 1) * COLS), '+append', ')']).flat(), '-append', strip])
    const out = join(OUT, `${id}.webp`)
    execFileSync('cwebp', ['-quiet', '-m', '6', '-q', '72', '-alpha_q', '80', strip, '-o', out])
    const [w, h] = execFileSync('magick', ['identify', '-format', '%w %h', cut[0]]).toString().split(' ').map(Number)
    manifest[id] = { src: `img/flap/${id}.webp`, w, h, cols: COLS, rows, ms: Math.round((end / FPS) * 1000) }
    const rel = `img/flap/${id}.webp`
    sources[rel] = { model: MODEL, prompt: 'scripts/gen-flap.ts', made: sources[rel]?.made ?? new Date().toISOString().slice(0, 10) }
    console.log(`${id}: beat ${manifest[id].ms} ms, ${w}x${h} × ${count}`)
  }
  rmSync(tmp, { recursive: true, force: true })
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
  writeFileSync(SOURCES, JSON.stringify(Object.fromEntries(Object.entries(sources).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n')
  const kb = Number(execFileSync('du', ['-sk', OUT]).toString().split('\t')[0])
  console.log(`${Object.keys(manifest).length} sprites, public/img/flap ${(kb / 1024).toFixed(1)} MB`)
}

// ------------------------------------------------------------------------------------------------
// The take-off: one short first-person dive into the grotto, shared by all dragons (no dragon in
// frame), in both postures. It starts on the painted grotto wall the child knows from every screen.

const DIVE_SECONDS = 4
const DIVE_PROMPT =
  "First-person view of a dragon taking off inside this painted underwater sea grotto. The camera starts still, then surges forward and dives fast into a dark cave tunnel ahead, banking slightly, as stalactites and rock arches rush past on both sides and streams of small bubbles fly toward the viewer. Glowing turquoise crystals and warm gold light from below flash by. It ends rushing forward through the tunnel at full speed. Keep the picture-book gouache illustration style with thick dark-teal outlines and the same deep sea-teal and gold palette in every frame. No dragon, no animals, no characters, no hands, no text. Silent."

async function dive(posture: 'landscape' | 'portrait') {
  const picks = JSON.parse(readFileSync(join(RAW, 'picks.json'), 'utf8'))
  const src = join(RAW, 'backdrop', `${posture}-v${picks[`backdrop/${posture}`] ?? 1}.png`)
  const size = posture === 'landscape' ? '1280x720' : '720x1280'
  const first = join(VIDEO, `dive-${posture}-first.png`)
  execFileSync('magick', [src, '-resize', `${size}^`, '-gravity', 'center', '-extent', size, first])
  const raw = join(VIDEO, `dive-${posture}.mp4`)
  if (!existsSync(raw) || process.argv.includes('--redo')) {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! },
      body: JSON.stringify({
        model: MODEL,
        input: [{ type: 'image', data: readFileSync(first).toString('base64'), mime_type: 'image/png' }, { type: 'text', text: DIVE_PROMPT }],
        response_format: { type: 'video', duration: `${DIVE_SECONDS}s`, aspect_ratio: posture === 'landscape' ? '16:9' : '9:16', resolution: '720p' },
      }),
    })
    const body = await res.json()
    const video = res.ok && findVideo(body)
    if (!video) throw new Error(`dive ${posture}: ${res.status} ${JSON.stringify(body).slice(0, 400)}`)
    writeFileSync(raw, Buffer.from(video, 'base64'))
  }
  // No sound track, small, and playable from its first bytes.
  const out = join(ROOT, 'public/video')
  mkdirSync(out, { recursive: true })
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-an', '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow', '-movflags', '+faststart', join(out, `dive-${posture}.mp4`)])
  const kb = Number(execFileSync('du', ['-k', join(out, `dive-${posture}.mp4`)]).toString().split('\t')[0])
  console.log(`dive-${posture}.mp4  ${kb} KB`)
}

const [cmd, ...rest] = process.argv.slice(2)
if (cmd === 'gen') {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing (put it in .env.local)')
  mkdirSync(VIDEO, { recursive: true })
  const redo = rest.includes('--redo')
  const kinds = rest.filter((a) => !a.startsWith('--'))
  for (const { id } of DRAGONS) {
    if (kinds.length && !kinds.includes(id)) continue
    if (!redo && existsSync(clip(id))) continue
    try {
      await gen(id)
    } catch (e) {
      console.error((e as Error).message)
    }
  }
} else if (cmd === 'dive') {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing (put it in .env.local)')
  mkdirSync(VIDEO, { recursive: true })
  for (const posture of ['landscape', 'portrait'] as const) await dive(posture)
} else if (cmd === 'build') {
  build()
} else {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(3, 5).join('\n'))
}
