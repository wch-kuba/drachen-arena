import { useLayoutEffect, useRef } from 'preact/hooks'
import { LANDS, type LandId } from '../lands.ts'
import { T } from '../strings.ts'
import { CaveMouth, GemPic, HoardScene, IconMusic, IconSoundOff, IconSpeaker, type OnHoard } from '../ui/art.tsx'

interface Props {
  name: string
  crystals: number
  /** The goal on the hoard: the dragon being fed, the egg, or the newest dragon with the egg. */
  on: OnHoard
  /** How full the goal is, 0..1: the egg cracks, the fed dragon glows when it is close. */
  goalFill?: number
  isOpen: (land: LandId) => boolean
  /** The land that opens with the next step, and what that step is ("Öffnet sich …"). */
  next?: LandId
  nextHint: string
  /** Under the caption: what the crystals fill next and how many are still needed. */
  nextStep: string
  onStart: () => void
  onLand: (id: LandId) => void
  onDragons: () => void
  sound: boolean
  ambient: boolean
  onSound: (on: boolean) => void
  onAmbient: (on: boolean) => void
}

/** The winding path through the chambers: one S-bend per land, alternating sides, 100 units apart. */
const PATH_H = (LANDS.length - 1) * 100
const PATH =
  'M0 0 C0 60 100 40 100 100' +
  Array.from({ length: LANDS.length - 2 }, (_, k) => {
    const y = 200 + k * 100
    const x = k % 2 ? 100 : 0
    return ` S${x} ${y - 60} ${x} ${y}`
  }).join('')

export function Home({ name, crystals, on, goalFill = 0, isOpen, next, nextHint, nextStep, onStart, onLand, onDragons, sound, ambient, onSound, onAmbient }: Props) {
  // The path's ends sit on the first and last mouth centers, measured, so its bends stay on
  // the mouths whatever the labels' height (seven lands since Part 15).
  const landsRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGSVGElement>(null)
  useLayoutEffect(() => {
    const box = landsRef.current
    const svg = pathRef.current
    if (!box || !svg) return
    const fit = () => {
      const mouths = box.querySelectorAll('.land-mouth')
      if (mouths.length < 2) return
      const top = box.getBoundingClientRect().top
      const center = (el: Element) => {
        const r = el.getBoundingClientRect()
        return r.top + r.height / 2 - top
      }
      const a = center(mouths[0])
      svg.style.top = `${a}px`
      svg.style.height = `${center(mouths[mouths.length - 1]) - a}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  return (
    <div class="home grotto">
      <section class="home-stage">
        <header class="home-top">
          <h1 class="home-hello">{T.hello(name)}</h1>
          <div class="home-tools">
            <span class="plaque counter" aria-label={`${crystals} ${T.crystalsWord(crystals)}`}>
              <GemPic />
              {crystals}
            </span>
            <button type="button" class="btn-round sound-toggle" aria-label={T.sounds} aria-pressed={sound} onClick={() => onSound(!sound)}>
              {sound ? <IconSpeaker /> : <IconSoundOff />}
            </button>
            {sound && (
              <button type="button" class="btn-round sound-toggle" aria-label={T.music} aria-pressed={ambient} onClick={() => onAmbient(!ambient)}>
                <IconMusic />
              </button>
            )}
          </div>
        </header>

        <div class="hoard-scene">
          <HoardScene size={Math.min(1, crystals / 1000)} on={on} fill={goalFill} tappable />
        </div>

        <p class="home-caption">
          {on.dragon ? T.sleepsOn(on.dragon.name) : T.eggLiesOn}{' '}
          <b>
            {crystals} {T.crystalsWord(crystals)}
          </b>
          .
          <span class="home-next">{nextStep}</span>
        </p>

        <button type="button" class="reward-home home-dragons" onClick={onDragons}>
          {T.myDragons}
        </button>

        <button type="button" class="btn-gold home-cta" onClick={onStart}>
          {T.start}
        </button>
      </section>

      <section class="lands" aria-labelledby="lands-title">
        <div class="lands-inner" ref={landsRef}>
          <h2 id="lands-title">Die Grotten</h2>
          {/* One winding path descends through the rock; the chambers hang on it. */}
          <svg class="lands-path" ref={pathRef} viewBox={`0 0 100 ${PATH_H}`} preserveAspectRatio="none" aria-hidden="true">
            <path
              d={PATH}
              fill="none"
              stroke="var(--gold-300)"
              stroke-width="5"
              stroke-dasharray="0.1 14"
              stroke-linecap="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>
          {LANDS.map((land) => {
            const locked = !isOpen(land.id)
            return (
              <button
                type="button"
                class="land"
                data-locked={locked ? '' : undefined}
                disabled={locked}
                onClick={() => onLand(land.id)}
              >
                <CaveMouth land={land.id} locked={locked} />
                <span>
                  <span class="land-name">{land.name}</span>
                  <span class="land-what">{locked ? (land.id === next ? nextHint : T.locked) : land.what}</span>
                </span>
              </button>
            )
          })}
          <p class="build-tag">v{__APP_BUILD__}</p>
        </div>
      </section>
    </div>
  )
}
