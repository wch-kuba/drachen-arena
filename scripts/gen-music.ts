// Background music (plan/v1-06-rewards.md › Background music). Build time only, on the parent's machine.
// The child's app never calls ElevenLabs; it plays public/sfx/music.mp3.
//
//   npm run music                 turn the picked sample into the bundled loop
//   npm run music -- --generate   make a new sample from PROMPT into audio-samples/ (costs credits)
//
// The loop points belong to the picked take: a new take needs new LOOP_END / BAR values
// (find where the closing decay starts, and one bar at the tempo).
// Needs ffmpeg; --generate also needs ELEVENLABS_API_KEY in .env.local (never commit it).

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PROMPT =
  "Instrumental only, no vocals. Big, lively dragon adventure music for a children's game, like the main theme of an animated film where a brave boy rides his mighty dragon. Clearly about DRAGONS: powerful low brass, huge drums, a bold heroic minor-key theme (D dorian) that lifts into a triumphant major chorus. Energetic and full of life, about 105 BPM, a catchy memorable melody a 7-year-old would hum, never ambient, never a drone, never cute or babyish, never horror. Seamless loop that ends where it began. " +
  'Dragon ride: galloping string ostinato like beating wings, taiko and timpani pounding, the horns and trombones roar the main theme, fiddle and tin whistle answer it, a soaring full-orchestra chorus.'

/** The take the parent picked on 2026-11-05 (ElevenLabs Music, music_v1, 75 s). */
const SOURCE = 'audio-samples/music-j-ride.mp3'
/** Cut before the take's closing decay (full level until ~72 s, gone by 74 s). */
const LOOP_END = 72.0
/** One bar at ~105 BPM: the tail crossfades into the opening over this long. */
const BAR = 2.3
/** Background level: well under the voice clips (about -21 LUFS). */
const LUFS = -27
const OUT = 'public/sfx/music.mp3'

async function generate() {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) throw new Error('ELEVENLABS_API_KEY missing (put it in .env.local)')
  const res = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ prompt: PROMPT, music_length_ms: 75000, model_id: 'music_v1', force_instrumental: true }),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  mkdirSync('audio-samples', { recursive: true })
  const file = `audio-samples/music-${Date.now()}.mp3`
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  console.log(`${file}: listen, then set SOURCE, LOOP_END and BAR and run npm run music`)
}

function loop() {
  if (!existsSync(SOURCE)) throw new Error(`${SOURCE} missing (samples are not committed; regenerate with --generate)`)
  const e = (LOOP_END - BAR).toFixed(3)
  // body = [BAR, END-BAR]; then the last bar crossfades into the first, so the end flows into body's start.
  const graph =
    `[0]atrim=0:${LOOP_END},asetpts=PTS-STARTPTS,asplit=3[a][b][c];` +
    `[a]atrim=${BAR}:${e},asetpts=PTS-STARTPTS[body];` +
    `[b]atrim=${e}:${LOOP_END},asetpts=PTS-STARTPTS[tail];` +
    `[c]atrim=0:${BAR},asetpts=PTS-STARTPTS[head];` +
    `[tail][head]acrossfade=d=${BAR}:c1=tri:c2=tri[x];` +
    `[body][x]concat=n=2:v=0:a=1`
  // Two passes: measure, then one constant gain, so the loop's end and start sit at the same level.
  const norm = `loudnorm=I=${LUFS}:TP=-3:LRA=20`
  const measured = spawnSync('ffmpeg', ['-hide_banner', '-i', SOURCE, '-filter_complex', `${graph},${norm}:print_format=json`, '-f', 'null', '-'], {
    encoding: 'utf8',
  }).stderr
  const m = JSON.parse(measured.slice(measured.lastIndexOf('{'), measured.lastIndexOf('}') + 1))
  const linear = `${norm}:linear=true:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}`
  mkdirSync(join(OUT, '..'), { recursive: true })
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', SOURCE, '-filter_complex', `${graph},${linear}`, '-ar', '44100', '-b:a', '96k', OUT])
  console.log(`${OUT}: ${LOOP_END - BAR} s loop at ${LUFS} LUFS`)
}

if (process.argv.includes('--generate')) await generate()
else loop()
