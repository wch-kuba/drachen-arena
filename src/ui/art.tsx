// Drawn art for the Drachenhort world: gems, coins, the hoard, rock and icons stay inline SVG.
// Dragons, eggs, shells, lands and word pictures are generated illustrations (Part 7,
// public/img via images.ts) in the same style: thick dark-teal outline, light from below.

import type { Stage } from '../engine/rewards.ts'
import { dragonPic, eggPic, pic, type Pose } from './images.ts'

const INK = 'var(--ink)'

/** Every stage picture fills the same canvas, so growth is drawn by size from one ground line. */
export const STAGE_SCALE: Record<Stage, number> = { hatchling: 0.5, young: 0.75, grown: 1 }

export function Gem({ filled = true, class: cls }: { filled?: boolean; class?: string }) {
  return (
    <svg class={cls} viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M10 6h20l8 10-18 20L2 16z"
        fill={filled ? 'var(--tq-500)' : 'var(--rock-3)'}
        stroke={filled ? INK : 'var(--rock-4)'}
        stroke-width="3"
        stroke-linejoin="round"
      />
      {filled && (
        <>
          <path d="M2 16h36M10 6l4 10 6 20M30 6l-4 10-6 20" fill="none" stroke={INK} stroke-width="2" />
          <path d="M14 16l6-10 6 10z" fill="var(--tq-100)" />
          <path d="M2 16h12l6 20z" fill="var(--tq-700)" />
        </>
      )}
    </svg>
  )
}

/** What lies on the hoard: the child's dragon (asleep on Home), or the egg before the first one. */
export type OnHoard = { dragon: { kind: string; stage: Stage; name: string } } | { egg: string }

/** The painted hoard in 4 sizes; `size` 0..1 picks how big the pile has grown. */
const hoardPic = (size: number) => pic(`prop/hoard-${Math.min(4, 1 + Math.floor(size * 4))}`)!

/** Room above the pile for whatever lies on it, in viewBox units (the pile is 400 wide). */
const ABOVE = 240

/** The hoard with the dragon asleep on it (or the egg). `size` 0..1 sets how high the pile is. */
export function HoardScene({ size = 0.6, on }: { size?: number; on: OnHoard }) {
  const pile = hoardPic(size)
  const pileH = (400 * pile.h) / pile.w
  // The dragon (with its own bit of gold) sinks into the pile, so the two read as one heap.
  const ground = ABOVE + pileH * 0.78
  const d = 'dragon' in on ? on.dragon : undefined
  const sleeper = d && dragonPic(d.kind, d.stage, 'sleeping')
  const egg = 'egg' in on ? eggPic(on.egg) : undefined
  return (
    <svg viewBox={`0 0 400 ${ABOVE + pileH}`} role="img" aria-label={d ? `${d.name} schläft auf seinem Schatz` : 'Dein Ei liegt auf dem Schatz'}>
      <image href={pile.src} x="0" y={ABOVE} width="400" height={pileH} />
      {sleeper && d && (
        <g class="dragon-breathe">
          <Sized href={sleeper.src} cx={200} ground={ground} size={290 * STAGE_SCALE[d.stage]} />
        </g>
      )}
      {sleeper && d && (
        <text class="zzz" x={200 + 125 * STAGE_SCALE[d.stage]} y={ground - 200 * STAGE_SCALE[d.stage]} fill="var(--foam)" font-size="26" font-weight="700">
          z z
        </text>
      )}
      {egg && <Sized href={egg.src} cx={200} ground={ground + 6} size={150} />}
    </svg>
  )
}

/** Where each earned gem lands, across the pile (0 = left edge, 1 = right edge). */
const LANDING = [0.36, 0.62, 0.5, 0.28, 0.72, 0.44, 0.56, 0.2, 0.8, 0.4]

/** The painted heap is a mound: its surface is high in the middle and drops toward the edges. */
const surface = (x: number) => 0.14 + 2.2 * (x - 0.5) ** 2

/** A low hoard for game screens: the destination of every earned gem. */
export function HoardLedge({ gems = 3, size = 0.3, class: cls }: { gems?: number; size?: number; class?: string }) {
  const pile = hoardPic(size)
  const pileH = (400 * pile.h) / pile.w
  const gem = pic('prop/gem')!
  return (
    <svg class={cls} viewBox={`0 -14 400 ${pileH + 14}`} preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <image href={pile.src} x="0" y="0" width="400" height={pileH} />
      {LANDING.slice(0, gems).map((fx, i) => (
        <g class={i === gems - 1 ? 'gem-landed' : undefined}>
          {/* Each gem sits half sunk into the coins where it lands. */}
          <image href={gem.src} x={400 * fx - 20} y={pileH * (surface(fx) + 0.1) - 32} width="40" height="40" />
        </g>
      ))}
    </svg>
  )
}

/** The painted gem: the crystal the child earns (counter, flight, feedback, reward drops).
 *  The small slot gems in the progress track and egg meter stay drawn (Gem). */
export function GemPic({ class: cls }: { class?: string }) {
  const p = pic('prop/gem')!
  return <img class={cls ? `gem-pic ${cls}` : 'gem-pic'} src={p.src} width={p.w} height={p.h} alt="" draggable={false} />
}

/** A square picture inside an SVG scene, standing on `ground`, centered on `cx`. */
function Sized({ href, cx, ground, size }: { href: string; cx: number; ground: number; size: number }) {
  return <image href={href} x={cx - size / 2} y={ground - size} width={size} height={size} preserveAspectRatio="xMidYMax meet" />
}

/** A dragon of a kind at its growth stage and mood. Every picture is bottom-aligned on the same
 *  square canvas, so all stages and moods stand on one ground line. */
export function DragonPic({ kind, stage = 'grown', pose = 'idle', label, class: cls }: { kind: string; stage?: Stage; pose?: Pose; label?: string; class?: string }) {
  const p = dragonPic(kind, stage, pose)
  if (!p) return null
  return <img class={cls ? `dragon-pic ${cls}` : 'dragon-pic'} data-stage={stage} src={p.src} width={p.w} height={p.h} alt={label ?? ''} decoding="async" draggable={false} />
}

/** A dragon egg in its dragon's colors. A ready egg wobbles on its base. */
export function EggPic({ kind, isNew = false, class: cls }: { kind: string; isNew?: boolean; class?: string }) {
  const p = eggPic(kind)
  if (!p) return null
  return (
    <span class={['egg-pic', isNew && 'egg-wobble', cls].filter(Boolean).join(' ')}>
      <img src={p.src} width={p.w} height={p.h} alt="Drachen-Ei" decoding="async" draggable={false} />
    </span>
  )
}

/** An egg still to find: only its shape, carved into the rock. Never shows which dragon. */
export function EggSlot() {
  return (
    <svg viewBox="0 0 200 240" aria-hidden="true">
      <path
        d="M100 12 C150 12 186 104 186 150 C186 200 148 228 100 228 C52 228 14 200 14 150 C14 104 50 12 100 12 Z"
        fill="var(--rock-1)"
        stroke="var(--rock-4)"
        stroke-width="6"
        stroke-dasharray="14 12"
      />
    </svg>
  )
}

/** A land's painted cave entrance on the home path. A locked one is dark rock behind a lock. */
export function CaveMouth({ land, locked = false }: { land: string; locked?: boolean }) {
  const p = pic(`cave/${land}`)!
  return (
    <span class="land-mouth" data-locked={locked ? '' : undefined} aria-hidden="true">
      <img src={p.src} width={p.w} height={p.h} alt="" draggable={false} />
      {locked && (
        <svg class="land-lock" viewBox="0 0 32 40" stroke="var(--foam)" stroke-width="4" fill="none">
          <rect x="2" y="16" width="28" height="22" rx="4" fill="var(--rock-3)" />
          <path d="M8 16v-6a8 8 0 0 1 16 0v6" />
        </svg>
      )}
    </span>
  )
}

/* ---------- Icons: one stroke family, 24 grid, round caps ---------- */

const icon = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 2.6,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
} as const

export const IconSpeaker = () => (
  <svg viewBox="0 0 24 24" {...icon} aria-hidden="true">
    <path d="M4 9h4l5-4v14l-5-4H4z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
  </svg>
)

/** Sound effects off: the speaker with a soft cross instead of waves. */
export const IconSoundOff = () => (
  <svg viewBox="0 0 24 24" {...icon} aria-hidden="true">
    <path d="M4 9h4l5-4v14l-5-4H4z" />
    <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" />
  </svg>
)

/** Grotto ambience: three gentle sea waves. */
export const IconWaves = () => (
  <svg viewBox="0 0 24 24" {...icon} aria-hidden="true">
    <path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
  </svg>
)

export const IconClose = () => (
  <svg viewBox="0 0 24 24" {...icon} aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconBack = () => (
  <svg viewBox="0 0 24 24" {...icon} aria-hidden="true">
    <path d="M9 7l-5 5 5 5M4 12h11a5 5 0 0 1 5 5" />
  </svg>
)

export const IconBackspace = () => (
  <svg viewBox="0 0 24 24" {...icon} aria-hidden="true">
    <path d="M8 5h12v14H8l-6-7z" />
    <path d="M11 9l6 6M17 9l-6 6" />
  </svg>
)

export const IconLight = () => (
  <svg viewBox="0 0 24 24" {...icon} aria-hidden="true">
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
  </svg>
)

/** Short-vowel dot and long-vowel line, as in Klett materials. */
export const MarkShort = () => (
  <svg viewBox="0 0 72 40" aria-hidden="true">
    <text x="36" y="22" text-anchor="middle" font-size="26" font-weight="700" fill="var(--ink)">a</text>
    <circle cx="36" cy="33" r="5" fill="var(--ink)" />
  </svg>
)

export const MarkLong = () => (
  <svg viewBox="0 0 72 40" aria-hidden="true">
    <text x="36" y="22" text-anchor="middle" font-size="26" font-weight="700" fill="var(--ink)">a</text>
    <path d="M24 33h24" stroke="var(--ink)" stroke-width="5" stroke-linecap="round" />
  </svg>
)
