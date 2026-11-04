import { useEffect, useState } from 'preact/hooks'
import { UpdatePrompt } from './UpdatePrompt.tsx'
import { TEST_ITEMS } from './content/test-items.ts'
import { GameProvider, useGame } from './engine/game.tsx'
import { Collection } from './screens/Collection.tsx'
import { Home } from './screens/Home.tsx'
import { Reward } from './screens/Reward.tsx'
import { Session } from './screens/Session.tsx'
import { ShortLong } from './screens/ShortLong.tsx'
import { Sort } from './screens/Sort.tsx'

// Home and the Mehrzahl round run on the engine (Part 3, test items until Part 5).
// The other screens still show demo data until Parts 4 and 6.
// `#/vorschau` lists every key screen for the parent to review; `#/<screen>` opens one.

const SCREENS = {
  home: 'Grotte',
  mehrzahl: 'Mehrzahl + Tastatur',
  laute: 'Laute sortieren',
  kurzlang: 'Kurz oder lang',
  belohnung: 'Belohnung',
  schluepfen: 'Ei schlüpft',
  drachen: 'Drachen',
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

function HomeScreen() {
  const { profile } = useGame().data
  return (
    <Home
      name={profile.childName || undefined}
      crystals={profile.crystals}
      unlocked={profile.unlockedWorlds.length}
      onStart={() => go('mehrzahl')}
    />
  )
}

function render(s: Screen) {
  switch (s) {
    case 'home':
      return <HomeScreen />
    case 'mehrzahl':
      return <Session type="mehrzahl" onExit={() => go('')} />
    case 'laute':
      return <Sort onExit={() => go('')} />
    case 'kurzlang':
      return <ShortLong onExit={() => go('')} />
    case 'belohnung':
      return (
        <Reward
          score={9}
          total={10}
          crystals={26}
          onAgain={noop}
          onHome={noop}
          egg={{ filled: 3, of: 4, caption: 'Noch eine Runde, dann schlüpft dein Ei!' }}
        />
      )
    case 'schluepfen':
      return <Reward hatch />
    case 'drachen':
      return <Collection />
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
    <GameProvider seed={TEST_ITEMS}>
      {body}
      <UpdatePrompt />
    </GameProvider>
  )
}
