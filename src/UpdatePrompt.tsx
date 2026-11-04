import { useRegisterSW } from 'virtual:pwa-register/preact'

// Check for a new service worker every hour while the app is open.
const UPDATE_CHECK_MS = 60 * 60 * 1000

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      setInterval(() => registration.update(), UPDATE_CHECK_MS)
      // iOS standalone apps resume rather than reload – check on return too.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update()
      })
    },
  })

  if (!needRefresh) return null

  return (
    <div class="update-banner" role="status">
      <span>Neue Version verfügbar</span>
      <button type="button" onClick={() => updateServiceWorker(true)}>
        Aktualisieren
      </button>
    </div>
  )
}
