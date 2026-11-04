// Drawn placeholder art for the Drachenhort world.
// Part 7 replaces the dragon, egg and word pictures with generated illustrations
// in the same style: thick dark-teal outline, turquoise scales, gold belly and spines.

import type { DragonKind } from '../content/dragons.ts'
import type { Stage } from '../engine/rewards.ts'

const INK = 'var(--ink)'

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

/** The hoard heap with the dragon asleep on it. `size` 0..1 sets how high the pile is. */
export function HoardScene({ size = 0.6, awake = false, kind }: { size?: number; awake?: boolean; kind?: DragonKind }) {
  const top = 300 - 120 * size // y of the pile's crest
  return (
    <svg viewBox="0 20 400 340" role="img" aria-label="Dein Drache liegt auf seinem Schatz">
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

      {/* Dragon, lying on the crest */}
      <g transform={`translate(70 ${top - 150})`}>
        <Dragon awake={awake} kind={kind} />
      </g>
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
export function HoardLedge({ gems = 3, dragon = true, class: cls }: { gems?: number; dragon?: boolean; class?: string }) {
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
    <svg class={cls} viewBox={dragon ? '0 -112 400 248' : '0 0 400 136'} preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <HoardLight id="ledge-light" />
      {/* Rock shelf the hoard rests on */}
      <path d="M-20 104 Q200 92 420 104 V136 H-20 Z" fill="var(--rock-4)" stroke={INK} stroke-width="5" stroke-linejoin="round" />
      <path d="M40 118 h60 M250 122 h80" stroke="var(--rock-2)" stroke-width="4" stroke-linecap="round" />
      {dragon && (
        <g transform="translate(70 -118)">
          <Dragon awake />
        </g>
      )}
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

/** Ground for a dragon: a small gold mound (collection niches). */
export function Mound() {
  return (
    <g>
      <path d="M-6 192 C40 150 220 150 266 192 Z" fill="var(--gold-500)" stroke={INK} stroke-width="5" stroke-linejoin="round" />
      <ellipse cx="70" cy="178" rx="13" ry="5" fill="var(--gold-300)" stroke={INK} stroke-width="3" />
      <ellipse cx="190" cy="176" rx="13" ry="5" fill="var(--gold-300)" stroke={INK} stroke-width="3" />
    </g>
  )
}

/** Broken egg shell halves around a fresh dragon. */
export function ShellHalves() {
  return (
    <g stroke={INK} stroke-width="5" stroke-linejoin="round">
      <path d="M-4 196 C-4 160 20 140 40 140 l10 18 l12 -12 l12 16 l14 -10 l8 44 Z" fill="var(--tq-500)" />
      <circle cx="24" cy="172" r="8" fill="var(--gold-300)" stroke-width="3" />
      <path d="M264 196 C264 160 240 140 220 140 l-10 18 l-12 -12 l-12 16 l-14 -10 l-8 44 Z" fill="var(--tq-500)" />
      <circle cx="236" cy="174" r="9" fill="var(--gold-300)" stroke-width="3" />
    </g>
  )
}

/** One placeholder motif per land, drawn inside its cave mouth (60x60 box). */
export function LandMotif({ land }: { land: string }) {
  const st = { stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const
  switch (land) {
    case 'laute': // three crystals in the school colors' order, but in world tones
      return (
        <g {...st}>
          <path d="M6 58 l6 -26 l8 26z" fill="var(--tq-300)" />
          <path d="M20 58 l10 -40 l10 40z" fill="var(--tq-100)" />
          <path d="M40 58 l7 -30 l8 30z" fill="var(--tq-500)" />
        </g>
      )
    case 'mehrzahl': // open shell with pearls: one becomes many
      return (
        <g {...st}>
          <path d="M4 56 C4 34 56 34 56 56 Z" fill="var(--gold-300)" />
          <circle cx="20" cy="42" r="7" fill="var(--glass)" />
          <circle cx="34" cy="38" r="7" fill="var(--glass)" />
          <circle cx="44" cy="46" r="5" fill="var(--glass)" />
        </g>
      )
    case 'luecke': // wreck hull with a missing plank
      return (
        <g {...st}>
          <path d="M2 34 h56 l-8 24 h-40 z" fill="var(--gold-600)" />
          <path d="M6 42 h20 M34 42 h20 M10 50 h40" fill="none" />
          <path d="M28 20 v16 M28 20 l14 8 l-14 4" fill="var(--glass)" />
        </g>
      )
    case 'kurzlang': // echo: sound rings
      return (
        <g {...st} fill="none" stroke="var(--glass)">
          <circle cx="16" cy="40" r="6" fill="var(--glass)" stroke={INK} />
          <path d="M28 28 a16 16 0 0 1 0 24 M38 20 a28 28 0 0 1 0 40" />
        </g>
      )
    default: // deep-sea garden: seaweed
      return (
        <g {...st}>
          <path d="M14 58 C4 44 22 36 12 22 C26 34 16 44 22 58z" fill="var(--tq-300)" />
          <path d="M34 58 C24 40 44 30 34 12 C50 30 38 42 44 58z" fill="var(--tq-500)" />
        </g>
      )
  }
}

/** A friendly sea dragon lying down, head on its front paws. viewBox 260x190 units. */
export function Dragon({ awake = false, kind }: { awake?: boolean; kind?: DragonKind }) {
  const style = kind ? { '--d-body': kind.body, '--d-wing': kind.wing, '--d-belly': kind.belly } : undefined
  return (
    <g class="dragon" style={style} stroke={INK} stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      {/* Tail curling around the front */}
      <path d="M40 150 C0 150 -6 112 24 104 C10 128 30 140 70 140" fill="var(--d-body, var(--tq-500))" />
      <path d="M22 106 l-14 -16 l22 4z" fill="var(--gold-300)" />
      <g class="dragon-breathe">
        {/* Back spines */}
        <path d="M70 72 l8 -22 l12 18 l10 -24 l12 22 l12 -22 l10 24 l12 -16 l4 20" fill="var(--gold-300)" />
        {/* Body */}
        <path d="M44 150 C30 92 80 60 140 62 C188 64 214 96 210 150 Z" fill="var(--d-body, var(--tq-500))" />
        {/* Folded wing */}
        <path d="M96 84 C120 58 160 58 176 82 C160 80 150 92 146 104 C134 92 116 90 96 84 Z" fill="var(--d-wing, var(--tq-300))" />
        <path d="M118 74 l12 22 M146 70 l2 30" fill="none" stroke-width="3" />
        {/* Belly scales */}
        <path d="M70 150 C76 124 96 112 122 112 C110 128 108 140 112 150 Z" fill="var(--d-belly, var(--gold-300))" />
        <path d="M80 136 h26 M88 124 h22" fill="none" stroke-width="3" />
      </g>
      {/* Front paws */}
      <path d="M150 150 c-2 -16 10 -22 22 -20 c4 6 4 14 0 20z" fill="var(--d-body, var(--tq-500))" />
      <path d="M196 150 c-2 -16 10 -22 22 -20 c4 6 4 14 0 20z" fill="var(--d-body, var(--tq-500))" />
      {/* Head resting on paws */}
      <path d="M168 132 C160 100 176 80 206 80 C236 80 254 100 252 122 C250 140 232 146 206 146 C186 146 172 142 168 132 Z" fill="var(--d-body, var(--tq-500))" />
      {/* Snout */}
      <path d="M226 120 c14 -6 26 0 26 10" fill="none" stroke-width="4" />
      <circle cx="238" cy="112" r="2.5" fill={INK} stroke="none" />
      {/* Horns and fin ears */}
      <path d="M186 86 l-10 -26 l20 18z" fill="var(--gold-300)" />
      <path d="M210 82 l2 -28 l14 24z" fill="var(--gold-300)" />
      <path d="M176 104 c-22 -6 -30 6 -26 16 c8 -6 16 -6 26 -4z" fill="var(--d-wing, var(--tq-300))" />
      {/* Eye */}
      {awake ? (
        <>
          <circle cx="208" cy="106" r="11" fill="var(--glass)" />
          <circle cx="211" cy="107" r="6" fill={INK} stroke="none" />
          <circle cx="213" cy="104" r="2" fill="var(--glass)" stroke="none" />
        </>
      ) : (
        <path d="M198 108 q10 8 20 0" fill="none" />
      )}
      {/* Cheek */}
      <ellipse cx="222" cy="126" rx="8" ry="5" fill="var(--coral)" opacity="0.55" stroke="none" />
      {!awake && (
        <text class="zzz" x="232" y="64" fill="var(--foam)" stroke="none" font-size="26" font-weight="700">
          z z
        </text>
      )}
    </g>
  )
}

const STAGE_SCALE: Record<Stage, number> = { hatchling: 0.5, young: 0.75, grown: 1 }

/** A dragon of a kind at its growth stage, standing on the same ground line (viewBox 260x190). */
export function GrownDragon({ kind, stage = 'grown', awake }: { kind?: DragonKind; stage?: Stage; awake?: boolean }) {
  const k = STAGE_SCALE[stage]
  return (
    <g transform={`translate(130 152) scale(${k}) translate(-130 -152)`}>
      <Dragon awake={awake} kind={kind} />
    </g>
  )
}

/** Dragon egg: turquoise shell with gold spots. `crack` 0..3 draws hatch progress. */
export function Egg({ crack = 0, isNew = false, silhouette = false }: { crack?: number; isNew?: boolean; silhouette?: boolean }) {
  if (silhouette) {
    // An egg still to find: only its shape, carved into the rock.
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
  return (
    <svg viewBox="0 0 200 240" role="img" aria-label="Drachen-Ei">
      <g class={isNew ? 'egg-wobble' : undefined}>
        <path
          d="M100 12 C150 12 186 104 186 150 C186 200 148 228 100 228 C52 228 14 200 14 150 C14 104 50 12 100 12 Z"
          fill="var(--tq-500)"
          stroke={INK}
          stroke-width="6"
        />
        <path d="M100 26 C134 26 162 90 168 130 C150 80 126 46 100 40z" fill="var(--tq-300)" />
        {[
          [70, 90, 14],
          [126, 70, 10],
          [138, 150, 16],
          [62, 170, 12],
          [104, 128, 9],
        ].map(([x, y, r]) => (
          <circle cx={x} cy={y} r={r} fill="var(--gold-300)" stroke={INK} stroke-width="3" />
        ))}
        {crack >= 1 && <path d="M60 110 l18 10 l-8 14 l20 8" fill="none" stroke={INK} stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />}
        {crack >= 2 && <path d="M140 100 l-14 14 l12 10 l-16 14" fill="none" stroke={INK} stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />}
        {crack >= 3 && <path d="M90 142 l10 12 l14 -8 l8 14" fill="none" stroke={INK} stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />}
      </g>
    </svg>
  )
}

/** Cave mouth used for a land on the home path. */
export function CaveMouth({ hue, locked = false, children }: { hue: string; locked?: boolean; children?: preact.ComponentChildren }) {
  return (
    <svg class="land-mouth" viewBox="0 0 120 120" aria-hidden="true">
      <path d="M8 112 C4 50 30 10 60 10 C90 10 116 50 112 112 Z" fill={locked ? 'var(--rock-3)' : hue} stroke={INK} stroke-width="5" />
      <path d="M26 112 C24 62 40 32 60 32 C80 32 96 62 94 112 Z" fill={locked ? 'var(--rock-1)' : 'var(--rock-0)'} />
      <g transform="translate(30 48)">{children}</g>
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

/** Placeholder word picture: a hat (for "der Hut"). Replaced by generated art in Part 7. */
export const PictureHat = () => (
  <svg class="ex-picture" viewBox="0 0 132 104" role="img" aria-label="ein Hut">
    <ellipse cx="66" cy="80" rx="58" ry="14" fill="var(--gold-500)" stroke={INK} stroke-width="5" />
    <path d="M30 78 C30 30 44 14 66 14 C88 14 102 30 102 78 Z" fill="var(--gold-500)" stroke={INK} stroke-width="5" />
    <path d="M32 62 C50 68 82 68 100 62 L101 74 C82 80 50 80 31 74 Z" fill="var(--tq-500)" stroke={INK} stroke-width="4" />
  </svg>
)
