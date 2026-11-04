import { useEffect, useState } from 'preact/hooks'
import { UpdatePrompt } from './UpdatePrompt.tsx'
import { Collection } from './screens/Collection.tsx'
import { Home } from './screens/Home.tsx'
import { Plural } from './screens/Plural.tsx'
import { Reward } from './screens/Reward.tsx'
import { ShortLong } from './screens/ShortLong.tsx'
import { Sort } from './screens/Sort.tsx'

// Until the engine (Part 3) lands, the app shows the Drachenhort world with demo data.
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

function render(s: Screen) {
  switch (s) {
    case 'home':
      return <Home crystals={128} unlocked={3} onStart={() => go('mehrzahl')} />
    case 'mehrzahl':
      return <Plural onExit={() => go('')} />
    case 'laute':
      return <Sort onExit={() => go('')} />
    case 'kurzlang':
      return <ShortLong onExit={() => go('')} />
    case 'belohnung':
      return <Reward />
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
    <>
      {body}
      <UpdatePrompt />
    </>
  )
}
