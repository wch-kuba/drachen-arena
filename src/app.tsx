import { useEffect, useState } from 'preact/hooks'
import { UpdatePrompt } from './UpdatePrompt.tsx'
import { LANDS, type LandId } from './lands.ts'
import { SEED } from './content/seed.ts'
import { GameProvider, useGame } from './engine/game.tsx'
import { eggKind, goalLeft, goalOf, isUnlocked, nextLand, STAGES, UNLOCK_ORDER } from './engine/rewards.ts'
import { atmosphereHere } from './engine/sfx.ts'
import { emptyProfile } from './engine/storage.ts'
import type { Profile } from './engine/types.ts'
import { Collection } from './screens/Collection.tsx'
import { Grow } from './screens/Grow.tsx'
import { Hatch } from './screens/Hatch.tsx'
import { Home } from './screens/Home.tsx'
import type { OnHoard } from './ui/art.tsx'
import { T } from './strings.ts'
import { Reward, type RewardGoal } from './screens/Reward.tsx'
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
  'belohnung-drache': 'Belohnung, Drache wird gefüttert',
  'belohnung-satt': 'Belohnung, Drache satt',
  schluepfen: 'Ei schlüpft',
  wachsen: 'Drache wächst',
  'wachsen-gross': 'Drache wird groß, neues Ei',
  'grotte-drache': 'Grotte, Drache wird gefüttert (Demo)',
  'grotte-ei': 'Grotte, großer Drache mit Ei (Demo)',
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

/** Home, with the moments that come first: naming the child, a ready egg, a dragon that grew. */
function HomeScreen() {
  const game = useGame()
  const { data, setChildName, hatchDragon } = game
  const p = data.profile
  // Keeps the hatch open for its last beat ("Hallo, Funkel!") after the egg is saved as a dragon.
  const [hatching, setHatching] = useState<string>()
  // The atmosphere (music + water) plays on Home, not over the welcome or the hatch.
  const home = !!p.childName && !p.pendingHatch && !p.pendingGrowth && !hatching
  useEffect(() => (home ? atmosphereHere() : undefined), [home])
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
  const grew = p.pendingGrowth && p.dragons.find((d) => d.id === p.pendingGrowth!.id)
  if (p.pendingGrowth && grew) {
    const land = p.pendingGrowth.land
    return (
      <Grow
        key={`${grew.id}-${grew.stage}`}
        dragon={grew}
        land={LANDS.find((l) => l.id === land)}
        nextEgg={'egg' in goalOf(p) ? eggKind(p) : undefined}
        onDone={game.seeGrowth}
      />
    )
  }
  const last = p.lastLand && isUnlocked(p, p.lastLand) ? p.lastLand : UNLOCK_ORDER[0]
  const { on, hint, step } = homeGoal(p)
  return (
    <Home
      name={p.childName}
      crystals={p.crystals}
      on={on}
      isOpen={(l) => isUnlocked(p, l)}
      next={nextLand(p)}
      nextHint={hint}
      nextStep={step}
      onStart={() => go(last)}
      onLand={go}
      onDragons={() => go('drachen')}
      sound={p.sound}
      ambient={p.ambient}
      onSound={game.setSound}
      onAmbient={game.setAmbient}
    />
  )
}

/** The goal on the hoard: the dragon being fed, or the egg (against the newest dragon, if any). */
function homeGoal(p: Profile): { on: OnHoard; hint: string; step: string } {
  const goal = goalOf(p)
  const newest = p.dragons.at(-1)
  const left = goalLeft(p)
  if ('dragon' in goal) {
    const d = goal.dragon
    const next = STAGES[STAGES.indexOf(d.stage) + 1]
    return { on: { dragon: d }, hint: T.nextGrow(d.name), step: T.growsInto(left, d.name, T.stageInText[next]) }
  }
  if ('egg' in goal) return { on: { dragon: newest, egg: goal.egg }, hint: T.nextEgg, step: T.eggLeft(left) }
  // 'done' always has a newest dragon: every dragon is found and grown.
  return { on: { dragon: newest }, hint: T.locked, step: newest ? T.fullGrown(newest.name, T.stageInText.grown) : '' }
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
  goalCrystals: 64,
  rounds: 30,
  dragons: [
    { id: 'a', kind: 'perle', name: 'Perla', hatchedAt: 0, stage: 'grown' },
    { id: 'b', kind: 'wrack', name: 'Funkel', hatchedAt: 0, stage: 'grown' },
    { id: 'c', kind: 'tang', name: 'Blubb', hatchedAt: 0, stage: 'young' },
  ],
  unlockedWorlds: ['mehrzahl', 'luecke', 'ie', 'laute', 'kurzlang'],
}

/** The demo after Blubb is grown too: the next egg fills. */
const DEMO_EGG: Profile = { ...DEMO, dragons: DEMO.dragons.map((d) => ({ ...d, stage: 'grown' })) }

const demoReward = (goal: RewardGoal, filled: number, ready = false) => (
  <Reward score={9} total={10} crystals={26} bonus={10} goal={goal} filled={filled} of={100} ready={ready} onAgain={noop} onHome={noop} onReady={noop} />
)

const demoHome = (p: Profile) => (
  <Home
    name={p.childName}
    crystals={p.crystals}
    on={homeGoal(p).on}
    isOpen={(l) => isUnlocked({ ...p, unlockedWorlds: ['mehrzahl', 'luecke'] }, l)}
    next="ie"
    nextHint={homeGoal(p).hint}
    nextStep={homeGoal(p).step}
    onStart={noop}
    onLand={noop}
    onDragons={noop}
    sound
    ambient={false}
    onSound={noop}
    onAmbient={noop}
  />
)

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
      return demoReward({ egg: 'tang' }, 64)
    case 'belohnung-ei':
      return demoReward({ egg: 'tang' }, 100, true)
    case 'belohnung-drache':
      return demoReward({ dragon: { kind: 'wrack', name: 'Funkel', stage: 'hatchling' } }, 60)
    case 'belohnung-satt':
      return demoReward({ dragon: { kind: 'wrack', name: 'Funkel', stage: 'young' } }, 100, true)
    case 'schluepfen':
      return <Hatch kind="welle" onName={() => LANDS[2]} onDone={noop} />
    case 'wachsen':
      return <Grow key={s} dragon={{ kind: 'wrack', name: 'Funkel', stage: 'young' }} land={LANDS[2]} onDone={noop} />
    case 'wachsen-gross':
      return <Grow key={s} dragon={{ kind: 'wrack', name: 'Funkel', stage: 'grown' }} land={LANDS[3]} nextEgg="tang" onDone={noop} />
    case 'grotte-drache':
      return demoHome(DEMO)
    case 'grotte-ei':
      return demoHome(DEMO_EGG)
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
