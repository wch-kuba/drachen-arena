import { LANDS, type LandId } from '../lands.ts'
import { CaveMouth, Gem, HoardScene, LandMotif } from '../ui/art.tsx'

interface Props {
  name?: string
  crystals: number
  unlocked: number
  onStart: () => void
  onLand: (id: LandId) => void
}

export function Home({ name, crystals, unlocked, onStart, onLand }: Props) {
  return (
    <div class="home grotto">
      <section class="home-stage">
        <header class="home-top">
          <h1 class="home-hello">{name ? `Hallo, ${name}!` : 'Hallo!'}</h1>
          <span class="plaque counter" aria-label={`${crystals} Kristalle`}>
            <Gem />
            {crystals}
          </span>
        </header>

        <div class="hoard-scene">
          <HoardScene size={Math.min(1, crystals / 200)} />
        </div>

        <p class="home-caption">
          Dein Drache schläft auf <b>{crystals} Kristallen</b>.
        </p>

        <button type="button" class="btn-gold home-cta" onClick={onStart}>
          Los geht’s!
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
          {LANDS.map((land, i) => {
            const locked = i >= unlocked
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
                  <span class="land-what">{locked ? 'Noch verschlossen' : land.what}</span>
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
