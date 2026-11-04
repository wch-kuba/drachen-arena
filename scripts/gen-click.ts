// Synthesize the keyboard click (public/sfx/key.wav). No API, no samples: our own sound.
//
//   npm run click
//
// A key press needs an instant attack, so this is not an ElevenLabs effect (those start
// soft and run ~0.5 s) and not an MP3 (encoder padding delays the start by ~25 ms).
// Two layers, like a fingertip on a small wooden key:
//   tick: a 4 ms burst of band-limited noise (the contact)
//   tock: a short pitch-dropping sine with a hint of overtone (the wooden body)
// Seeded noise, so every run writes the same file.

import { writeFileSync } from 'node:fs'

const RATE = 44100
const MS = 45
const PEAK = 0.32 // ≈ -10 dBFS: soft next to the chime, still clear over the voice
const n = Math.round((RATE * MS) / 1000)
const out = new Float32Array(n)

let seed = 0x5eed
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 2 ** 32 - 0.5
}

// Tick: white noise through a simple 2-pole band-pass around 3.2 kHz, fast decay.
{
  const f = 3200
  const q = 1.4
  const w = (2 * Math.PI * f) / RATE
  const alpha = Math.sin(w) / (2 * q)
  const [b0, b2, a0, a1, a2] = [alpha, -alpha, 1 + alpha, -2 * Math.cos(w), 1 - alpha]
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  for (let i = 0; i < n; i++) {
    const t = i / RATE
    const x = rand() * Math.exp(-t / 0.004)
    const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0
    x2 = x1; x1 = x; y2 = y1; y1 = y
    out[i] += y * 2.2
  }
}

// Tock: sine falling 820 → 560 Hz, plus a quiet 2.7× overtone (wood, not metal).
{
  let phase = 0
  for (let i = 0; i < n; i++) {
    const t = i / RATE
    const f = 560 + 260 * Math.exp(-t / 0.006)
    phase += (2 * Math.PI * f) / RATE
    const env = Math.exp(-t / 0.011)
    out[i] += env * (0.55 * Math.sin(phase) + 0.12 * Math.sin(2.7 * phase))
  }
}

// 0.3 ms fade-in (no DC click artifact), 5 ms fade-out to exact silence, then normalize.
const fadeIn = Math.round(RATE * 0.0003)
const fadeOut = Math.round(RATE * 0.005)
for (let i = 0; i < fadeIn; i++) out[i] *= i / fadeIn
for (let i = 0; i < fadeOut; i++) out[n - 1 - i] *= i / fadeOut
const max = out.reduce((m, v) => Math.max(m, Math.abs(v)), 0)

// 16-bit mono WAV.
const buf = Buffer.alloc(44 + n * 2)
buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8)
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22)
buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34)
buf.write('data', 36); buf.writeUInt32LE(n * 2, 40)
for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round((out[i] / max) * PEAK * 32767), 44 + i * 2)
writeFileSync('public/sfx/key.wav', buf)
console.log(`key.wav  ${MS} ms  ${buf.length} bytes`)
