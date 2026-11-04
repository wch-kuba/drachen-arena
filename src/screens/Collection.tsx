import { Dragon, Egg, Mound } from '../ui/art.tsx'

// The dragon collection: each hatched dragon rests on its own small hoard in a niche of the grotto.
// Demo names; real ones are typed by the child when an egg hatches.

const DEMO = [
  { name: 'Funkel', since: 'seit Montag', awake: true },
  { name: 'Perla', since: 'seit Oktober', awake: false },
]

export function Collection() {
  return (
    <div class="collection grotto">
      <h1>Deine Drachen</h1>
      <p class="collection-sub">2 Drachen · 1 Ei wartet</p>
      <div class="niches">
        {DEMO.map((d) => (
          <div class="niche">
            <div class="niche-arch">
              <svg viewBox="-10 -10 280 205" role="img" aria-label={d.name}>
                <Mound />
                <g transform="translate(0 4)">
                  <Dragon awake={d.awake} />
                </g>
              </svg>
            </div>
            <span class="niche-name">{d.name}</span>
            <span class="niche-meta">{d.since}</span>
          </div>
        ))}
        <div class="niche">
          <div class="niche-arch niche-egg">
            <Egg crack={2} />
          </div>
          <span class="niche-name">Ei</span>
          <span class="niche-meta">schlüpft bald</span>
        </div>
        {[0, 1].map(() => (
          <div class="niche" data-empty="">
            <div class="niche-arch" />
            <span class="niche-meta">Noch leer</span>
          </div>
        ))}
      </div>
    </div>
  )
}
