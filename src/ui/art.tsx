// Drawn art for the Drachenhort world: gems, coins, the hoard, rock and icons stay inline SVG.
// Dragons, eggs, shells, lands and word pictures are generated illustrations (Part 7,
// public/img via images.ts) in the same style: thick dark-teal outline, light from below.

import type { Stage } from '../engine/rewards.ts'
import { dragonPic, eggPic, landPic, type Pose } from './images.ts'

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

export function Coin({ class: cls }: { class?: string }) {
  return (
    <svg class={cls} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="var(--gold-500)" stroke={INK} stroke-width="3" />
      <circle cx="20" cy="20" r="10" fill="none" stroke="var(--gold-800)" stroke-width="2" />
      <path d="M13 14a10 10 0 0 1 9-4" stroke="var(--gold-100)" stroke-width="3" fill="none" stroke-linecap="round" />
    </svg>
  )
}

/** What lies on the hoard: the child's dragon (asleep on Home), or the egg before the first one. */
export type OnHoard = { dragon: { kind: string; stage: Stage; name: string } } | { egg: string }

/** The hoard heap with the dragon asleep on it. `size` 0..1 sets how high the pile is. */
export function HoardScene({ size = 0.6, on }: { size?: number; on: OnHoard }) {
  const top = 300 - 120 * size // y of the pile's crest
  const d = 'dragon' in on ? on.dragon : undefined
  const sleeper = d && dragonPic(d.kind, d.stage, 'sleeping')
  const egg = 'egg' in on ? eggPic(on.egg) : undefined
  return (
    <svg viewBox="0 20 400 340" role="img" aria-label={d ? `${d.name} schläft auf seinem Schatz` : 'Dein Ei liegt auf dem Schatz'}>
      <HoardLight id="hoard-light" />
      {/* Pile, lit gold from within */}
      <path
        d={`M20 352 C60 ${top + 40} 140 ${top} 200 ${top} S340 ${top + 40} 380 352 Z`}
        fill="url(#hoard-light)"
        stroke={INK}
        stroke-width="5"
        stroke-linejoin="round"
      />
      <path d={`M60 352 C100 ${top + 70} 160 ${top + 30} 200 ${top + 30} S300 ${top + 70} 340 352 Z`} fill="var(--gold-300)" opacity="0.55" />
      <path d={`M110 352 C140 ${top + 90} 180 ${top + 60} 200 ${top + 60} S260 ${top + 90} 290 352 Z`} fill="var(--gold-100)" opacity="0.6" />
      {/* The dragon (or egg) nestles into the crest, so the front coins and gems overlap it. */}
      {sleeper && d && (
        <g class="dragon-breathe">
          <Sized href={sleeper.src} cx={200} ground={top + 52} size={280 * STAGE_SCALE[d.stage]} />
        </g>
      )}
      {sleeper && d && (
        <text class="zzz" x={200 + 120 * STAGE_SCALE[d.stage]} y={top + 52 - 190 * STAGE_SCALE[d.stage]} fill="var(--foam)" font-size="26" font-weight="700">
          z z
        </text>
      )}
      {egg && <image href={egg.src} x="140" y={top - 128} width="120" height="150" preserveAspectRatio="xMidYMax meet" />}
      {/* Coins on the pile */}
      {[
        [70, 330],
        [110, 312],
        [150, 300],
        [250, 302],
        [292, 318],
        [330, 334],
        [180, 330],
        [222, 336],
      ].map(([x, y]) => (
        <g>
          <ellipse cx={x} cy={y} rx="15" ry="7" fill="var(--gold-300)" stroke={INK} stroke-width="3" />
          <ellipse cx={x - 3} cy={y - 1} rx="6" ry="2" fill="var(--gold-100)" />
        </g>
      ))}
      {/* Gems */}
      <path d="M86 296l10-12h16l8 12-17 20z" fill="var(--tq-300)" stroke={INK} stroke-width="3" stroke-linejoin="round" />
      <path d="M86 296h34M103 316l-3-20 5-12" fill="none" stroke={INK} stroke-width="2" />
      <path d="M300 290l8-10h14l6 10-14 17z" fill="var(--tq-500)" stroke={INK} stroke-width="3" stroke-linejoin="round" />
      <path d="M300 290h28" fill="none" stroke={INK} stroke-width="2" />
      <path d="M200 340l7-9h12l6 9-13 15z" fill="var(--tq-300)" stroke={INK} stroke-width="3" stroke-linejoin="round" />
      {/* Catch-lights: gems pick up the hoard's glow */}
      <path d="M94 293l5-6M304 287l4-5M206 336l3-4" stroke="var(--glass)" stroke-width="3" stroke-linecap="round" />
    </svg>
  )
}

/** Inner light of the hoard: gold brightening toward its heart. */
export function HoardLight({ id }: { id: string }) {
  return (
    <defs>
      <radialGradient id={id} cx="50%" cy="85%" r="75%">
        <stop offset="0" stop-color="var(--gold-100)" />
        <stop offset="0.45" stop-color="var(--gold-300)" />
        <stop offset="1" stop-color="var(--gold-600)" />
      </radialGradient>
    </defs>
  )
}

/** A low hoard ledge for game screens: the destination of every earned gem. */
export function HoardLedge({ gems = 3, class: cls }: { gems?: number; class?: string }) {
  const placed = [
    [118, 58, 'var(--tq-300)'],
    [262, 54, 'var(--tq-500)'],
    [200, 40, 'var(--tq-300)'],
    [160, 70, 'var(--tq-500)'],
    [236, 72, 'var(--tq-300)'],
    [84, 80, 'var(--tq-500)'],
    [310, 78, 'var(--tq-300)'],
    [180, 52, 'var(--tq-500)'],
    [222, 58, 'var(--tq-300)'],
    [140, 46, 'var(--tq-500)'],
  ] as const
  return (
    <svg class={cls} viewBox="0 0 400 136" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <HoardLight id="ledge-light" />
      {/* Rock shelf the hoard rests on */}
      <path d="M-20 104 Q200 92 420 104 V136 H-20 Z" fill="var(--rock-4)" stroke={INK} stroke-width="5" stroke-linejoin="round" />
      <path d="M40 118 h60 M250 122 h80" stroke="var(--rock-2)" stroke-width="4" stroke-linecap="round" />
      <path d="M10 108 C60 50 140 26 200 26 S340 50 390 108 Z" fill="url(#ledge-light)" stroke={INK} stroke-width="5" stroke-linejoin="round" />
      {[
        [70, 96],
        [130, 84],
        [270, 82],
        [330, 96],
        [200, 92],
      ].map(([x, y]) => (
        <ellipse cx={x} cy={y} rx="14" ry="6" fill="var(--gold-300)" stroke={INK} stroke-width="3" />
      ))}
      {placed.slice(0, gems).map(([x, y, c], i) => (
        <g class={i === gems - 1 ? 'gem-landed' : undefined}>
          <path d={`M${x - 12} ${y}l8-10h12l8 10-14 16z`} fill={c} stroke={INK} stroke-width="3" stroke-linejoin="round" />
          <path d={`M${x - 6} ${y - 5}l4-4`} stroke="var(--glass)" stroke-width="3" stroke-linecap="round" />
        </g>
      ))}
    </svg>
  )
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

const MOUTH = 'M26 112 C24 62 40 32 60 32 C80 32 96 62 94 112 Z'

/** Cave mouth of a land on the home path: an open land shows a peek into its chamber. */
export function CaveMouth({ hue, land, locked = false }: { hue: string; land: string; locked?: boolean }) {
  const peek = !locked && landPic(land)
  return (
    <svg class="land-mouth" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <clipPath id={`mouth-${land}`}>
          <path d={MOUTH} />
        </clipPath>
      </defs>
      <path d="M8 112 C4 50 30 10 60 10 C90 10 116 50 112 112 Z" fill={locked ? 'var(--rock-3)' : hue} stroke={INK} stroke-width="5" />
      <path d={MOUTH} fill={locked ? 'var(--rock-1)' : 'var(--rock-0)'} />
      {peek && <image href={peek.src} x="20" y="30" width="80" height="84" preserveAspectRatio="xMidYMid slice" clip-path={`url(#mouth-${land})`} />}
      <path d={MOUTH} fill="none" stroke={INK} stroke-width="4" />
      {locked && (
        <g transform="translate(44 60)" stroke="var(--foam-soft)" stroke-width="4" fill="none">
          <rect x="2" y="14" width="28" height="22" rx="4" fill="var(--rock-3)" />
          <path d="M8 14v-6a8 8 0 0 1 16 0v6" />
        </g>
      )}
    </svg>
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
