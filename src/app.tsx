import { useEffect, useState } from 'preact/hooks'
import { UpdatePrompt } from './UpdatePrompt.tsx'
import { LANDS } from './lands.ts'
import { TEST_ITEMS } from './content/test-items.ts'
import { GameProvider, useGame } from './engine/game.tsx'
import { Collection } from './screens/Collection.tsx'
import { Home } from './screens/Home.tsx'
import { Reward } from './screens/Reward.tsx'
import { Session } from './screens/Session.tsx'

// Home and the five exercise rounds run on the engine (test items until Part 5).
// Reward, hatching and the collection still show demo data until Part 6.
// `#/vorschau` lists every key screen for the parent to review; `#/<screen>` opens one.

const SCREENS = {
  home: 'Grotte',
  laute: 'Laute',
  mehrzahl: 'Mehrzahl',
  luecke: 'Fehlende Buchstaben',
  kurzlang: 'Kurz oder lang',
  ie: 'Wörter mit ie',
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
      // All five lands stay open until Part 6 adds unlocking by progress.
      unlocked={LANDS.length}
      onStart={() => go('mehrzahl')}
      onLand={go}
    />
  )
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
      return <Session key={s} type={s} onExit={() => go('')} />
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
