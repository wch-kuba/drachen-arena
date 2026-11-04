// Generate the app's voice clips with Gemini TTS (build time only, on the parent's machine).
// The child's app never calls Gemini; it plays the MP3s bundled from public/audio/.
//
//   npm run audio              generate missing clips, delete unused ones, write the manifest
//   npm run audio -- --sample  write the same lines in several voices to audio-samples/ to pick one
//
// Needs GEMINI_API_KEY (paid tier, see PRODUCT.md › Audio) in .env.local, and ffmpeg.
// Decision and terms: PRODUCT.md › Audio, plan/v1-03-core-engine.md › AI voice clips.

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TEST_ITEMS } from '../src/content/test-items.ts'
import { spokenTexts } from '../src/content/speech.ts'

const MODEL = 'gemini-3.8-flash-tts'
/** Chosen by the parent from the --sample run. */
const VOICE = process.env.VOICE ?? 'Sulafat'
/** Delivery direction (not read aloud). Changing it regenerates every clip. */
const STYLE =
  'Warm, friendly primary-school teacher reading to a 7-year-old German child. ' +
  'Standard Hochdeutsch, clear and calm, a little slower than normal, smiling voice.'
const SAMPLE_VOICES = ['Kore', 'Aoede', 'Leda', 'Sulafat', 'Achird', 'Puck']
const SAMPLE_LINES = ['Schreib die Mehrzahl.', 'der Hut', 'Hüte', 'Super! Ein Kristall für deinen Schatz.']

const ROOT = new URL('..', import.meta.url).pathname
const OUT_DIR = join(ROOT, 'public/audio')
const MANIFEST = join(ROOT, 'src/content/audio-manifest.json')
const SAMPLE_DIR = join(ROOT, 'audio-samples')
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'
/** Tier 1 allows 10 requests per minute for this model: one at a time, spaced out. */
const CONCURRENCY = 1
const GAP_MS = 6500

const key = process.env.GEMINI_API_KEY
if (!key) {
  console.error('GEMINI_API_KEY missing. Put it in .env.local (never commit it).')
  process.exit(1)
}

async function tts(text: string, voice: string): Promise<Buffer> {
  const body = {
    model: MODEL,
    input: [
      {
        type: 'user_input',
        content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style: STYLE }] }],
      },
    ],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice }] },
  }
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key! },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const json = await res.json()
      const data: string | undefined =
        json.output_audio?.data ??
        json.steps
          ?.filter((s: { type: string }) => s.type === 'model_output')
          .flatMap((s: { content?: { type: string; data?: string }[] }) => s.content ?? [])
          .find((c: { type: string }) => c.type === 'audio')?.data
      if (!data) throw new Error(`No audio in response for "${text}": ${JSON.stringify(json).slice(0, 400)}`)
      return Buffer.from(data, 'base64')
    }
    const msg = await res.text()
    const retry = res.status === 429 || res.status >= 500
    if (!retry || attempt >= 5) throw new Error(`Gemini ${res.status} for "${text}": ${msg.slice(0, 600)}`)
    // Honour "retry in Ns" from the rate-limit message, else back off.
    const wait = Number(msg.match(/retry in (\d+)s/i)?.[1] ?? 0) * 1000 || 5000 * attempt
    console.log(`  rate limited, waiting ${Math.round(wait / 1000)}s …`)
    await new Promise((r) => setTimeout(r, wait + 500))
  }
}

/** WAV (or raw 24 kHz PCM) → trimmed, loudness-normalized mono MP3. */
function toMp3(audio: Buffer, out: string) {
  const isWav = audio.subarray(0, 4).toString('ascii') === 'RIFF'
  const src = join(tmpdir(), `drachen-${process.pid}-${Math.random().toString(36).slice(2)}.${isWav ? 'wav' : 'pcm'}`)
  writeFileSync(src, audio)
  const input = isWav ? ['-i', src] : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', src]
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB'
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error', ...input,
    '-af', `${trim},areverse,${trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.08`,
    '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', '48k', out,
  ])
  rmSync(src)
}

const clipName = (text: string) =>
  createHash('sha1').update([MODEL, VOICE, STYLE, text].join('\n')).digest('hex').slice(0, 12) + '.mp3'

async function pool<T>(xs: T[], fn: (x: T) => Promise<void>) {
  let i = 0
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < xs.length) {
      const started = Date.now()
      await fn(xs[i++])
      if (i < xs.length) await new Promise((r) => setTimeout(r, Math.max(0, GAP_MS - (Date.now() - started))))
    }
  }))
}

async function samples() {
  mkdirSync(SAMPLE_DIR, { recursive: true })
  const jobs = SAMPLE_VOICES.flatMap((v) => SAMPLE_LINES.map((line, n) => ({ v, line, n }))).filter(
    ({ v, n }) => !existsSync(join(SAMPLE_DIR, `${v}-${n + 1}.mp3`)),
  )
  console.log(`${jobs.length} sample clips to generate (about ${Math.ceil((jobs.length * GAP_MS) / 60000)} min).`)
  await pool(jobs, async ({ v, line, n }) => {
    toMp3(await tts(line, v), join(SAMPLE_DIR, `${v}-${n + 1}.mp3`))
  })
  // One file per voice, all lines in a row with a short pause, for quick listening.
  for (const v of SAMPLE_VOICES) {
    const inputs = SAMPLE_LINES.flatMap((_, n) => ['-i', join(SAMPLE_DIR, `${v}-${n + 1}.mp3`)])
    const pads = SAMPLE_LINES.map((_, n) => `[${n}:a]apad=pad_dur=0.6[a${n}]`).join(';')
    const joined = SAMPLE_LINES.map((_, n) => `[a${n}]`).join('') + `concat=n=${SAMPLE_LINES.length}:v=0:a=1,aformat=sample_fmts=s16p:sample_rates=24000`
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', `${pads};${joined}`, '-codec:a', 'libmp3lame', '-b:a', '64k', join(SAMPLE_DIR, `voice-${v}.mp3`)])
  }
  console.log(`Samples in ${SAMPLE_DIR}/voice-<Name>.mp3: ${SAMPLE_VOICES.join(', ')}`)
}

async function generate() {
  mkdirSync(OUT_DIR, { recursive: true })
  const texts = spokenTexts(TEST_ITEMS)
  const clips: Record<string, string> = {}
  const todo: string[] = []
  for (const t of texts) {
    const file = clipName(t)
    clips[t] = `audio/${file}`
    if (!existsSync(join(OUT_DIR, file))) todo.push(t)
  }
  console.log(`${texts.length} texts, ${todo.length} to generate (voice ${VOICE}).`)
  let done = 0
  await pool(todo, async (t) => {
    toMp3(await tts(t, VOICE), join(OUT_DIR, clipName(t)))
    console.log(`  ${++done}/${todo.length}  ${t}`)
  })

  const used = new Set(Object.values(clips).map((p) => p.slice('audio/'.length)))
  const stale = readdirSync(OUT_DIR).filter((f) => f.endsWith('.mp3') && !used.has(f))
  stale.forEach((f) => rmSync(join(OUT_DIR, f)))
  if (stale.length) console.log(`Removed ${stale.length} unused clips.`)

  const sorted = Object.fromEntries(Object.entries(clips).sort(([a], [b]) => a.localeCompare(b, 'de')))
  const manifest = { model: MODEL, voice: VOICE, clips: sorted }
  const next = JSON.stringify(manifest, null, 2) + '\n'
  if (!existsSync(MANIFEST) || readFileSync(MANIFEST, 'utf8') !== next) writeFileSync(MANIFEST, next)
  console.log(`Manifest: ${Object.keys(sorted).length} clips → src/content/audio-manifest.json`)
}

await (process.argv.includes('--sample') ? samples() : generate())
