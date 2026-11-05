import { useEffect, useRef, useState } from 'preact/hooks'
import { useRegisterSW } from 'virtual:pwa-register/preact'
import { T } from './strings.ts'

// Check for a new service worker every hour while the app is open.
const UPDATE_CHECK_MS = 60 * 60 * 1000
// If the new worker never reports that it took over (seen on iOS), reload anyway.
const RELOAD_FALLBACK_MS = 10_000

export function UpdatePrompt() {
  const reg = useRef<ServiceWorkerRegistration | undefined>(undefined)
  const [progress, setProgress] = useState<number>()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      reg.current = registration
      setInterval(() => registration.update(), UPDATE_CHECK_MS)
      // iOS standalone apps resume rather than reload – check on return too.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update()
      })
    },
  })

  // While updating, the bar creeps toward 90% so it never looks stuck; real phases push it on.
  const updating = progress !== undefined
  const shown = progress ?? 0
  useEffect(() => {
    if (!updating) return
    const creep = setInterval(() => setProgress((p) => (p! >= 0.9 ? p : p! + (0.9 - p!) * 0.12)), 250)
    const fallback = setTimeout(() => location.reload(), RELOAD_FALLBACK_MS)
    return () => {
      clearInterval(creep)
      clearTimeout(fallback)
    }
  }, [updating])

  if (!needRefresh) return null

  const update = () => {
    setProgress(0.15)
    const worker = reg.current?.waiting
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'activating') setProgress((p) => Math.max(p!, 0.6))
      if (worker.state === 'activated') setProgress(1)
    })
    void updateServiceWorker(true)
  }

  return (
    <div class="plaque update-banner" role="status" data-updating={updating ? '' : undefined}>
      <span>{updating ? T.updating : T.updateReady}</span>
      {updating ? (
        <div
          class="update-bar"
          role="progressbar"
          aria-label={T.updating}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(shown * 100)}
        >
          <span style={{ width: `${shown * 100}%` }} />
        </div>
      ) : (
        <button type="button" class="btn-gold" onClick={update}>
          {T.updateNow}
        </button>
      )}
    </div>
  )
}
