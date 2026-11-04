import { render } from 'preact'
import './index.css'
import { App } from './app.tsx'

// iOS Safari only shows :active on touch when a touch listener exists.
document.addEventListener('touchstart', () => {}, { passive: true })

render(<App />, document.getElementById('app')!)
