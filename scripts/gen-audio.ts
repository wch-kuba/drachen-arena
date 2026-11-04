// Generate the app's voice clips with ElevenLabs (build time only, on the parent's machine).
// The child's app never calls ElevenLabs; it plays the MP3s bundled from public/audio/.
//
//   npm run audio   make missing clips, delete unused ones, write the manifest and the sources list
//
// Voices (decided 2026-11-04, PRODUCT.md › Audio): Knurps narrates every instruction, tip and
// feedback line in three tones; every word, plural, sound and sentence is made in four voices
// (Kermy, Hopsi, Emmy, Knurps). The app picks one clip at random each time.
//
// Needs ELEVENLABS_API_KEY in .env.local (never commit it) and ffmpeg. Prints the credits used.
// src/content/audio-sources.json lists which voice made each clip (not bundled).

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SEED } from '../src/content/seed.ts'
import { spokenRoles } from '../src/content/speech.ts'

/** Voices from the ElevenLabs voice library (German), chosen by the parent. */
const VOICES = {
  hopsi: 'ygoBNrnmTEdu5NtDTmAY', // Hopsi – Crazy & Funny Bunny
  kermy: 'fO96OTVqTn6bBvyybd7U', // Kermy – Gentle & Froggy
  emmy: 'QNDh5mDABxDpT3PEzjST', // Emmy – Children's Books (cheeky squirrel)
  knurps: '2HDQZbLZn0MJCgru92h7', // Knurps – Playful Chipmunk
} as const
type Voice = keyof typeof VOICES
const NARRATOR: Voice = 'knurps'
/** eleven_v3 audio tags, put before the line and not read aloud: same words, a different mood. */
const NARRATOR_TONES = ['cheerful', 'playful', 'warmly'] as const
const WORD_VOICES: Voice[] = ['kermy', 'hopsi', 'emmy', 'knurps']
/** eleven_v3 has a speed setting (eleven_v4 has none); 0.85 = a little slower for early readers. */
const MODEL = 'eleven_v3'
const SPEED = 0.85

const ROOT = new URL('..', import.meta.url).pathname
const OUT_DIR = join(ROOT, 'public/audio')
const MANIFEST = join(ROOT, 'src/content/audio-manifest.json')
const SOURCES = join(ROOT, 'src/content/audio-sources.json')
/** The Starter plan allows a few requests at once. */
const CONCURRENCY = 3

if (!process.env.ELEVENLABS_API_KEY) {
  console.error('ELEVENLABS_API_KEY missing. Put it in .env.local (never commit it).')
  process.exit(1)
}
// The SDK reads ELEVENLABS_API_KEY from the environment.
const client = new ElevenLabsClient()

interface Job {
  text: string
  voice: Voice
  tone?: string
}

const clipName = ({ voice, text, tone }: Job) =>
  createHash('sha1')
    .update(['elevenlabs', MODEL, VOICES[voice], SPEED, ...(tone ? [tone] : []), text].join('\n'))
    .digest('hex')
    .slice(0, 12) + '.mp3'

async function tts({ voice, text, tone }: Job): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      const audio = await client.textToSpeech.convert(VOICES[voice], {
        text: tone ? `[${tone}] ${text}` : text,
        modelId: MODEL,
        languageCode: 'de',
        outputFormat: 'pcm_24000',
        voiceSettings: { speed: SPEED },
      })
      return Buffer.from(await new Response(audio).arrayBuffer())
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode ?? 0
      // Too many at once or a server hiccup: wait and retry. Anything else (no credits left,
      // bad key) stops the run; the clips made so far are kept.
      if ((status !== 429 && status < 500) || attempt >= 5) throw e
      await new Promise((r) => setTimeout(r, 3000 * attempt))
    }
  }
}

/** Raw 24 kHz PCM → trimmed, loudness-normalized mono MP3. */
function toMp3(pcm: Buffer, out: string) {
  const src = join(tmpdir(), `drachen-${process.pid}-${Math.random().toString(36).slice(2)}.pcm`)
  writeFileSync(src, pcm)
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB'
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', src,
    '-af', `${trim},areverse,${trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.08`,
    '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', '48k', out,
  ])
  rmSync(src)
}

async function pool<T>(xs: T[], fn: (x: T) => Promise<void>) {
  let i = 0
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < xs.length) await fn(xs[i++])
    }),
  )
}

const credits = async () => (await client.user.subscription.get()).characterCount

async function generate() {
  mkdirSync(OUT_DIR, { recursive: true })
  const { narrator, words } = spokenRoles(SEED)
  const jobs: Job[] = [
    ...narrator.flatMap((text) => NARRATOR_TONES.map((tone) => ({ text, voice: NARRATOR, tone }))),
    ...words.flatMap((text) => WORD_VOICES.map((voice) => ({ text, voice }))),
  ]
  const todo = jobs.filter((j) => !existsSync(join(OUT_DIR, clipName(j))))
  console.log(
    `${narrator.length} narrator texts (${NARRATOR} × ${NARRATOR_TONES.length} tones) + ${words.length} words × ${WORD_VOICES.length} voices` +
      ` = ${jobs.length} clips, ${todo.length} to make (${MODEL}, speed ${SPEED}).`,
  )
  if (process.argv.includes('--dry')) return

  const before = await credits()
  let done = 0
  let failure: unknown
  try {
    await pool(todo, async (job) => {
      toMp3(await tts(job), join(OUT_DIR, clipName(job)))
      if (++done % 25 === 0 || done === todo.length) console.log(`  ${done}/${todo.length}`)
    })
  } catch (e) {
    failure = e
    console.error(`Stopped after ${done} of ${todo.length} clips. Run again to make the rest.`)
  }

  // Manifest: each text with the clips that exist (narrator: one per tone; words: one per voice).
  const clips: Record<string, string[]> = {}
  const sources: Record<string, string[]> = {}
  for (const job of jobs) {
    if (!existsSync(join(OUT_DIR, clipName(job)))) continue
    ;(clips[job.text] ??= []).push(`audio/${clipName(job)}`)
    ;(sources[job.text] ??= []).push(job.tone ? `${job.voice} (${job.tone})` : job.voice)
  }
  const used = new Set(Object.values(clips).flatMap((c) => c.map((p) => p.slice('audio/'.length))))
  const stale = readdirSync(OUT_DIR).filter((f) => f.endsWith('.mp3') && !used.has(f))
  stale.forEach((f) => rmSync(join(OUT_DIR, f)))
  if (stale.length) console.log(`Removed ${stale.length} unused clips.`)

  const byText = <T>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b, 'de')))
  const manifest = { provider: 'elevenlabs', model: MODEL, speed: SPEED, narrator: NARRATOR, narratorTones: NARRATOR_TONES, wordVoices: WORD_VOICES, clips: byText(clips) }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
  writeFileSync(SOURCES, JSON.stringify(byText(sources), null, 2) + '\n')
  console.log(`Manifest: ${Object.keys(clips).length} of ${narrator.length + words.length} texts have clips.`)

  const after = await credits()
  const { characterLimit } = await client.user.subscription.get()
  console.log(`ElevenLabs credits: ${after - before} this run, ${after} of ${characterLimit} used this month.`)
  if (failure) throw failure
}

await generate()
