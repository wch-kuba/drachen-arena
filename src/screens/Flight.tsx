import { useEffect, useRef, useState } from 'preact/hooks'
import { speak } from '../engine/audio.ts'
import { musicHere, play } from '../engine/sfx.ts'
import { T } from '../strings.ts'
import { DragonPic, EggPic, FlyPic, IconClose } from '../ui/art.tsx'
import { flightPic, pic } from '../ui/images.ts'
import { Speak } from '../ui/Speak.tsx'

// The Drachenflug (Part 6b): the grown dragon carries the child through the sea grotto to the
// next egg. The dragon follows the finger; without a finger it glides on by itself, so the flight
// always ends at the ledge. Nothing to win or lose: no score, no timer, no crystals. Jellyfish
// light up when the dragon passes, bubbles trail behind it. All lengths are in `u` = 1 % of the
// screen height, so the grotto is the same on a phone and on an iPad in either posture.
// `egg` unset = a replay from the dragon's card: the same flight, an empty nest at the end.

/** Seconds in the air, speed in u per second, and the seconds of slowing down before the ledge. */
const FLY = 24
const SPEED = 38
const BRAKE = 3
const TRACK = SPEED * (FLY - BRAKE / 2)
/** The dragon settles on its feet beside the ledge. */
const SETTLE = 1300

/** How far the grotto has moved after `t` seconds: steady, then slowing to a stop at the ledge. */
const scrollAt = (t: number) => {
  const cruise = FLY - BRAKE
  if (t <= cruise) return SPEED * t
  const b = Math.min(BRAKE, t - cruise)
  return SPEED * (cruise + b - (b * b) / (2 * BRAKE))
}

type Piece = 'stalactites' | 'rocks' | 'pillar' | 'kelp' | 'wreck' | 'fish'
interface Placed {
  piece: Piece
  /** Position along its layer and height, in u. */
  x: number
  h: number
  /** Hangs from the roof instead of standing on the floor. */
  top?: boolean
  /** Fish swim at a height (% from the top). */
  y?: number
}

/** The middle of the grotto, moving at 0.45 of the dragon's speed. */
const MID: Placed[] = [
  { piece: 'stalactites', x: 60, h: 30, top: true },
  { piece: 'rocks', x: 95, h: 24 },
  { piece: 'kelp', x: 128, h: 34 },
  { piece: 'stalactites', x: 160, h: 38, top: true },
  { piece: 'fish', x: 185, h: 12, y: 38 },
  { piece: 'rocks', x: 215, h: 30 },
  { piece: 'stalactites', x: 262, h: 26, top: true },
  { piece: 'wreck', x: 285, h: 44 },
  { piece: 'kelp', x: 335, h: 28 },
  { piece: 'stalactites', x: 352, h: 36, top: true },
  { piece: 'rocks', x: 392, h: 26 },
  { piece: 'fish', x: 318, h: 12, y: 30 },
  { piece: 'stalactites', x: 445, h: 30, top: true },
  { piece: 'kelp', x: 470, h: 36 },
]
const MID_DEPTH = 0.45
/** The painted wall drifts by 0.06 × TRACK ≈ 51 u over the whole flight (matched in index.css). */
const FAR_DEPTH = 0.06

/** Dark shapes rushing past in front of the dragon, 1.5 times its speed. */
const NEAR: Placed[] = [
  { piece: 'rocks', x: 250, h: 40 },
  { piece: 'pillar', x: 470, h: 100 },
  { piece: 'stalactites', x: 700, h: 46, top: true },
  { piece: 'pillar', x: 930, h: 100 },
  { piece: 'rocks', x: 1130, h: 36 },
]
const NEAR_DEPTH = 1.5

/** Jellyfish close to the dragon's path (0.8): each lights up when the dragon passes it. */
const JELLIES = [
  { x: 120, y: 30 },
  { x: 205, y: 62 },
  { x: 290, y: 36 },
  { x: 370, y: 66 },
  { x: 450, y: 28 },
  { x: 530, y: 54 },
  { x: 610, y: 38 },
]
const JELLY_DEPTH = 0.8
const JELLY_SIZE = 12

/** The ledge (a rock alcove with the nest) is this wide in u, or half the screen (matched in index.css). */
const LEDGE = 40

/** The cave floor where the dragon lands and the ledge stands, from the top (clear of the gold button). */
const FLOOR = 0.8

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

interface Props {
  kind: string
  name: string
  /** The dragon in the egg at the end. Unset on a replay from the card. */
  egg?: string
  onDone: () => void
}

export function Flight(props: Props) {
  // The first flight to an egg opens with the take-off; a replay from the card starts in the air.
  const [diving, setDiving] = useState(() => !!props.egg && !reduced())
  // The theme at full level (also with the Musik switch off), from the take-off to the landing.
  useEffect(() => musicHere(), [])
  if (diving) return <Dive onDone={() => setDiving(false)} />
  return <Scene {...props} />
}

/**
 * The take-off: a short first-person dive into the grotto, the same clip for every dragon (no
 * dragon in it), in the screen's posture. Silent and muted, so it may start by itself on iOS.
 * It is fetched whole and played from memory: Safari asks for byte ranges, which a precached
 * file cannot answer offline. Anything that goes wrong skips straight to the flight.
 */
function Dive({ onDone }: { onDone: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    let over = false
    let url: string | undefined
    const done = () => {
      if (!over) onDone()
      over = true
    }
    // Never wait long for a clip: the flight is the point.
    const giveUp = window.setTimeout(done, 9000)
    const posture = matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait'
    fetch(`${import.meta.env.BASE_URL}video/dive-${posture}.mp4`)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => {
        const v = video.current
        if (over || !v) return
        url = URL.createObjectURL(blob)
        // Set here, not only in the markup: iOS lets a clip start by itself only if it is muted
        // and inline at the moment it gets its source.
        v.muted = true
        v.playsInline = true
        v.src = url
        return v.play().then(() => {
          setShown(true)
          play('land')
        })
      })
      .catch((e) => {
        console.warn('take-off clip skipped:', e)
        done()
      })
    return () => {
      over = true
      clearTimeout(giveUp)
      if (url) URL.revokeObjectURL(url)
    }
  }, [])
  return (
    <div class="flight flight-dive" data-shown={shown ? '' : undefined}>
      <video ref={video} muted playsInline preload="auto" disablePictureInPicture onEnded={onDone} onError={onDone} aria-hidden="true" />
    </div>
  )
}

function Scene({ kind, name, egg, onDone }: Props) {
  const still = useRef(reduced()).current
  const [phase, setPhase] = useState<'fly' | 'landed'>(still ? 'landed' : 'fly')
  const [hint, setHint] = useState(!still)
  const stage = useRef<HTMLDivElement>(null)
  const dragon = useRef<HTMLDivElement>(null)
  const layers = useRef<Record<string, HTMLElement | null>>({})
  const jellies = useRef<(HTMLElement | null)[]>([])
  const bubbles = useRef<(HTMLElement | null)[]>([])

  // Into the air: heavy wing beats, and the one line of help.
  useEffect(() => {
    if (still) return
    play('wings')
    const say = window.setTimeout(() => speak(T.flyHint), 700)
    const hide = window.setTimeout(() => setHint(false), 7000)
    return () => {
      clearTimeout(say)
      clearTimeout(hide)
    }
  }, [])

  useEffect(() => {
    const el = stage.current!
    let W = el.clientWidth
    let H = el.clientHeight
    let u = H / 100
    const measure = () => {
      W = el.clientWidth
      H = el.clientHeight
      u = H / 100
      el.style.setProperty('--u', `${u}px`)
      el.style.setProperty('--ledge-x', `${TRACK + (W / u) * 0.72}`)
      if (still) {
        // No flight: the dragon already stands beside the ledge.
        draw(TRACK)
        const dw = size()
        const p = perch(dw)
        if (dragon.current) dragon.current.style.transform = `translate3d(${p.x - dw / 2}px,${p.y - dw / 4}px,0)`
      }
    }
    const size = () => Math.min(40 * u, W * 0.5)
    /** Beside the ledge, feet on the cave floor. */
    const perch = (dw: number) => ({ x: W * 0.72 - Math.min(LEDGE * u, W * 0.5) * 0.5 - dw * 0.3, y: H * FLOOR - dw * 0.25 })
    const draw = (scroll: number) => {
      for (const [depth, node] of Object.entries(layers.current)) if (node) node.style.transform = `translate3d(${-scroll * Number(depth) * u}px,0,0)`
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    measure()
    if (still) return () => ro.disconnect()

    /** Where the finger is, while it is down. */
    let finger: { x: number; y: number } | undefined
    const at = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest('button')) return
      el.setPointerCapture(e.pointerId)
      finger = at(e)
      setHint(false)
    }
    const move = (e: PointerEvent) => {
      if (finger) finger = at(e)
    }
    const up = () => (finger = undefined)
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)

    // The dragon comes in from the left edge.
    let x = -size()
    let y = H * 0.6
    let tilt = 0
    let t = 0
    let last = performance.now()
    let nextBubble = 0
    let lit = 0
    let landedAt = 0
    let frame = 0

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      const scroll = scrollAt(Math.min(t, FLY))
      draw(scroll)

      const dw = size()
      const dh = dw * 0.5
      let tx: number
      let ty: number
      const arriving = t >= FLY
      if (arriving) {
        ;({ x: tx, y: ty } = perch(dw))
      } else if (finger) {
        // The dragon chases the finger from behind, so the finger never covers it.
        tx = finger.x - dw * 0.62
        ty = finger.y - dh * 0.1
      } else {
        // No finger: it glides on by itself in a slow wave.
        tx = W * 0.32
        ty = H * (0.5 + 0.09 * Math.sin(t * 1.15))
      }
      // The rock keeps it in the open water: soft limits, never a bump.
      if (!arriving) {
        tx = Math.max(dw * 0.5, Math.min(W - dw * 0.5, tx))
        ty = Math.max(H * 0.16, Math.min(H * 0.88 - dh * 0.5, ty))
      }
      const k = 1 - Math.exp(-dt * (arriving ? 3.2 : 5.5))
      const vy = (ty - y) * k
      x += (tx - x) * k
      y += vy
      const lean = arriving ? 0 : Math.max(-16, Math.min(16, (vy / dt / H) * 42))
      tilt += (lean - tilt) * (1 - Math.exp(-dt * 8))
      const d = dragon.current
      if (d) d.style.transform = `translate3d(${x - dw / 2}px,${y - dh / 2}px,0) rotate(${tilt}deg)`

      if (!arriving) {
        // Jellyfish near the dragon light up, each a little higher than the last.
        JELLIES.forEach((j, i) => {
          const node = jellies.current[i]
          if (!node || node.dataset.lit !== undefined) return
          const jx = (j.x - scroll * JELLY_DEPTH) * u
          const jy = (j.y / 100) * H
          if (Math.hypot(jx - x, jy - y) < dw * 0.5) {
            node.dataset.lit = ''
            play('gem', 0.9 + lit++ * 0.07)
          }
        })
        // Bubbles off the tail, left behind as the grotto moves on.
        if (now >= nextBubble) {
          nextBubble = now + 120
          const b = bubbles.current[frame++ % bubbles.current.length]
          if (b) {
            const bx = x - dw * 0.42
            const by = y + (Math.random() - 0.5) * dh * 0.5
            const s = (0.6 + Math.random() * 0.9) * u
            b.style.width = b.style.height = `${s * 2}px`
            b.animate(
              [
                { transform: `translate3d(${bx}px,${by}px,0) scale(0.4)`, opacity: 0.9 },
                { transform: `translate3d(${bx - 34 * u}px,${by - (8 + Math.random() * 10) * u}px,0) scale(1)`, opacity: 0 },
              ],
              { duration: 1500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
            )
          }
        }
      } else if (!landedAt) {
        landedAt = now
        play('land')
      } else if (now - landedAt > SETTLE) {
        setPhase('landed')
        return
      }
      raf = requestAnimationFrame(tick)
    }
    let raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'landed' || still) return
    play('roar')
    if (egg) {
      const say = window.setTimeout(() => speak(T.foundEggSay), 500)
      return () => clearTimeout(say)
    }
  }, [phase])

  const wall = pic('backdrop/landscape')!
  const layer = (depth: number) => (node: HTMLElement | null) => {
    layers.current[depth] = node
  }

  return (
    <div class="flight" ref={stage} data-phase={phase} data-still={still ? '' : undefined}>
      {/* The grotto wall far behind: one painting, wide enough for the whole slow drift. */}
      <div class="flight-layer flight-far" ref={layer(FAR_DEPTH)} aria-hidden="true">
        <img src={wall.src} alt="" draggable={false} />
      </div>
      {/* Warm light rising from the cave floor, as everywhere in the grotto: never from above. */}
      <div class="flight-layer flight-glows" ref={layer(0.25)} aria-hidden="true">
        {[30, 110, 205, 290].map((x) => (
          <span style={{ left: `calc(var(--u) * ${x})` }} />
        ))}
      </div>
      <div class="flight-layer" ref={layer(MID_DEPTH)} aria-hidden="true">
        {MID.map((p) => (
          <Scenery {...p} />
        ))}
      </div>
      <div class="flight-layer" ref={layer(JELLY_DEPTH)} aria-hidden="true">
        {JELLIES.map((j, i) => (
          <span
            class="flight-jelly"
            ref={(n) => {
              jellies.current[i] = n
            }}
            style={{ left: `calc(var(--u) * ${j.x - JELLY_SIZE / 2})`, top: `${j.y}%`, width: `calc(var(--u) * ${JELLY_SIZE})`, animationDelay: `${-i * 700}ms` }}
          >
            <Jelly />
          </span>
        ))}
      </div>
      {/* The ledge with the nest: it comes to rest right of the middle when the flight ends. */}
      <div class="flight-layer" ref={layer(1)} aria-hidden="true">
        <div class="flight-ledge">
          {/* The alcove stands on rock, down to the cave floor. */}
          <Foot />
          <Ledge />
          {egg && <EggPic class="flight-egg" kind={egg} isNew={phase === 'landed'} />}
        </div>
      </div>
      <div class="flight-bubbles" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            ref={(n) => {
              bubbles.current[i] = n
            }}
          />
        ))}
      </div>
      <div class="flight-dragon" ref={dragon}>
        <span class="flight-beat">
          <FlyPic class="flight-fly" kind={kind} />
          <DragonPic class="flight-stand" kind={kind} stage="grown" pose="happy" label={name} />
        </span>
      </div>
      <div class="flight-layer flight-near" ref={layer(NEAR_DEPTH)} aria-hidden="true">
        {NEAR.map((p) => (
          <Scenery {...p} />
        ))}
      </div>

      {!egg && phase === 'fly' && (
        <button type="button" class="btn-round flight-close" aria-label={T.toDragons} onClick={onDone}>
          <IconClose />
        </button>
      )}
      {phase === 'fly' && (
        <p class="plaque flight-hint" data-off={hint ? undefined : ''}>
          {T.flyHint}
          <Speak text={T.flyHint} />
        </p>
      )}
      {phase === 'landed' && (
        <div class="flight-end">
          <h1>{egg ? T.foundEgg(name) : T.landed}</h1>
          <button type="button" class="btn-gold" onClick={onDone}>
            {egg ? T.next : T.toDragons}
          </button>
        </div>
      )}
    </div>
  )
}

/** A piece of the grotto: its painted picture, or a plain drawn rock until that picture exists. */
function Scenery({ piece, x, h, top, y }: Placed) {
  const p = flightPic(piece)
  const style = {
    left: `calc(var(--u) * ${x})`,
    height: `calc(var(--u) * ${h})`,
    ...(y !== undefined ? { top: `${y}%` } : top ? { top: 0 } : { bottom: 0 }),
  }
  if (p) return <img class="flight-piece" data-piece={piece} src={p.src} width={p.w} height={p.h} alt="" style={style} draggable={false} />
  const d = DRAWN[piece]
  if (!d) return null
  return (
    <svg class="flight-piece" data-piece={piece} data-drawn="" viewBox={d.box} preserveAspectRatio="none" style={{ ...style, aspectRatio: d.ratio }}>
      <path d={d.path} />
    </svg>
  )
}

/** Stand-in shapes, cut from the same rock as the wall. */
const DRAWN: Partial<Record<Piece, { box: string; ratio: string; path: string }>> = {
  stalactites: { box: '0 0 120 100', ratio: '1.2', path: 'M0 0h120l-6 22-9 34-8-30-7 12-10 58-11-52-8 20-9-14-10 44-9-38-8 16-12-50z' },
  rocks: { box: '0 0 120 100', ratio: '1.2', path: 'M0 100l10-34 9 12 12-58 11 44 9-18 13 26 10-62 12 54 8-14 14 30 12 20z' },
  pillar: { box: '0 0 40 100', ratio: '0.34', path: 'M0 0h40c-6 14-12 28-13 50 1 22 7 36 13 50H0c6-14 12-28 13-50C12 28 6 14 0 0z' },
  kelp: { box: '0 0 60 100', ratio: '0.6', path: 'M10 100c-8-30 10-40 2-66 12 18 2 40 10 66zM28 100c-10-36 12-52 0-92 16 26 2 60 12 92zM46 100c-6-26 10-38 4-58 12 16 0 36 8 58z' },
}

function Jelly() {
  const p = flightPic('jelly')
  if (p) return <img src={p.src} width={p.w} height={p.h} alt="" draggable={false} />
  return (
    <svg viewBox="0 0 60 80" data-drawn="">
      <path class="jelly-arms" d="M18 34c-4 14 4 20 0 38M30 36c-3 16 5 22 0 40M42 34c4 14-4 20 0 38" />
      <path class="jelly-bell" d="M6 34C6 16 16 6 30 6s24 10 24 28c-6 5-12-4-16 2-4-6-10-6-16 0-4-6-10 3-16-2z" />
    </svg>
  )
}

function Foot() {
  const p = flightPic('rocks')
  return p ? <img class="flight-foot" src={p.src} width={p.w} height={p.h} alt="" draggable={false} /> : null
}

function Ledge() {
  const p = flightPic('ledge')
  if (p) return <img src={p.src} width={p.w} height={p.h} alt="" draggable={false} />
  return (
    <svg viewBox="0 0 200 110" data-drawn="">
      <path class="ledge-rock" d="M8 110l10-52 22-22h120l22 22 10 52z" />
      <ellipse class="ledge-gold" cx="100" cy="40" rx="52" ry="13" />
    </svg>
  )
}
