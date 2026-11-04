import { LANDS, type LandId } from '../lands.ts'
import { T } from '../strings.ts'
import { CaveMouth, Gem, HoardScene, LandMotif } from '../ui/art.tsx'

interface Props {
  name: string
  crystals: number
  isOpen: (land: LandId) => boolean
  /** The land that opens with the next egg. */
  next?: LandId
  onStart: () => void
  onLand: (id: LandId) => void
  onDragons: () => void
}

export function Home({ name, crystals, isOpen, next, onStart, onLand, onDragons }: Props) {
  return (
    <div class="home grotto">
      <section class="home-stage">
        <header class="home-top">
          <h1 class="home-hello">{T.hello(name)}</h1>
          <span class="plaque counter" aria-label={`${crystals} ${T.crystalsWord(crystals)}`}>
            <Gem />
            {crystals}
          </span>
        </header>

        <div class="hoard-scene">
          <HoardScene size={Math.min(1, crystals / 1000)} />
        </div>

        <p class="home-caption">
          {T.sleepsOn}{' '}
          <b>
            {crystals} {T.crystalsWord(crystals)}
          </b>
          .
        </p>

        <button type="button" class="reward-home home-dragons" onClick={onDragons}>
          {T.myDragons}
        </button>

        <button type="button" class="btn-gold home-cta" onClick={onStart}>
          {T.start}
        </button>
      </section>

      <section class="lands" aria-labelledby="lands-title">
        <div class="lands-inner">
          <h2 id="lands-title">Die Grotten</h2>
          {/* One winding path descends through the rock; the chambers hang on it. */}
          <svg class="lands-path" viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0 0 C0 60 100 40 100 100 S0 140 0 200 S100 240 100 300 S0 340 0 400"
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
                <CaveMouth hue={land.hue} locked={locked}>
                  {!locked && <LandMotif land={land.id} />}
                </CaveMouth>
                <span>
                  <span class="land-name">{land.name}</span>
                  <span class="land-what">{locked ? (land.id === next ? T.nextEgg : T.locked) : land.what}</span>
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
