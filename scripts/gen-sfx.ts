// Generate the game's sound effects with ElevenLabs (build time only, on the parent's machine).
// The child's app never calls ElevenLabs; it plays the MP3s bundled from public/sfx/.
//
//   npm run sfx              make the effects that are missing
//   npm run sfx -- --force   make all of them again
//   npm run sfx -- right     make (again) only the named ones
//
// Needs ELEVENLABS_API_KEY in .env.local (never commit it) and ffmpeg.
// Style (plan/v1-06-rewards.md): soft for frequent sounds, cartoon for rare moments,
// never a harsh sound for a mistake. Cost: about 10 credits per second of sound.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const MODEL = 'eleven_text_to_sound_v3'
const OUT = 'public/sfx'

interface Effect {
  prompt: string
  seconds: number
  loop?: boolean
  /** Target loudness (LUFS). Frequent sounds sit low, ambience lower still. */
  lufs: number
}

const SOFT = 'Soft, gentle, warm, for a calm children’s game. Clean, no music, no voice.'
const TOON = 'Playful cartoon sound effect for a cozy children’s game. Friendly and cute, never loud or scary. No speech.'

export const EFFECTS: Record<string, Effect> = {
  // Frequent: soft.
  right: { prompt: `A single soft glassy chime, like a small crystal gently tapped, bright and short. ${SOFT}`, seconds: 1, lufs: -22 },
  gem: { prompt: `A small gem softly landing on a pile of gold coins, a light clink. ${SOFT}`, seconds: 0.6, lufs: -24 },
  key: { prompt: `A very soft, tiny wooden tap, like a fingertip on a soft key. ${SOFT}`, seconds: 0.5, lufs: -30 },
  // Rare moments: cartoon.
  hint: { prompt: `A single round underwater bubble "blub", soft and funny. ${TOON}`, seconds: 0.8, lufs: -22 },
  round: { prompt: `A happy cascade of gold coins pouring onto a treasure pile, with a short rising slide whistle. ${TOON}`, seconds: 2.5, lufs: -20 },
  wobble: { prompt: `An egg wobbling and rocking on coins, small wooden knocks and a curious little rattle. ${TOON}`, seconds: 1.6, lufs: -22 },
  hatch: { prompt: `An eggshell cracking open, then a tiny baby dragon’s cute hiccup. ${TOON}`, seconds: 2.5, lufs: -20 },
  land: { prompt: `Entering a magical underwater cave: a short sparkling whoosh with soft bubbles. ${TOON}`, seconds: 1.5, lufs: -22 },
  // Ambience on Home only, off by default.
  grotto: { prompt: 'Calm underwater sea grotto ambience: soft distant water, gentle drips, faint bubbles. Seamless, no music.', seconds: 12, loop: true, lufs: -34 },
  snore: { prompt: 'A small cute dragon softly snoring and breathing while asleep, slow and peaceful, cartoon style.', seconds: 8, loop: true, lufs: -34 },
}

async function make(name: string, e: Effect, key: string) {
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      text: e.prompt,
      model_id: MODEL,
      duration_seconds: e.seconds,
      prompt_influence: 0.5,
      ...(e.loop ? { loop: true } : {}),
    }),
  })
  if (!res.ok) throw new Error(`${name}: ${res.status} ${await res.text()}`)
  const raw = join(tmpdir(), `sfx-${name}-${process.pid}.mp3`)
  writeFileSync(raw, Buffer.from(await res.arrayBuffer()))
  // Mono, even loudness across effects, small files.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-ac', '1', '-af', `loudnorm=I=${e.lufs}:TP=-3`, '-ar', '44100', '-b:a', '96k', join(OUT, `${name}.mp3`)])
  unlinkSync(raw)
  return res.headers.get('character-cost') ?? res.headers.get('x-character-count')
}

const key = process.env.ELEVENLABS_API_KEY
if (!key) throw new Error('ELEVENLABS_API_KEY missing (put it in .env.local)')
mkdirSync(OUT, { recursive: true })
const args = process.argv.slice(2)
const force = args.includes('--force')
const only = args.filter((a) => !a.startsWith('--'))
for (const [name, e] of Object.entries(EFFECTS)) {
  if (only.length && !only.includes(name)) continue
  if (!force && !only.length && existsSync(join(OUT, `${name}.mp3`))) continue
  const cost = await make(name, e, key)
  console.log(`${name}.mp3  ${e.seconds}s${cost ? `  ${cost} credits` : ''}`)
}
