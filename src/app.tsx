import { useEffect, useState } from 'preact/hooks'
import { UpdatePrompt } from './UpdatePrompt.tsx'
import { LANDS, type LandId } from './lands.ts'
import { SEED } from './content/seed.ts'
import { GameProvider, useGame } from './engine/game.tsx'
import { isUnlocked, nextLand, UNLOCK_ORDER } from './engine/rewards.ts'
import { emptyProfile } from './engine/storage.ts'
import type { Profile } from './engine/types.ts'
import { Collection } from './screens/Collection.tsx'
import { Hatch } from './screens/Hatch.tsx'
import { Home } from './screens/Home.tsx'
import { Reward } from './screens/Reward.tsx'
import { Session } from './screens/Session.tsx'
import { Welcome } from './screens/Welcome.tsx'

// The game runs on the engine with the seed content (Part 5) and the reward loop (Part 6).
// `#/vorschau` lists every key screen with demo data for review; `#/<screen>` opens one.

const SCREENS = {
  home: 'Grotte',
  laute: 'Laute',
  mehrzahl: 'Mehrzahl',
  luecke: 'Fehlende Buchstaben',
  kurzlang: 'Kurz oder lang',
  ie: 'i oder ie?',
  drachen: 'Drachen',
  willkommen: 'Erster Start',
  belohnung: 'Belohnung',
  'belohnung-ei': 'Belohnung, Ei voll',
  schluepfen: 'Ei schlüpft',
  'drachen-demo': 'Drachen (Demo)',
} as const
type Screen = keyof typeof SCREENS

const route = () => location.hash.replace(/^#\/?/, '')

function useRoute() {
  const [r, setR] = useState(route())
  useEffect(() => {
    const on = () => setR(route())
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return r
}

const go = (r: string) => (location.hash = `#/${r}`)

const noop = () => {}

/** Home, with the two moments that come first: naming the child, and a ready egg. */
function HomeScreen() {
  const { data, setChildName, hatchDragon } = useGame()
  const p = data.profile
  // Keeps the hatch open for its last beat ("Hallo, Funkel!") after the egg is saved as a dragon.
  const [hatching, setHatching] = useState<string>()
  if (!p.childName) return <Welcome onName={setChildName} />
  const kind = p.pendingHatch ?? hatching
  if (kind) {
    return (
      <Hatch
        key={kind}
        kind={kind}
        onName={(name) => {
          const open = nextLand(p)
          setHatching(kind)
          hatchDragon(name)
          return LANDS.find((l) => l.id === open)
        }}
        onDone={() => setHatching(undefined)}
      />
    )
  }
  const last = p.lastLand && isUnlocked(p, p.lastLand) ? p.lastLand : UNLOCK_ORDER[0]
  return (
    <Home
      name={p.childName}
      crystals={p.crystals}
      isOpen={(l) => isUnlocked(p, l)}
      next={nextLand(p)}
      onStart={() => go(last)}
      onLand={go}
      onDragons={() => go('drachen')}
    />
  )
}

/** A land the child hasn't opened yet (e.g. an old bookmark) goes back home. */
function LandScreen({ land }: { land: LandId }) {
  const { profile } = useGame().data
  useEffect(() => {
    if (!isUnlocked(profile, land)) go('')
  }, [])
  return isUnlocked(profile, land) ? <Session key={land} type={land} onExit={() => go('')} /> : null
}

function CollectionScreen() {
  const { profile } = useGame().data
  return <Collection profile={profile} onBack={() => go('')} />
}

const DEMO: Profile = {
  ...emptyProfile(),
  childName: 'Kim',
  crystals: 412,
  eggCrystals: 64,
  rounds: 30,
  dragons: [
    { id: 'a', kind: 'perle', name: 'Perla', hatchedAt: 0, roundsAtHatch: 0 },
    { id: 'b', kind: 'wrack', name: 'Funkel', hatchedAt: 0, roundsAtHatch: 12 },
    { id: 'c', kind: 'tang', name: 'Blubb', hatchedAt: 0, roundsAtHatch: 26 },
  ],
}

function render(s: Screen) {
  switch (s) {
    case 'home':
      return <HomeScreen />
    case 'laute':
    case 'mehrzahl':
    case 'luecke':
    case 'kurzlang':
    case 'ie':
      return <LandScreen land={s} />
    case 'drachen':
      return <CollectionScreen />
    case 'willkommen':
      return <Welcome onName={noop} />
    case 'belohnung':
    case 'belohnung-ei':
      return (
        <Reward
          score={9}
          total={10}
          crystals={26}
          bonus={10}
          egg={{ filled: s === 'belohnung' ? 64 : 0, of: 100, ready: s === 'belohnung-ei' }}
          dragon={{ kind: 'wrack', name: 'Funkel', stage: 'young' }}
          onAgain={noop}
          onHome={noop}
          onHatch={noop}
        />
      )
    case 'schluepfen':
      return <Hatch kind="welle" onName={() => LANDS[2]} onDone={noop} />
    case 'drachen-demo':
      return <Collection profile={DEMO} onBack={noop} />
  }
}

export function App() {
  const r = useRoute()

  let body
  if (r === 'vorschau') {
    body = (
      <>
        <nav class="preview-nav" aria-label="Vorschau">
          {(Object.keys(SCREENS) as Screen[]).map((s) => (
            <a href={`#/${s}`}>{SCREENS[s]}</a>
          ))}
        </nav>
        {(Object.keys(SCREENS) as Screen[]).map((s) => (
          <div class="preview-screen" id={`v-${s}`}>
            {render(s)}
          </div>
        ))}
      </>
    )
  } else if (r in SCREENS) {
    body = render(r as Screen)
  } else {
    body = render('home')
  }

  return (
    <GameProvider seed={SEED}>
      {body}
      <UpdatePrompt />
    </GameProvider>
  )
}
