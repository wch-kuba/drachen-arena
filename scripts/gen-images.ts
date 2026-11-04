// Generate the app's art with OpenAI GPT Image (build time only, on the parent's machine).
// The child's app never calls OpenAI; it shows the WebP files bundled from public/img/.
//
//   npm run images -- plan [group]             list the jobs and estimate the cost, makes nothing
//   npm run images -- gen <group> [key…]       make missing variants (--n 3 variants, --redo to replace)
//   npm run images -- sheet                    write art-raw/review.html to compare variants
//   npm run images -- pick group/key=2 …       choose a variant (art-raw/picks.json)
//   npm run images -- build                    picked variants → public/img/*.webp + manifest
//
// Groups: word, dragon (grown idle, the reference), pose (the other 8 stage × pose combos, made
// from the dragon reference), egg, land, icon. The hatch shell halves are not generated: build
// cuts each picked egg along a zigzag, so the halves always fit together exactly.
//
// The style block is read from DESIGN.md › "Image style prompt", so it is always used verbatim.
// Needs OPENAI_API_KEY in .env.local (never commit it), ImageMagick (`magick`) and `cwebp`.
// Raw PNGs stay in art-raw/ (gitignored). src/content/image-sources.json records model and prompt
// of every built image (license record, see ASSETS.md).

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DRAGONS } from '../src/content/dragons.ts'
import { DRAGON_LOOKS, LAND_PROMPTS, PICTURE_PROMPTS } from '../src/content/picture-prompts.ts'

const ROOT = new URL('..', import.meta.url).pathname
const RAW = join(ROOT, 'art-raw')
const PICKS = join(RAW, 'picks.json')
const OUT = join(ROOT, 'public/img')
const MANIFEST = join(ROOT, 'src/content/image-manifest.json')
const SOURCES = join(ROOT, 'src/content/image-sources.json')
const CONCURRENCY = 3

const STYLE = (() => {
  const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const m = design.match(/\*\*Image style prompt[^\n]*\n\n> ([^\n]+)/)
  if (!m) throw new Error('Image style prompt not found in DESIGN.md')
  return m[1].trim()
})()

// ------------------------------------------------------------------------------------------------
// Jobs

type Group = 'word' | 'dragon' | 'pose' | 'egg' | 'land' | 'icon'
const GROUPS: Group[] = ['word', 'dragon', 'pose', 'egg', 'land', 'icon']

type Model = 'gpt-image-1-mini' | 'gpt-image-1.5'
type Size = '1024x1024' | '1536x1024'
type Quality = 'low' | 'medium' | 'high'

interface Job {
  group: Group
  key: string
  model: Model
  size: Size
  quality: Quality
  transparent: boolean
  prompt: string
  /** Picked raw image this job is made from (images.edit), as "group/key". */
  ref?: string
  variants: number
  /** What the review sheet shows next to the key. */
  label: string
}

/** Rough per-image prices (USD) from OpenAI's model pages, checked 2026-11-04. Edits add input tokens. */
const PRICE: Record<Model, Record<Quality, number>> = {
  'gpt-image-1-mini': { low: 0.005, medium: 0.011, high: 0.036 },
  'gpt-image-1.5': { low: 0.009, medium: 0.034, high: 0.133 },
}
const cost = (j: Job) => PRICE[j.model][j.quality] * (j.size === '1536x1024' ? 1.5 : 1) + (j.ref ? 0.01 : 0)

/** DESIGN.md › Dragons. The child wants real, powerful dragons, so the dragon prompts swap the
 *  style block's "rounded" and "cute, calm" for bold and heroic; outline, palette and light stay. */
const HERO_STYLE = STYLE.replace('Friendly, rounded shapes', 'Bold, dynamic shapes')
  .replace('Cute, calm, never scary.', 'Heroic and exciting, never gory.')
  // Each dragon has its own colors (DRAGON_LOOKS); outline, texture and light keep them one family.
  .replace(/Palette: [^.]*\([^)]*\)[^.]*\./, "Use this dragon's own colors given below.")
/** Eggs: the world style, but in the dragon's own colors. */
const OWN_COLORS = STYLE.replace(/Palette: [^.]*\([^)]*\)[^.]*\./, "Use the colors of the dragon in the reference image.")
const DRAGON_BASE =
  'A powerful, majestic sea dragon, the hero of an adventure story for a 7-year-old boy who loves dragons. Strong body, sharp horns, sharp claws where it has feet, sea-fin ears, fierce determined eyes and a confident grin showing small fangs. Not cute, not chubby, not a baby toy. Painted with the same soft gouache texture and thick dark-teal outlines as a picture book, not smooth glossy cartoon shading.'
const STAGES = {
  hatchling: 'as a tiny newly hatched baby: big head, small round body, cute but already with little horns; no egg shell pieces',
  young: 'as a young dragon, about two-thirds grown: slimmer than the reference, the same fierce, confident face; not chubby, not baby-like',
  grown: 'fully grown, same size and proportions as in the reference',
} as const
const POSES = {
  idle: 'sitting calmly, awake, eyes open, a gentle smile',
  happy: 'happy and excited, big open smile, eyes squeezed shut with joy, head thrown back in a cheer',
  sleeping: 'curled up asleep, eyes closed, tail wrapped around itself, peaceful',
} as const
type Stage = keyof typeof STAGES
type Pose = keyof typeof POSES
const SAME =
  'This is the same character as in the reference image. Keep its colors, markings, face and features exactly. Keep its body plan exactly: the same number of heads, legs and wings as in the reference; never add wings or legs it does not have.'

function jobs(): Job[] {
  const list: Job[] = []
  const add = (j: Omit<Job, 'prompt'> & { note: string }) => {
    const { note, ...rest } = j
    const style = j.group === 'dragon' || j.group === 'pose' ? HERO_STYLE : j.group === 'egg' ? OWN_COLORS : STYLE
    list.push({ ...rest, prompt: `${style}\n\n${note}` })
  }
  for (const [key, what] of Object.entries(PICTURE_PROMPTS))
    add({ group: 'word', key, label: what, model: 'gpt-image-1-mini', size: '1024x1024', quality: 'medium', transparent: true, variants: 3, note: `Word picture, one object only: ${what}. No background shape, no backdrop, no frame, no square tile behind it: the object floats on a fully transparent background.` })
  for (const d of DRAGONS) {
    const look = DRAGON_LOOKS[d.id]
    add({ group: 'dragon', key: d.id, label: look, model: 'gpt-image-1.5', size: '1024x1024', quality: 'medium', transparent: true, variants: 3, note: `${DRAGON_BASE} ${look} Its body plan exactly as described by its type (count the legs, wings and heads). Fully grown, in a proud, alert pose that suits its type, head held high. Full body, side three-quarter view.` })
    for (const stage of Object.keys(STAGES) as Stage[])
      for (const pose of Object.keys(POSES) as Pose[]) {
        if (stage === 'grown' && pose === 'idle') continue // that is the reference itself
        add({ group: 'pose', key: `${d.id}-${stage}-${pose}`, label: `${stage}, ${pose}`, ref: `dragon/${d.id}`, model: 'gpt-image-1.5', size: '1024x1024', quality: 'medium', transparent: true, variants: 1, note: `${SAME} Show it ${STAGES[stage]}, ${POSES[pose]}. Full body.` })
      }
    add({ group: 'egg', key: d.id, label: 'egg', ref: `dragon/${d.id}`, model: 'gpt-image-1.5', size: '1024x1024', quality: 'medium', transparent: true, variants: 2, note: `Draw only the egg this dragon hatches from, no dragon: a smooth rounded egg standing upright. Its shell uses this dragon's main colors and pattern (not turquoise unless the dragon is turquoise), with a few gold spots.` })
  }
  for (const [key, what] of Object.entries(LAND_PROMPTS))
    list.push({ group: 'land', key, label: what, model: 'gpt-image-1.5', size: '1536x1024', quality: 'medium', transparent: false, variants: 2, prompt: `${STYLE.replace(/Single subject[^.]*\.|transparent background,?/g, '')}\n\nA wide background scene with no characters and no text: ${what}` })
  list.push({ group: 'icon', key: 'icon', label: 'app icon', ref: 'dragon/perle', model: 'gpt-image-1.5', size: '1024x1024', quality: 'high', transparent: false, variants: 3, prompt: `${HERO_STYLE.replace(/Single subject[^.]*\./, '')}\n\n${SAME} App icon: this dragon's head and shoulders, proud and confident with a grin, rising over a pile of gold coins and gems, in a dark-teal grotto (#072830). Full-bleed square artwork that fills the whole canvas edge to edge: no rounded corners, no frame, no border, no margin. Bold and readable at small sizes, no text.` })
  return list
}

// ------------------------------------------------------------------------------------------------
// Files

const rawPath = (j: { group: string; key: string }, v: number) => join(RAW, j.group, `${j.key}-v${v}.png`)
const readPicks = (): Record<string, number> => (existsSync(PICKS) ? JSON.parse(readFileSync(PICKS, 'utf8')) : {})
/** A job with one variant needs no pick. */
const pickOf = (id: string, picks = readPicks()): number | undefined => picks[id] ?? (existsSync(join(RAW, `${id}-v1.png`)) && !existsSync(join(RAW, `${id}-v2.png`)) ? 1 : undefined)

// ------------------------------------------------------------------------------------------------
// OpenAI

async function generate(j: Job, v: number) {
  const key = process.env.OPENAI_API_KEY!
  let res: Response
  if (j.ref) {
    const pick = pickOf(j.ref)
    if (!pick) throw new Error(`pick a variant of ${j.ref} first`)
    const form = new FormData()
    form.set('model', j.model)
    form.set('prompt', j.prompt)
    form.set('size', j.size)
    form.set('quality', j.quality)
    form.set('background', j.transparent ? 'transparent' : 'opaque')
    form.set('input_fidelity', 'high')
    form.append('image[]', new Blob([readFileSync(join(RAW, `${j.ref}-v${pick}.png`))], { type: 'image/png' }), 'ref.png')
    res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form })
  } else {
    res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: j.model, prompt: j.prompt, size: j.size, quality: j.quality, background: j.transparent ? 'transparent' : 'opaque' }),
    })
  }
  const body = (await res.json()) as { data?: { b64_json: string }[]; error?: { message: string } }
  if (!res.ok || !body.data) throw new Error(body.error?.message ?? `HTTP ${res.status}`)
  mkdirSync(join(RAW, j.group), { recursive: true })
  writeFileSync(rawPath(j, v), Buffer.from(body.data[0].b64_json, 'base64'))
}

/** Retry rate limits, server errors and the short time after model access was changed. */
async function withRetry(fn: () => Promise<void>, tries = 5) {
  for (let t = 1; ; t++) {
    try {
      return await fn()
    } catch (e) {
      const msg = (e as Error).message
      if (t >= tries || !/does not have access|rate limit|HTTP 5\d\d|server_error|timeout|fetch failed/i.test(msg)) throw e
      await new Promise((r) => setTimeout(r, 4000 * t))
    }
  }
}

async function pool<T>(xs: T[], fn: (x: T) => Promise<void>) {
  let i = 0
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < xs.length) await fn(xs[i++])
    }),
  )
}

// ------------------------------------------------------------------------------------------------
// Commands

const args = process.argv.slice(2)
const cmd = args[0]
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i < 0 ? undefined : (args[i + 1] ?? '')
}
/** Arguments that are neither a --flag nor the value of --n. */
const positional = args.slice(1).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--n')
const selected = (): Job[] => {
  const [group, ...keys] = positional
  return jobs().filter((j) => (!group || j.group === group) && (!keys.length || keys.includes(j.key)))
}

if (cmd === 'plan') {
  const sel = selected()
  let total = 0
  for (const g of GROUPS) {
    const js = sel.filter((j) => j.group === g)
    if (!js.length) continue
    const images = js.reduce((n, j) => n + j.variants, 0)
    const usd = js.reduce((n, j) => n + cost(j) * j.variants, 0)
    const made = js.reduce((n, j) => n + Array.from({ length: j.variants }, (_, v) => existsSync(rawPath(j, v + 1))).filter(Boolean).length, 0)
    total += usd
    console.log(`${g.padEnd(7)} ${String(js.length).padStart(3)} jobs  ${String(images).padStart(3)} images  ${String(made).padStart(3)} made  ~$${usd.toFixed(2)}  (${js[0].model}, ${js[0].quality})`)
  }
  console.log(`total ~$${total.toFixed(2)} for everything listed (already made images are skipped by gen)`)
} else if (cmd === 'gen') {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY missing. Put it in .env.local (never commit it).')
    process.exit(1)
  }
  const n = flag('n') ? Number(flag('n')) : undefined
  const redo = args.includes('--redo')
  const todo = selected().flatMap((j) =>
    Array.from({ length: n ?? j.variants }, (_, v) => ({ j, v: v + 1 })).filter(({ j, v }) => redo || !existsSync(rawPath(j, v))),
  )
  const usd = todo.reduce((s, t) => s + cost(t.j), 0)
  console.log(`${todo.length} images, ~$${usd.toFixed(2)}`)
  let done = 0
  const failed: string[] = []
  await pool(todo, async ({ j, v }) => {
    try {
      await withRetry(() => generate(j, v))
      console.log(`[${++done}/${todo.length}] ${j.group}/${j.key} v${v}`)
    } catch (e) {
      failed.push(`${j.group}/${j.key} v${v}: ${(e as Error).message}`)
    }
  })
  if (failed.length) console.error(`failed:\n  ${failed.join('\n  ')}`)
} else if (cmd === 'pick') {
  const picks = readPicks()
  for (const a of positional) {
    const [id, v] = a.split('=')
    if (!existsSync(join(RAW, `${id}-v${v}.png`))) throw new Error(`no such variant: ${a}`)
    picks[id] = Number(v)
  }
  mkdirSync(RAW, { recursive: true })
  writeFileSync(PICKS, JSON.stringify(picks, null, 2) + '\n')
  console.log(`${Object.keys(picks).length} picks`)
} else if (cmd === 'sheet') {
  const picks = readPicks()
  const sections = GROUPS.map((g) => {
    const rows = jobs()
      .filter((j) => j.group === g)
      .map((j) => {
        if (!existsSync(join(RAW, g))) return ''
        const vs = Array.from({ length: 6 }, (_, i) => i + 1).filter((v) => existsSync(rawPath(j, v)))
        if (!vs.length) return ''
        const pick = pickOf(`${g}/${j.key}`, picks)
        const cells = vs
          .map((v) => `<figure class="${pick === v ? 'picked' : ''}"><img src="${g}/${j.key}-v${v}.png" loading="lazy"><figcaption>${v}</figcaption></figure>`)
          .join('')
        return `<div class="row"><div class="key"><b>${g}/${j.key}</b><span>${j.label}</span></div>${cells}</div>`
      })
      .join('')
    return rows && `<h2>${g}</h2>${rows}`
  }).join('')
  writeFileSync(
    join(RAW, 'review.html'),
    `<!doctype html><meta charset="utf-8"><title>Art review</title><style>
body{font:14px system-ui;background:#072830;color:#e6f6f2;margin:24px}
.row{display:flex;gap:12px;align-items:flex-start;margin:0 0 16px}
.key{width:220px;flex:none}.key span{display:block;opacity:.75;margin-top:4px}
figure{margin:0;padding:4px;border:3px solid transparent;border-radius:12px}
figure.picked{border-color:#f7c86e}
img{width:200px;height:auto;display:block;border-radius:8px;background:repeating-conic-gradient(#0f3a42 0 25%,#1a4d55 0 50%) 0 0/20px 20px}
figcaption{text-align:center;margin-top:2px}
</style><h1>Art review</h1><p>Gold frame = picked. Checkerboard = transparent.</p>${sections}`,
  )
  console.log(`open ${join(RAW, 'review.html')}`)
} else if (cmd === 'build') {
  build()
} else {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(2, 9).join('\n'))
}

// ------------------------------------------------------------------------------------------------
// Build: trim, size, WebP

function build() {
  const picks = readPicks()
  const manifest: Record<string, { src: string; w: number; h: number }> = {}
  const sources: Record<string, { model: string; prompt: string; made: string }> = {}
  const tmp = join(RAW, 'tmp')
  mkdirSync(tmp, { recursive: true })
  for (const j of jobs()) {
    const id = `${j.group}/${j.key}`
    const v = pickOf(id, picks)
    if (!v) continue
    const src = rawPath(j, v)
    if (j.group === 'icon') {
      buildIcon(src)
      continue
    }
    const png = join(tmp, `${j.group}-${j.key}.png`)
    // Transparent art: trim to the drawing, then sit it on a fixed canvas (bottom-aligned for
    // dragons, eggs and shells, so every stage and pose stands on the same ground line).
    const box = { word: 400, dragon: 640, pose: 640, egg: 320, land: 0, icon: 0 }[j.group]
    if (j.transparent) {
      const gravity = j.group === 'word' ? 'center' : 'south'
      execFileSync('magick', [src, '-trim', '+repage', '-resize', `${box - 16}x${box - 16}>`, '-background', 'none', '-gravity', gravity, '-extent', `${box}x${box}`, png])
    } else {
      execFileSync('magick', [src, '-resize', '1600x1600>', png])
    }
    const dir = j.group === 'pose' ? 'dragon' : j.group
    mkdirSync(join(OUT, dir), { recursive: true })
    const out = join(OUT, dir, `${j.group === 'dragon' ? `${j.key}-grown-idle` : j.key}.webp`)
    execFileSync('cwebp', ['-quiet', '-m', '6', '-q', j.transparent ? '72' : '75', '-alpha_q', '70', png, '-o', out])
    const [w, h] = execFileSync('magick', ['identify', '-format', '%w %h', png]).toString().split(' ').map(Number)
    const rel = out.slice(join(ROOT, 'public').length + 1)
    manifest[`${dir}/${rel.split('/').pop()!.replace('.webp', '')}`] = { src: rel, w, h }
    sources[rel] = { model: j.model, prompt: createHash('sha256').update(j.prompt).digest('hex').slice(0, 12), made: new Date().toISOString().slice(0, 10) }
    if (j.group === 'egg')
      for (const [half, file] of cutEgg(png, tmp, j.key)) {
        mkdirSync(join(OUT, 'shell'), { recursive: true })
        const out = join(OUT, 'shell', `${j.key}-${half}.webp`)
        execFileSync('cwebp', ['-quiet', '-m', '6', '-q', '72', '-alpha_q', '70', file, '-o', out])
        const [w, h] = execFileSync('magick', ['identify', '-format', '%w %h', file]).toString().split(' ').map(Number)
        manifest[`shell/${j.key}-${half}`] = { src: `img/shell/${j.key}-${half}.webp`, w, h }
      }
  }
  rmSync(tmp, { recursive: true, force: true })
  const old = existsSync(SOURCES) ? JSON.parse(readFileSync(SOURCES, 'utf8')) : {}
  for (const k of Object.keys(sources)) if (old[k]?.prompt === sources[k].prompt) sources[k].made = old[k].made
  writeFileSync(MANIFEST, JSON.stringify(sortKeys(manifest), null, 2) + '\n')
  writeFileSync(SOURCES, JSON.stringify(sortKeys(sources), null, 2) + '\n')
  const kb = Number(execFileSync('du', ['-sk', OUT]).toString().split('\t')[0])
  console.log(`${Object.keys(manifest).length} images, public/img ${(kb / 1024).toFixed(1)} MB`)
}

/**
 * Cut an egg (on its fixed canvas) into top and bottom shell halves along a zigzag, with an ink
 * line along the cut. Both halves keep the egg's canvas size, so placed on top of each other they
 * show the whole egg again; the hatch animation moves them apart.
 */
function cutEgg(png: string, tmp: string, key: string): [string, string][] {
  const [w, h] = execFileSync('magick', ['identify', '-format', '%w %h', png]).toString().split(' ').map(Number)
  const bbox = execFileSync('magick', [png, '-format', '%@', 'info:']).toString() // WxH+X+Y of the egg
  const [, bw, bh, bx, by] = bbox.match(/(\d+)x(\d+)\+(\d+)\+(\d+)/)!.map(Number)
  const teeth = 7
  const y = by + bh * 0.5
  const amp = bh * 0.05
  const zig = Array.from({ length: teeth + 1 }, (_, i) => `${Math.round(bx + (i * bw) / teeth)},${Math.round(y + (i % 2 ? amp : -amp))}`)
  const top = join(tmp, `${key}-topmask.png`)
  execFileSync('magick', ['-size', `${w}x${h}`, 'xc:black', '-fill', 'white', '-draw', `polygon 0,0 ${w},0 ${w},${Math.round(y)} ${[...zig].reverse().join(' ')} 0,${Math.round(y)}`, top])
  const line = join(tmp, `${key}-line.png`)
  execFileSync('magick', ['-size', `${w}x${h}`, 'xc:none', '-stroke', '#05262c', '-strokewidth', String(Math.max(4, Math.round(bw / 40))), '-fill', 'none', '-draw', `polyline ${zig.join(' ')}`, line])
  return (['top', 'bottom'] as const).map((half) => {
    const mask = half === 'top' ? top : join(tmp, `${key}-botmask.png`)
    if (half === 'bottom') execFileSync('magick', [top, '-negate', mask])
    const cut = join(tmp, `${key}-${half}-cut.png`)
    execFileSync('magick', [png, '(', '+clone', '-alpha', 'extract', mask, '-compose', 'multiply', '-composite', ')', '-alpha', 'off', '-compose', 'copy-opacity', '-composite', cut])
    const ink = join(tmp, `${key}-${half}-ink.png`)
    execFileSync('magick', [line, cut, '-compose', 'dst-in', '-composite', ink])
    const out = join(tmp, `${key}-${half}.png`)
    execFileSync('magick', [cut, ink, '-compose', 'over', '-composite', out])
    return [half, out] as [string, string]
  })
}

function buildIcon(src: string) {
  const dir = join(ROOT, 'public/icons')
  for (const s of [180, 192, 512]) execFileSync('magick', [src, '-resize', `${s}x${s}`, join(dir, `icon-${s}.png`)])
  // Maskable: keep the art inside the 80% safe zone.
  execFileSync('magick', [src, '-resize', '410x410', '-background', '#072830', '-gravity', 'center', '-extent', '512x512', join(dir, 'maskable-512.png')])
}

function sortKeys<T>(o: Record<string, T>) {
  return Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)))
}
