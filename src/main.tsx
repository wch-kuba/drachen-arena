import { render } from 'preact'
import './index.css'
import { App } from './app.tsx'

// iOS Safari only shows :active on touch when a touch listener exists.
document.addEventListener('touchstart', () => {}, { passive: true })

// No zoom. iOS ignores user-scalable=no for pinch, so the pinch gesture is stopped here;
// double-tap zoom is off through touch-action in index.css.
for (const g of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(g, (e) => e.preventDefault(), { passive: false })
}

render(<App />, document.getElementById('app')!)
